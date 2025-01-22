import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe/server";

/**
 * GET - Fetch products (local DB + synced with Stripe)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subAccountId = searchParams.get("subAccountId");
    const source = searchParams.get("source"); // 'local' or 'stripe'

    console.log("[Products API] GET request:", { subAccountId, source, url: req.url });

    if (!subAccountId) {
      return NextResponse.json(
        { error: "subAccountId is required" },
        { status: 400 }
      );
    }

    // Get the subaccount's connected Stripe account
    const subAccount = await db.subAccount.findUnique({
      where: { id: subAccountId },
      select: {
        connectAccountId: true,
        agencyId: true
      },
    });

    const stripeConnected = !!subAccount?.connectAccountId;

    // Get local products from DB
    const localProducts = await db.product.findMany({
      where: { subAccountId },
      orderBy: { createdAt: "desc" },
    });

    // If only local products requested, return them with connection status
    if (source === "local") {
      return NextResponse.json({
        products: localProducts,
        stripeConnected,
        agencyId: subAccount?.agencyId,
      });
    }

    if (!stripeConnected) {
      return NextResponse.json({
        products: localProducts,
        stripeConnected: false,
        message: "Stripe Connect not set up",
      });
    }

    // If Stripe products requested, fetch from Stripe
    if (source === "stripe") {
      const stripeProducts = await stripe.products.list(
        {
          active: true,
          limit: 100,
          expand: ["data.default_price"],
        },
        {
          stripeAccount: subAccount.connectAccountId!,
        }
      );

      const formattedProducts = stripeProducts.data.map((product) => {
        const defaultPrice = product.default_price as Stripe.Price | null;
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
          priceId: defaultPrice?.id || null,
          priceAmount: defaultPrice?.unit_amount
            ? defaultPrice.unit_amount / 100
            : null,
          currency: defaultPrice?.currency?.toUpperCase() || "NPR",
          recurring: defaultPrice?.recurring?.interval || null,
        };
      });

      return NextResponse.json({
        products: formattedProducts,
        stripeConnected: true,
        agencyId: subAccount?.agencyId,
      });
    }

    // Return local products with Stripe connection status
    return NextResponse.json({
      products: localProducts,
      stripeConnected: true,
      agencyId: subAccount?.agencyId,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a product (optionally synced with Stripe)
 * If Stripe Connect is not set up, creates local-only product
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subAccountId, name, price, description, image, recurring, currency = "npr", localOnly } = body;

    if (!subAccountId || !name || !price) {
      return NextResponse.json(
        { error: "subAccountId, name, and price are required" },
        { status: 400 }
      );
    }

    // Get the subaccount's connected Stripe account
    const subAccount = await db.subAccount.findUnique({
      where: { id: subAccountId },
      select: { connectAccountId: true },
    });

    const hasStripeConnect = !!subAccount?.connectAccountId;

    // Truncate description to prevent database errors (max 1000 chars)
    const truncatedDescription = description && description.length > 1000
      ? description.substring(0, 1000)
      : description;

    // If localOnly flag or no Stripe Connect, create local product only
    if (localOnly || !hasStripeConnect) {
      const localProduct = await db.product.create({
        data: {
          name,
          price,
          description: truncatedDescription,
          image,
          recurring,
          currency: currency.toUpperCase(),
          subAccountId,
        },
      });

      return NextResponse.json({
        success: true,
        product: localProduct,
        stripeConnected: false,
        message: hasStripeConnect
          ? "Product created locally"
          : "Product created (connect Stripe in Launchpad to enable checkout)",
      });
    }

    // Create product in Stripe
    const stripeProduct = await stripe.products.create(
      {
        name,
        description: truncatedDescription || undefined,
        images: image ? [image] : undefined,
      },
      {
        stripeAccount: subAccount.connectAccountId!,
      }
    );

    // Create price in Stripe
    const priceInCents = Math.round(parseFloat(price) * 100);
    const stripePrice = await stripe.prices.create(
      {
        product: stripeProduct.id,
        unit_amount: priceInCents,
        currency: currency.toLowerCase(),
        ...(recurring && {
          recurring: {
            interval: recurring as "month" | "year",
          },
        }),
      },
      {
        stripeAccount: subAccount.connectAccountId!,
      }
    );

    // Set as default price
    await stripe.products.update(
      stripeProduct.id,
      {
        default_price: stripePrice.id,
      },
      {
        stripeAccount: subAccount.connectAccountId!,
      }
    );

    // Save to local DB with Stripe IDs
    const localProduct = await db.product.create({
      data: {
        name,
        price,
        description: truncatedDescription,
        image,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        recurring,
        currency: currency.toUpperCase(),
        subAccountId,
      },
    });

    return NextResponse.json({
      success: true,
      product: localProduct,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      stripeConnected: true,
    });
  } catch (error: any) {
    console.error("Error creating product:", error);

    // Return more specific error for Stripe errors
    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: error.message || "Invalid Stripe request" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a product from Stripe and local DB
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const subAccountId = searchParams.get("subAccountId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Get the product
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { subAccount: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Archive in Stripe if it has a Stripe ID
    if (product.stripeProductId && product.subAccount.connectAccountId) {
      try {
        await stripe.products.update(
          product.stripeProductId,
          { active: false },
          { stripeAccount: product.subAccount.connectAccountId }
        );
      } catch (stripeError) {
        console.error("Failed to archive in Stripe:", stripeError);
        // Continue to delete locally even if Stripe fails
      }
    }

    // Delete from local DB
    await db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

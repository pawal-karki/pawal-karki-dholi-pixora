import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe/server";
import { validateCartAgency } from "@/lib/stripe/validate-cart-agency";

/**
 * Checkout session creator for funnel payments.
 * Supports both embedded mode (payment element) and redirect mode (cart checkout).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subAccountConnectedId,
      prices,
      subAccountId,
      mode = "embedded", // 'embedded' or 'redirect'
      successUrl,
      cancelUrl,
    } = body ?? {};

    // Validate all products belong to same agency
    if (subAccountId && prices?.length > 0) {
      const validation = await validateCartAgency(prices, subAccountId);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || "Products from different agencies cannot be purchased together" },
          { status: 400 }
        );
      }
    }

    if (!subAccountConnectedId && subAccountId) {
      // Try to get connect ID from subaccount
      const subAccount = await db.subAccount.findUnique({
        where: { id: subAccountId },
        select: { connectAccountId: true },
      });

      if (!subAccount?.connectAccountId) {
        return NextResponse.json(
          { error: "Stripe Connect not configured for this subaccount" },
          { status: 400 }
        );
      }

      body.subAccountConnectedId = subAccount.connectAccountId;
    }

    const connectAccountId = body.subAccountConnectedId || subAccountConnectedId;

    if (!connectAccountId || !Array.isArray(prices) || !prices.length) {
      return NextResponse.json(
        { error: "subAccountConnectedId and prices[] are required" },
        { status: 400 }
      );
    }

    const line_items = prices.map((p: any) => ({
      price: p?.priceId ?? p?.id ?? p,
      quantity: Number(p?.quantity ?? 1),
    }));

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

    if (mode === "redirect") {
      // Redirect mode - used for cart checkout
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          line_items,
          billing_address_collection: "required",
          success_url: successUrl || `${normalizedBaseUrl}checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || `${normalizedBaseUrl}checkout/canceled`,
          metadata: {
            ...(subAccountId && { subAccountId }),
          },
          payment_intent_data: {
            metadata: {
              ...(subAccountId && { subAccountId }),
            },
          },
        },
        { stripeAccount: connectAccountId }
      );

      return NextResponse.json({
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    }

    // Embedded mode - used for payment element
    const returnUrl = `${normalizedBaseUrl}checkout/return?session_id={CHECKOUT_SESSION_ID}${subAccountId ? `&subaccountId=${encodeURIComponent(subAccountId)}` : ""
      }`;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        ui_mode: "embedded",
        line_items,
        billing_address_collection: "required",
        return_url: returnUrl,
        metadata: {
          ...(subAccountId && { subAccountId }),
        },
        payment_intent_data: {
          metadata: {
            ...(subAccountId && { subAccountId }),
          },
        },
      },
      { stripeAccount: connectAccountId }
    );

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "Stripe session missing client_secret" },
        { status: 500 }
      );
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create session";
    console.error("Checkout session error:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

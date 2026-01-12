import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe/server";

// Stripe webhook handler
export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    console.error("[Stripe Webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") return;

  const { agencyId, priceId } = session.metadata ?? {};
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!agencyId || !subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const plan = await getPlanFromPriceId(priceId || subscription.items.data[0]?.price.id || "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodEnd = (subscription as any).current_period_end;

  await db.subscription.upsert({
    where: { agencyId },
    create: {
      agencyId,
      subscritiptionId: subscriptionId,
      customerId,
      priceId: priceId || subscription.items.data[0]?.price.id || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plan: plan as any,
      price: subscription.items.data[0]?.price.unit_amount?.toString() || null,
      active: ["active", "trialing"].includes(subscription.status),
      currentPeriodEndDate: new Date(periodEnd * 1000),
    },
    update: {
      subscritiptionId: subscriptionId,
      customerId,
      priceId: priceId || subscription.items.data[0]?.price.id || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plan: plan as any,
      price: subscription.items.data[0]?.price.unit_amount?.toString() || null,
      active: ["active", "trialing"].includes(subscription.status),
      currentPeriodEndDate: new Date(periodEnd * 1000),
    },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  const agency = await db.agency.findFirst({ where: { customerId } });
  if (!agency) return;

  const plan = await getPlanFromPriceId(priceId || "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodEnd = (subscription as any).current_period_end;

  await db.subscription.upsert({
    where: { agencyId: agency.id },
    create: {
      agencyId: agency.id,
      subscritiptionId: subscription.id,
      customerId,
      priceId: priceId || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plan: plan as any,
      price: subscription.items.data[0]?.price.unit_amount?.toString() || null,
      active: ["active", "trialing"].includes(subscription.status),
      currentPeriodEndDate: new Date(periodEnd * 1000),
    },
    update: {
      priceId: priceId || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plan: plan as any,
      price: subscription.items.data[0]?.price.unit_amount?.toString() || null,
      active: ["active", "trialing"].includes(subscription.status),
      currentPeriodEndDate: new Date(periodEnd * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db.subscription.updateMany({
    where: { subscritiptionId: subscription.id },
    data: { active: false },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription as string | null;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodEnd = (subscription as any).current_period_end;

  await db.subscription.updateMany({
    where: { subscritiptionId: subscriptionId },
    data: {
      active: true,
      currentPeriodEndDate: new Date(periodEnd * 1000),
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription as string | null;
  if (!subscriptionId) return;

  console.error(`[Stripe] Payment failed for subscription: ${subscriptionId}`);
}

async function getPlanFromPriceId(priceId: string): Promise<string | null> {
  if (!priceId) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planPrice = await (db as any).planPrice.findFirst({ where: { priceId } });

  if (planPrice) {
    switch (planPrice.key) {
      case "PRO": return "price_PRO_PLAN";
      case "AGENCY": return "price_AGENCY_PLAN";
    }
  }

  return null;
}

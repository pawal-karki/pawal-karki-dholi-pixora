"use server";

import { updateAgencyConnectedId } from "@/lib/queries";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe/server";

interface StripeResult {
  success: boolean;
  error?: string;
}

interface CheckoutResult {
  url: string;
  sessionId: string;
}

/**
 * Connect Stripe account to agency via OAuth
 */
export async function connectStripeAccount(
  agencyId: string,
  code: string
): Promise<StripeResult> {
  try {
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    if (!response.stripe_user_id) {
      return { success: false, error: "No Stripe account ID received" };
    }

    await updateAgencyConnectedId(agencyId, response.stripe_user_id);
    return { success: true };
  } catch (err) {
    console.error("[Stripe] Connect account error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

/**
 * Connect Stripe account to subaccount via OAuth
 */
export async function connectStripeSubAccount(
  subAccountId: string,
  code: string
): Promise<StripeResult> {
  try {
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    if (!response.stripe_user_id) {
      return { success: false, error: "No Stripe account ID received" };
    }

    await db.subAccount.update({
      where: { id: subAccountId },
      data: { connectAccountId: response.stripe_user_id },
    });

    return { success: true };
  } catch (err) {
    console.error("[Stripe] Connect subaccount error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

/**
 * Create redirect checkout session for agency subscription
 */
export async function createAgencySubscriptionCheckout(params: {
  agencyId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutResult> {
  const { agencyId, priceId, successUrl, cancelUrl } = params;

  const agency = await db.agency.findUnique({ where: { id: agencyId } });
  if (!agency) {
    throw new Error("Agency not found");
  }

  // Get or create Stripe customer
  let customerId = agency.customerId || "";
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: agency.companyEmail,
      name: agency.name || undefined,
      metadata: { agencyId },
    });
    customerId = customer.id;

    await db.agency.update({
      where: { id: agencyId },
      data: { customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    billing_address_collection: "required",
    payment_method_collection: "always",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { agencyId, priceId },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return { url: session.url, sessionId: session.id };
}

/**
 * Sync subscription from checkout session (fallback when webhooks not configured)
 */
export async function syncSubscriptionFromSession(
  sessionId: string,
  agencyId: string
): Promise<StripeResult> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return { success: false, error: "Payment not completed" };
    }

    if (!session.subscription) {
      return { success: false, error: "No subscription found" };
    }

    const subscriptionId = typeof session.subscription === "string" 
      ? session.subscription 
      : session.subscription.id;
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id || "";
    const customerId = session.customer as string;

    // Keep only one active subscription for this customer to avoid double charges on upgrade.
    await cancelOtherActiveSubscriptions(customerId, subscriptionId);
    
    // Get plan from priceId
    const planPrice = await db.planPrice.findFirst({ where: { priceId } });
    let plan: string | null = null;
    if (planPrice) {
      switch (planPrice.key) {
        case "PRO": plan = "price_PRO_PLAN"; break;
        case "AGENCY": plan = "price_AGENCY_PLAN"; break;
      }
    }

    // Get current period end - handle different Stripe API versions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subData = subscription as any;
    const periodEndTimestamp = subData.current_period_end || subData.currentPeriodEnd;
    
    // Default to 30 days from now if period end not available
    const currentPeriodEndDate = periodEndTimestamp && !isNaN(periodEndTimestamp)
      ? new Date(periodEndTimestamp * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Upsert subscription
    await db.subscription.upsert({
      where: { agencyId },
      create: {
        agencyId,
        subscritiptionId: subscriptionId,
        customerId,
        priceId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plan: plan as any,
        price: subscription.items.data[0]?.price.unit_amount?.toString() || null,
        active: ["active", "trialing"].includes(subscription.status),
        currentPeriodEndDate,
      },
      update: {
        subscritiptionId: subscriptionId,
        customerId,
        priceId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plan: plan as any,
        price: subscription.items.data[0]?.price.unit_amount?.toString() || null,
        active: ["active", "trialing"].includes(subscription.status),
        currentPeriodEndDate,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("[Stripe] Sync subscription error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Sync failed",
    };
  }
}

async function cancelOtherActiveSubscriptions(
  customerId: string,
  keepSubscriptionId: string
) {
  if (!customerId || !keepSubscriptionId) return;

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });

  const toCancel = subscriptions.data.filter(
    (sub) =>
      sub.id !== keepSubscriptionId &&
      !["canceled", "incomplete_expired"].includes(sub.status)
  );

  for (const sub of toCancel) {
    try {
      await stripe.subscriptions.cancel(sub.id);
    } catch (error) {
      console.error(`[Stripe] Failed to cancel old subscription ${sub.id}:`, error);
    }
  }
}

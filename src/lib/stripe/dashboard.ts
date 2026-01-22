import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe/server";

export interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  created: Date;
  type: "charge" | "refund" | "payout" | "subscription";
  customerEmail?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  potentialIncome: number;
  transactionCount: number;
  currency: string;
}

/**
 * Get Stripe Connect balance for an agency
 */
export async function getStripeConnectBalance(connectAccountId: string): Promise<number> {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectAccountId,
    });

    // Get available balance in the default currency
    const available = balance.available.reduce((sum, b) => sum + b.amount, 0);
    return available / 100; // Convert from cents
  } catch (error) {
    console.error("Error fetching Stripe balance:", error);
    return 0;
  }
}

/**
 * Get recent transactions from Stripe Connect account
 */
export async function getStripeTransactions(
  connectAccountId: string,
  limit: number = 10
): Promise<TransactionData[]> {
  try {
    // Get charges from the connected account
    const charges = await stripe.charges.list(
      {
        limit,
        expand: ["data.customer"],
      },
      {
        stripeAccount: connectAccountId,
      }
    );

    return charges.data.map((charge) => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      description: charge.description || charge.metadata?.description || "Payment",
      status: charge.status,
      created: new Date(charge.created * 1000),
      type: "charge" as const,
      customerEmail:
        typeof charge.customer === "object" && charge.customer
          ? (charge.customer as Stripe.Customer).email || undefined
          : undefined,
    }));
  } catch (error) {
    console.error("Error fetching Stripe transactions:", error);
    return [];
  }
}

/**
 * Get total revenue for a year from Stripe Connect
 */
export async function getYearlyRevenue(
  connectAccountId: string,
  year: number = new Date().getFullYear()
): Promise<number> {
  try {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const charges = await stripe.charges.list(
      {
        created: {
          gte: Math.floor(startOfYear.getTime() / 1000),
          lte: Math.floor(endOfYear.getTime() / 1000),
        },
        limit: 100,
      },
      {
        stripeAccount: connectAccountId,
      }
    );

    // Sum up successful charges
    const total = charges.data
      .filter((charge) => charge.status === "succeeded")
      .reduce((sum, charge) => sum + charge.amount, 0);

    return total / 100; // Convert from cents
  } catch (error) {
    console.error("Error fetching yearly revenue:", error);
    return 0;
  }
}

/**
 * Calculate potential income from pipeline tickets
 */
export async function getPotentialIncome(agencyId: string): Promise<number> {
  try {
    // Get all subaccounts for the agency
    const subAccounts = await db.subAccount.findMany({
      where: { agencyId },
      select: { id: true },
    });

    if (subAccounts.length === 0) return 0;

    const subAccountIds = subAccounts.map((sa) => sa.id);

    // Get all open tickets with values
    const tickets = await db.ticket.findMany({
      where: {
        lane: {
          pipeline: {
            subAccountId: { in: subAccountIds },
          },
        },
        value: { not: null },
      },
      select: { value: true },
    });

    // Sum up ticket values
    const total = tickets.reduce(
      (sum, ticket) => sum + (ticket.value?.toNumber() || 0),
      0
    );

    return total;
  } catch (error) {
    console.error("Error calculating potential income:", error);
    return 0;
  }
}

/**
 * Get all dashboard metrics for an agency
 */
export async function getAgencyDashboardMetrics(
  agencyId: string,
  connectAccountId: string | null
): Promise<DashboardMetrics> {
  const currentYear = new Date().getFullYear();

  const [totalRevenue, potentialIncome] = await Promise.all([
    connectAccountId ? getYearlyRevenue(connectAccountId, currentYear) : Promise.resolve(0),
    getPotentialIncome(agencyId),
  ]);

  return {
    totalRevenue,
    potentialIncome,
    transactionCount: 0,
    currency: "NPR",
  };
}

/**
 * Get agency's own subscription transaction history
 */
export async function getAgencySubscriptionHistory(agencyId: string) {
  const subscription = await db.subscription.findUnique({
    where: { agencyId },
    include: { agency: true },
  });

  if (!subscription?.customerId) return [];

  try {
    const invoices = await stripe.invoices.list({
      customer: subscription.customerId,
      limit: 10,
    });

    return invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: (invoice.amount_paid || 0) / 100,
      currency: (invoice.currency || "npr").toUpperCase(),
      description: invoice.lines.data[0]?.description || "Subscription Payment",
      status: invoice.status || "unknown",
      created: new Date((invoice.created || 0) * 1000),
      type: "subscription" as const,
      invoicePdf: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
    }));
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    return [];
  }
}

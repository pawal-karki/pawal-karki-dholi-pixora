import type Stripe from "stripe";

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

export type InvoiceLike = {
  id: string;
  subscription: string | null;
  period_start: number;
  created: number;
  status: string | null;
  amount_paid: number;
};

/** Collapse duplicate paid periods; keep newest `created`. */
export function dedupePaidInvoicesByBillingPeriod(
  invoices: InvoiceLike[],
): InvoiceLike[] {
  const paid = invoices.filter(
    (inv) => inv.status === "paid" && inv.amount_paid > 0 && inv.subscription,
  );

  const byPeriod = new Map<string, InvoiceLike>();
  for (const invoice of paid) {
    const sid = invoice.subscription!;
    const periodKey =
      invoice.period_start > 0
        ? `${sid}:${invoice.period_start}`
        : invoice.id;
    const existing = byPeriod.get(periodKey);
    if (!existing || invoice.created > existing.created) {
      byPeriod.set(periodKey, invoice);
    }
  }

  return Array.from(byPeriod.values()).sort((a, b) => b.created - a.created);
}

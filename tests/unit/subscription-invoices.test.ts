import { describe, expect, test } from "bun:test";

import {
  dedupePaidInvoicesByBillingPeriod,
  type InvoiceLike,
} from "@/lib/subscription-invoice-utils";

/**
 * Feature: Agency billing history — subscription invoice deduplication.
 */

const inv = (
  partial: Partial<InvoiceLike> & Pick<InvoiceLike, "id">,
): InvoiceLike => ({
  id: partial.id,
  subscription: partial.subscription ?? "sub_1",
  period_start: partial.period_start ?? 1_700_000_000,
  created: partial.created ?? 1,
  status: partial.status ?? "paid",
  amount_paid: partial.amount_paid ?? 999_00,
});

describe("Subscription invoices", () => {
  test("keeps one row per subscription + period_start (newest created wins)", () => {
    const rows = dedupePaidInvoicesByBillingPeriod([
      inv({
        id: "in_old",
        created: 100,
        period_start: 555,
      }),
      inv({
        id: "in_new",
        created: 200,
        period_start: 555,
      }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe("in_new");
  });

  test("drops non-paid and zero amount", () => {
    const rows = dedupePaidInvoicesByBillingPeriod([
      inv({ id: "a", status: "open", amount_paid: 999 }),
      inv({ id: "b", status: "paid", amount_paid: 0 }),
      inv({ id: "c", status: "paid", amount_paid: 100 }),
    ]);
    expect(rows.map((r) => r.id)).toEqual(["c"]);
  });

  test("distinct periods produce distinct rows", () => {
    const rows = dedupePaidInvoicesByBillingPeriod([
      inv({ id: "p1", period_start: 100, created: 10 }),
      inv({ id: "p2", period_start: 200, created: 20 }),
    ]);
    expect(rows).toHaveLength(2);
  });
});

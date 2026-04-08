import type Stripe from "stripe";
import { describe, expect, it } from "bun:test";

import {
  dedupePaidInvoicesByBillingPeriod,
  getInvoiceSubscriptionId,
  type InvoiceLike,
} from "@/lib/subscription-invoice-utils";

function inv(
  partial: Partial<InvoiceLike> & Pick<InvoiceLike, "id">,
): InvoiceLike {
  return {
    id: partial.id,
    subscription: partial.subscription ?? "sub_1",
    period_start: partial.period_start ?? 1_700_000_000,
    created: partial.created ?? 1,
    status: partial.status ?? "paid",
    amount_paid: partial.amount_paid ?? 999_00,
  };
}

describe("subscription-invoice-utils", () => {
  describe("getInvoiceSubscriptionId", () => {
    it("returns string subscription id from invoice", () => {
      const invoice = { subscription: "sub_abc123" } as Stripe.Invoice;
      expect(getInvoiceSubscriptionId(invoice)).toBe("sub_abc123");
    });

    it("returns id when subscription is expanded object", () => {
      const invoice = {
        subscription: { id: "sub_obj456" },
      } as Stripe.Invoice;
      expect(getInvoiceSubscriptionId(invoice)).toBe("sub_obj456");
    });

    it("returns null when subscription is null", () => {
      const invoice = { subscription: null } as Stripe.Invoice;
      expect(getInvoiceSubscriptionId(invoice)).toBeNull();
    });

    it("returns null when subscription is undefined", () => {
      const invoice = {} as Stripe.Invoice;
      expect(getInvoiceSubscriptionId(invoice)).toBeNull();
    });

    it("returns null when subscription is empty string", () => {
      const invoice = { subscription: "" } as Stripe.Invoice;
      expect(getInvoiceSubscriptionId(invoice)).toBeNull();
    });
  });

  describe("dedupePaidInvoicesByBillingPeriod", () => {
    it("keeps newest created per subscription and period_start", () => {
      const rows = dedupePaidInvoicesByBillingPeriod([
        inv({ id: "in_old", created: 100, period_start: 555 }),
        inv({ id: "in_new", created: 200, period_start: 555 }),
      ]);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.id).toBe("in_new");
    });

    it("excludes non-paid status and zero amount_paid", () => {
      const rows = dedupePaidInvoicesByBillingPeriod([
        inv({ id: "a", status: "open", amount_paid: 999 }),
        inv({ id: "b", status: "paid", amount_paid: 0 }),
        inv({ id: "c", status: "paid", amount_paid: 100 }),
      ]);
      expect(rows.map((r) => r.id)).toEqual(["c"]);
    });

    it("keeps separate rows for distinct period_start on same subscription", () => {
      const rows = dedupePaidInvoicesByBillingPeriod([
        inv({ id: "p1", period_start: 100, created: 10 }),
        inv({ id: "p2", period_start: 200, created: 20 }),
      ]);
      expect(rows).toHaveLength(2);
    });

    it("keeps separate rows for different subscriptions same period", () => {
      const rows = dedupePaidInvoicesByBillingPeriod([
        inv({
          id: "inv1",
          subscription: "sub1",
          period_start: 1700000000,
          created: 100,
        }),
        inv({
          id: "inv2",
          subscription: "sub2",
          period_start: 1700000000,
          created: 200,
        }),
      ]);
      expect(rows).toHaveLength(2);
    });

    it("uses invoice id as dedupe key when period_start is 0", () => {
      const rows = dedupePaidInvoicesByBillingPeriod([
        inv({
          id: "inv1",
          subscription: "sub1",
          period_start: 0,
          created: 100,
          amount_paid: 100,
        }),
        inv({
          id: "inv2",
          subscription: "sub1",
          period_start: 0,
          created: 200,
          amount_paid: 100,
        }),
      ]);
      expect(rows).toHaveLength(2);
    });

    it("sorts results by created descending", () => {
      const rows = dedupePaidInvoicesByBillingPeriod([
        inv({
          id: "inv-old",
          subscription: "sub1",
          period_start: 1700000000,
          created: 100,
        }),
        inv({
          id: "inv-mid",
          subscription: "sub1",
          period_start: 1703000000,
          created: 200,
        }),
        inv({
          id: "inv-new",
          subscription: "sub1",
          period_start: 1706000000,
          created: 300,
        }),
      ]);
      expect(rows.map((r) => r.id)).toEqual([
        "inv-new",
        "inv-mid",
        "inv-old",
      ]);
    });

    it("returns empty array for empty input", () => {
      expect(dedupePaidInvoicesByBillingPeriod([])).toEqual([]);
    });

    it("drops rows with null subscription", () => {
      const rows = dedupePaidInvoicesByBillingPeriod([
        {
          id: "inv1",
          subscription: null,
          period_start: 1000,
          created: 500,
          status: "paid",
          amount_paid: 100,
        },
      ]);
      expect(rows).toHaveLength(0);
    });

    it("keeps only paid when mixed with draft, void, open", () => {
      const rows = dedupePaidInvoicesByBillingPeriod([
        inv({
          id: "i1",
          subscription: "s1",
          period_start: 100,
          created: 1,
          amount_paid: 50,
        }),
        inv({
          id: "i2",
          subscription: "s1",
          period_start: 200,
          created: 2,
          status: "void",
          amount_paid: 50,
        }),
        inv({
          id: "i3",
          subscription: "s1",
          period_start: 300,
          created: 3,
          status: "open",
          amount_paid: 50,
        }),
        inv({
          id: "i4",
          subscription: "s1",
          period_start: 400,
          created: 4,
          amount_paid: 50,
        }),
      ]);
      expect(rows.map((r) => r.id)).toEqual(["i4", "i1"]);
    });

    it("prefers higher created when duplicate period and both paid", () => {
      const rows = dedupePaidInvoicesByBillingPeriod([
        {
          id: "inv1",
          subscription: "sub1",
          period_start: 1000,
          created: 500,
          status: "draft",
          amount_paid: 0,
        },
        {
          id: "inv2",
          subscription: "sub1",
          period_start: 1000,
          created: 600,
          status: "paid",
          amount_paid: 100,
        },
      ]);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.id).toBe("inv2");
    });
  });
});

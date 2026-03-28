import { describe, expect, test } from "bun:test";
import {
  dedupePaidInvoicesByBillingPeriod,
  type InvoiceLike,
} from "@/lib/subscription-invoice-utils";

function getInvoiceSubscriptionId(invoice: {
  subscription?: string | { id: string } | null;
}): string | null {
  const sub = invoice.subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

describe("Subscription invoice utilities — full coverage", () => {
  describe("getInvoiceSubscriptionId", () => {
    test("returns string subscription ID directly", () => {
      expect(getInvoiceSubscriptionId({ subscription: "sub_abc123" })).toBe("sub_abc123");
    });

    test("returns id from subscription object", () => {
      expect(getInvoiceSubscriptionId({ subscription: { id: "sub_obj456" } })).toBe("sub_obj456");
    });

    test("returns null when subscription is null", () => {
      expect(getInvoiceSubscriptionId({ subscription: null })).toBeNull();
    });

    test("returns null when subscription is undefined", () => {
      expect(getInvoiceSubscriptionId({})).toBeNull();
    });

    test("returns null for empty string subscription", () => {
      expect(getInvoiceSubscriptionId({ subscription: "" })).toBeNull();
    });
  });

  describe("dedupePaidInvoicesByBillingPeriod", () => {
    test("filters out unpaid invoices", () => {
      const invoices: InvoiceLike[] = [
        { id: "inv1", subscription: "sub1", period_start: 1000, created: 500, status: "draft", amount_paid: 0 },
        { id: "inv2", subscription: "sub1", period_start: 1000, created: 600, status: "paid", amount_paid: 100 },
      ];
      const result = dedupePaidInvoicesByBillingPeriod(invoices);
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("inv2");
    });

    test("filters out zero amount_paid", () => {
      const invoices: InvoiceLike[] = [
        { id: "inv1", subscription: "sub1", period_start: 1000, created: 500, status: "paid", amount_paid: 0 },
      ];
      expect(dedupePaidInvoicesByBillingPeriod(invoices)).toHaveLength(0);
    });

    test("filters out invoices with null subscription", () => {
      const invoices: InvoiceLike[] = [
        { id: "inv1", subscription: null, period_start: 1000, created: 500, status: "paid", amount_paid: 100 },
      ];
      expect(dedupePaidInvoicesByBillingPeriod(invoices)).toHaveLength(0);
    });

    test("deduplicates same subscription + period_start, keeps newest created", () => {
      const invoices: InvoiceLike[] = [
        { id: "inv-old", subscription: "sub1", period_start: 1700000000, created: 1700000100, status: "paid", amount_paid: 500 },
        { id: "inv-new", subscription: "sub1", period_start: 1700000000, created: 1700000200, status: "paid", amount_paid: 500 },
      ];
      const result = dedupePaidInvoicesByBillingPeriod(invoices);
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("inv-new");
    });

    test("keeps invoices with different period_start for same subscription", () => {
      const invoices: InvoiceLike[] = [
        { id: "inv1", subscription: "sub1", period_start: 1700000000, created: 100, status: "paid", amount_paid: 500 },
        { id: "inv2", subscription: "sub1", period_start: 1703000000, created: 200, status: "paid", amount_paid: 500 },
      ];
      const result = dedupePaidInvoicesByBillingPeriod(invoices);
      expect(result).toHaveLength(2);
    });

    test("keeps invoices from different subscriptions", () => {
      const invoices: InvoiceLike[] = [
        { id: "inv1", subscription: "sub1", period_start: 1700000000, created: 100, status: "paid", amount_paid: 500 },
        { id: "inv2", subscription: "sub2", period_start: 1700000000, created: 200, status: "paid", amount_paid: 500 },
      ];
      const result = dedupePaidInvoicesByBillingPeriod(invoices);
      expect(result).toHaveLength(2);
    });

    test("uses invoice id as key when period_start is 0", () => {
      const invoices: InvoiceLike[] = [
        { id: "inv1", subscription: "sub1", period_start: 0, created: 100, status: "paid", amount_paid: 100 },
        { id: "inv2", subscription: "sub1", period_start: 0, created: 200, status: "paid", amount_paid: 100 },
      ];
      const result = dedupePaidInvoicesByBillingPeriod(invoices);
      expect(result).toHaveLength(2);
    });

    test("sorts results by created descending (newest first)", () => {
      const invoices: InvoiceLike[] = [
        { id: "inv-old", subscription: "sub1", period_start: 1700000000, created: 100, status: "paid", amount_paid: 500 },
        { id: "inv-mid", subscription: "sub1", period_start: 1703000000, created: 200, status: "paid", amount_paid: 500 },
        { id: "inv-new", subscription: "sub1", period_start: 1706000000, created: 300, status: "paid", amount_paid: 500 },
      ];
      const result = dedupePaidInvoicesByBillingPeriod(invoices);
      expect(result.map((r) => r.id)).toEqual(["inv-new", "inv-mid", "inv-old"]);
    });

    test("empty input returns empty array", () => {
      expect(dedupePaidInvoicesByBillingPeriod([])).toEqual([]);
    });

    test("mixed statuses only keeps paid", () => {
      const invoices: InvoiceLike[] = [
        { id: "i1", subscription: "s1", period_start: 100, created: 1, status: "paid", amount_paid: 50 },
        { id: "i2", subscription: "s1", period_start: 200, created: 2, status: "void", amount_paid: 50 },
        { id: "i3", subscription: "s1", period_start: 300, created: 3, status: "open", amount_paid: 50 },
        { id: "i4", subscription: "s1", period_start: 400, created: 4, status: "paid", amount_paid: 50 },
      ];
      const result = dedupePaidInvoicesByBillingPeriod(invoices);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(["i4", "i1"]);
    });
  });
});

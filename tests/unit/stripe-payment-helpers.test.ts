import { describe, expect, test } from "bun:test";

import { formatPrice, getStripeOAuthLink } from "@/lib/utils";

/**
 * Pure helpers extracted from Stripe checkout/subscription logic for testability.
 */

function extractPriceIds(prices: { priceId?: string; id?: string }[]): string[] {
  return prices.map((p) => p.priceId || p.id || String(p));
}

function buildLineItems(prices: { priceId?: string; id?: string; quantity?: number }[]) {
  return prices.map((p) => ({
    price: p.priceId ?? p.id ?? String(p),
    quantity: Number(p.quantity ?? 1),
  }));
}

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function isUrlAllowed(url: string, allowedHosts: string[]): boolean {
  try {
    const parsed = new URL(url);
    return allowedHosts.some((h) => parsed.hostname.includes(h));
  } catch {
    return false;
  }
}

function computeActiveFromStripeStatus(status: string): boolean {
  return ["active", "trialing"].includes(status);
}

function checkCartAgencyConsistency(
  products: { agencyId: string }[],
  expectedAgencyId: string,
): { valid: boolean; error?: string } {
  const invalid = products.filter((p) => p.agencyId !== expectedAgencyId);
  if (invalid.length > 0) {
    return { valid: false, error: "Cart contains products from different agencies" };
  }
  return { valid: true };
}

/**
 * Feature: Stripe payment helpers — line items, URL validation, subscription status.
 */
describe("Stripe payment helpers", () => {
  describe("extractPriceIds", () => {
    test("prefers priceId over id", () => {
      expect(extractPriceIds([{ priceId: "price_1", id: "fallback" }])).toEqual(["price_1"]);
    });

    test("falls back to id", () => {
      expect(extractPriceIds([{ id: "prod_2" }])).toEqual(["prod_2"]);
    });
  });

  describe("buildLineItems", () => {
    test("default quantity is 1", () => {
      const items = buildLineItems([{ priceId: "p1" }]);
      expect(items).toEqual([{ price: "p1", quantity: 1 }]);
    });

    test("respects explicit quantity", () => {
      const items = buildLineItems([{ priceId: "p1", quantity: 3 }]);
      expect(items[0]!.quantity).toBe(3);
    });
  });

  describe("normalizeBaseUrl", () => {
    test("strips trailing slash", () => {
      expect(normalizeBaseUrl("https://pixora.app/")).toBe("https://pixora.app");
    });

    test("no change if no trailing slash", () => {
      expect(normalizeBaseUrl("https://pixora.app")).toBe("https://pixora.app");
    });
  });

  describe("isUrlAllowed", () => {
    const hosts = ["localhost", "pixora.vercel.app"];

    test("allows localhost URLs", () => {
      expect(isUrlAllowed("http://localhost:3000/success", hosts)).toBe(true);
    });

    test("allows production domain", () => {
      expect(isUrlAllowed("https://pixora.vercel.app/billing", hosts)).toBe(true);
    });

    test("rejects foreign domains", () => {
      expect(isUrlAllowed("https://evil.com/steal", hosts)).toBe(false);
    });

    test("rejects malformed URLs", () => {
      expect(isUrlAllowed("not-a-url", hosts)).toBe(false);
    });
  });

  describe("computeActiveFromStripeStatus", () => {
    test.each(["active", "trialing"])("'%s' is active", (s) => {
      expect(computeActiveFromStripeStatus(s)).toBe(true);
    });

    test.each(["canceled", "past_due", "unpaid", "incomplete"])("'%s' is not active", (s) => {
      expect(computeActiveFromStripeStatus(s)).toBe(false);
    });
  });

  describe("cart agency consistency", () => {
    test("all same agency → valid", () => {
      const products = [{ agencyId: "a1" }, { agencyId: "a1" }];
      expect(checkCartAgencyConsistency(products, "a1")).toEqual({ valid: true });
    });

    test("mixed agencies → invalid", () => {
      const products = [{ agencyId: "a1" }, { agencyId: "a2" }];
      const result = checkCartAgencyConsistency(products, "a1");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("different agencies");
    });

    test("empty cart → valid", () => {
      expect(checkCartAgencyConsistency([], "a1")).toEqual({ valid: true });
    });
  });

  describe("formatPrice (Rs display)", () => {
    test("zero renders as Rs 0", () => {
      expect(formatPrice(0)).toMatch(/Rs\s*0/);
    });

    test("large amount includes comma separators", () => {
      const result = formatPrice(12999);
      expect(result).toContain("Rs");
      expect(result).toMatch(/12[,.]?999/);
    });
  });

  describe("Stripe Connect OAuth link", () => {
    test("contains scope=read_write", () => {
      process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = "ca_test";
      const url = getStripeOAuthLink("agency", "s123");
      expect(url).toContain("scope=read_write");
      expect(url).toContain("ca_test");
    });
  });
});

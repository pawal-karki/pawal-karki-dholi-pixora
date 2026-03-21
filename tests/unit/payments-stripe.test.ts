import { describe, expect, test } from "bun:test";

import { formatPrice, getStripeOAuthLink } from "@/lib/utils";

/**
 * Feature: Payments — currency display & Stripe Connect entry points.
 */
describe("Payments / Stripe", () => {
  describe("formatPrice (NPR display)", () => {
    test("formats whole rupees", () => {
      expect(formatPrice(999)).toContain("999");
      expect(formatPrice(999)).toMatch(/^Rs/);
    });

    test("NaN yields zero label", () => {
      expect(formatPrice(Number.NaN)).toBe("Rs 0");
    });
  });

  describe("Connect OAuth URL", () => {
    test("includes response_type and client_id placeholder from env", () => {
      const original = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID;
      process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = "ca_test_123";

      const url = getStripeOAuthLink("agency", "state-xyz");
      expect(url).toContain("response_type=code");
      expect(url).toContain("ca_test_123");
      expect(url).toContain("state=state-xyz");
      expect(url).toContain("read_write");

      process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = original;
    });
  });
});

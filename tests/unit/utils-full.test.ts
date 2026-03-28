import { describe, expect, test, beforeEach } from "bun:test";
import { cn, getStripeOAuthLink, formatPrice, constructMetadata, logger } from "@/lib/utils";

describe("Utility functions — full coverage", () => {
  describe("cn (class name merge)", () => {
    test("merges basic classes", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    test("deduplicates conflicting tailwind classes", () => {
      expect(cn("px-4", "px-6")).toBe("px-6");
    });

    test("handles conditional classes", () => {
      expect(cn("base", false && "hidden", true && "visible")).toBe("base visible");
    });

    test("handles undefined and null inputs", () => {
      expect(cn("base", undefined, null)).toBe("base");
    });

    test("handles array input", () => {
      expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
    });

    test("returns empty string for no args", () => {
      expect(cn()).toBe("");
    });
  });

  describe("getStripeOAuthLink", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = "ca_test_123";
    });

    test("builds correct URL for agency", () => {
      const url = getStripeOAuthLink("agency", "state-1");
      expect(url).toContain("connect.stripe.com/oauth/authorize");
      expect(url).toContain("response_type=code");
      expect(url).toContain("client_id=ca_test_123");
      expect(url).toContain("scope=read_write");
      expect(url).toContain("state=state-1");
    });

    test("builds correct URL for subaccount", () => {
      const url = getStripeOAuthLink("subaccount", "state-2");
      expect(url).toContain("state=state-2");
      expect(url).toContain("client_id=ca_test_123");
    });

    test("encodes state parameter in URL", () => {
      const url = getStripeOAuthLink("agency", "my-agency-id");
      expect(url).toContain("state=my-agency-id");
    });
  });

  describe("logger", () => {
    test("does not throw in any environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      expect(() => logger("test message")).not.toThrow();
      expect(() => logger("test message", { data: true })).not.toThrow();
      process.env.NODE_ENV = "production";
      expect(() => logger("test message")).not.toThrow();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("constructMetadata", () => {
    test("returns defaults when no args", () => {
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
      const meta = constructMetadata();
      expect(meta.title).toBe("Pixora - Agency Management Platform");
      expect(meta.description).toBe("All in one Agency Solution");
    });

    test("overrides title and description", () => {
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
      const meta = constructMetadata({ title: "My Page", description: "My desc" });
      expect(meta.title).toBe("My Page");
      expect(meta.description).toBe("My desc");
    });

    test("sets openGraph data", () => {
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
      const meta = constructMetadata({ title: "OG Title" });
      expect((meta.openGraph as any)?.title).toBe("OG Title");
    });

    test("sets twitter card data", () => {
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
      const meta = constructMetadata({ title: "Twitter Title" });
      expect((meta.twitter as any)?.title).toBe("Twitter Title");
      expect((meta.twitter as any)?.card).toBe("summary_large_image");
    });

    test("sets metadataBase from env", () => {
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
      const meta = constructMetadata();
      expect(meta.metadataBase?.toString()).toContain("pixora.app");
    });

    test("falls back to localhost for metadataBase", () => {
      const original = process.env.NEXT_PUBLIC_URL;
      delete process.env.NEXT_PUBLIC_URL;
      const meta = constructMetadata();
      expect(meta.metadataBase?.toString()).toContain("localhost:3000");
      process.env.NEXT_PUBLIC_URL = original;
    });

    test("noIndex sets robots to noindex", () => {
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
      const meta = constructMetadata({ noIndex: true });
      expect((meta as any).robots?.index).toBe(false);
      expect((meta as any).robots?.follow).toBe(false);
    });

    test("noIndex false does not set robots", () => {
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
      const meta = constructMetadata({ noIndex: false });
      expect((meta as any).robots).toBeUndefined();
    });

    test("custom image is used in OG and Twitter", () => {
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
      const meta = constructMetadata({ image: "/custom-og.png" });
      expect((meta.openGraph as any)?.images?.[0]?.url).toBe("/custom-og.png");
      expect((meta.twitter as any)?.images?.[0]).toBe("/custom-og.png");
    });

    test("custom icons", () => {
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
      const meta = constructMetadata({ icons: "/custom-icon.png" });
      expect(meta.icons).toBe("/custom-icon.png");
    });
  });

  describe("formatPrice", () => {
    test("formats integer price with Rs prefix", () => {
      const result = formatPrice(1000);
      expect(result.startsWith("Rs")).toBe(true);
      expect(result.replace(/\s/g, "")).toContain("1,000");
    });

    test("formats decimal price", () => {
      const result = formatPrice(99.5);
      expect(result.startsWith("Rs")).toBe(true);
      expect(result).toContain("99");
    });

    test("formats zero", () => {
      const result = formatPrice(0);
      expect(result.startsWith("Rs")).toBe(true);
      expect(result).toContain("0");
    });

    test("NaN returns Rs 0", () => {
      const result = formatPrice(NaN);
      expect(result.startsWith("Rs")).toBe(true);
      expect(result).toContain("0");
    });

    test("negative price formatted", () => {
      const result = formatPrice(-500);
      expect(result).toContain("Rs");
      expect(result).toContain("500");
    });

    test("large number formatted with commas", () => {
      const result = formatPrice(1000000);
      expect(result).toContain("Rs");
      expect(result.replace(/[^0-9]/g, "")).toContain("1000000");
    });

    test("small decimal", () => {
      const result = formatPrice(0.5);
      expect(result).toContain("Rs");
      expect(result).toContain("0.5");
    });
  });
});

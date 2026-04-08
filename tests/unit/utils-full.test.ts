import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import { cn, getStripeOAuthLink, formatPrice, constructMetadata, logger } from "@/lib/utils";

describe("Utility functions — full coverage", () => {
  describe("cn (class name merge)", () => {
    it("merges basic classes", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("deduplicates conflicting tailwind classes", () => {
      expect(cn("px-4", "px-6")).toBe("px-6");
    });

    it("handles conditional classes", () => {
      expect(cn("base", false && "hidden", true && "visible")).toBe("base visible");
    });

    it("handles undefined and null inputs", () => {
      expect(cn("base", undefined, null)).toBe("base");
    });

    it("handles array input", () => {
      expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
    });

    it("returns empty string for no args", () => {
      expect(cn()).toBe("");
    });
  });

  describe("getStripeOAuthLink", () => {
    let savedStripeClientId: string | undefined;

    beforeEach(() => {
      savedStripeClientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID;
      process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = "ca_test_123";
    });

    afterEach(() => {
      if (savedStripeClientId === undefined) {
        delete process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID;
      } else {
        process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = savedStripeClientId;
      }
    });

    it("builds correct URL for agency", () => {
      const url = getStripeOAuthLink("agency", "state-1");
      expect(url).toContain("connect.stripe.com/oauth/authorize");
      expect(url).toContain("response_type=code");
      expect(url).toContain("client_id=ca_test_123");
      expect(url).toContain("scope=read_write");
      expect(url).toContain("state=state-1");
    });

    it("builds correct URL for subaccount", () => {
      const url = getStripeOAuthLink("subaccount", "state-2");
      expect(url).toContain("state=state-2");
      expect(url).toContain("client_id=ca_test_123");
    });

    it("encodes state parameter in URL", () => {
      const url = getStripeOAuthLink("agency", "my-agency-id");
      expect(url).toContain("state=my-agency-id");
    });
  });

  describe("logger", () => {
    it("does not throw in any environment", () => {
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
    let savedPublicUrl: string | undefined;

    beforeEach(() => {
      savedPublicUrl = process.env.NEXT_PUBLIC_URL;
      process.env.NEXT_PUBLIC_URL = "https://pixora.app";
    });

    afterEach(() => {
      if (savedPublicUrl === undefined) {
        delete process.env.NEXT_PUBLIC_URL;
      } else {
        process.env.NEXT_PUBLIC_URL = savedPublicUrl;
      }
    });

    it("returns defaults when no args", () => {
      const meta = constructMetadata();
      expect(meta.title).toBe("Pixora - Agency Management Platform");
      expect(meta.description).toBe("All in one Agency Solution");
    });

    it("overrides title and description", () => {
      const meta = constructMetadata({ title: "My Page", description: "My desc" });
      expect(meta.title).toBe("My Page");
      expect(meta.description).toBe("My desc");
    });

    it("sets openGraph data", () => {
      const meta = constructMetadata({ title: "OG Title" });
      expect((meta.openGraph as { title?: string })?.title).toBe("OG Title");
    });

    it("sets twitter card data", () => {
      const meta = constructMetadata({ title: "Twitter Title" });
      const tw = meta.twitter as { title?: string; card?: string };
      expect(tw?.title).toBe("Twitter Title");
      expect(tw?.card).toBe("summary_large_image");
    });

    it("sets metadataBase from env", () => {
      const meta = constructMetadata();
      expect(meta.metadataBase?.toString()).toContain("pixora.app");
    });

    it("falls back to default public URL for metadataBase when env unset", () => {
      delete process.env.NEXT_PUBLIC_URL;
      const meta = constructMetadata();
      expect(meta.metadataBase?.toString()).toContain("pawal.dev");
    });

    it("noIndex sets robots to noindex", () => {
      const meta = constructMetadata({ noIndex: true });
      const robots = meta as { robots?: { index: boolean; follow: boolean } };
      expect(robots.robots?.index).toBe(false);
      expect(robots.robots?.follow).toBe(false);
    });

    it("noIndex false does not set robots", () => {
      const meta = constructMetadata({ noIndex: false });
      expect((meta as { robots?: unknown }).robots).toBeUndefined();
    });

    it("custom image is used in OG and Twitter", () => {
      const meta = constructMetadata({ image: "/custom-og.png" });
      const og = meta.openGraph as { images?: { url: string }[] };
      const tw = meta.twitter as { images?: string[] };
      expect(og?.images?.[0]?.url).toBe("/custom-og.png");
      expect(tw?.images?.[0]).toBe("/custom-og.png");
    });

    it("custom icons", () => {
      const meta = constructMetadata({ icons: "/custom-icon.png" });
      expect(meta.icons).toBe("/custom-icon.png");
    });
  });

  describe("formatPrice", () => {
    it("formats integer price with Rs prefix", () => {
      const result = formatPrice(1000);
      expect(result.startsWith("Rs")).toBe(true);
      expect(result.replace(/\s/g, "")).toContain("1,000");
    });

    it("formats decimal price", () => {
      const result = formatPrice(99.5);
      expect(result.startsWith("Rs")).toBe(true);
      expect(result).toContain("99");
    });

    it("formats zero", () => {
      const result = formatPrice(0);
      expect(result.startsWith("Rs")).toBe(true);
      expect(result).toContain("0");
    });

    it("NaN returns Rs 0", () => {
      const result = formatPrice(NaN);
      expect(result.startsWith("Rs")).toBe(true);
      expect(result).toContain("0");
    });

    it("negative price formatted", () => {
      const result = formatPrice(-500);
      expect(result).toContain("Rs");
      expect(result).toContain("500");
    });

    it("large number formatted with commas", () => {
      const result = formatPrice(1000000);
      expect(result).toContain("Rs");
      expect(result.replace(/[^0-9]/g, "")).toContain("1000000");
    });

    it("small decimal", () => {
      const result = formatPrice(0.5);
      expect(result).toContain("Rs");
      expect(result).toContain("0.5");
    });
  });
});

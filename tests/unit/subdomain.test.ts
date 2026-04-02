import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import {
  DEFAULT_FUNNEL_PUBLIC_DOMAIN,
  getFunnelBaseDomain,
  getFunnelLiveSiteUrl,
  getFunnelSubdomainHost,
  resolveCustomSubdomain,
} from "@/lib/subdomain";

/**
 * Feature: Custom funnel subdomains (middleware rewrite targets)
 */
describe("Subdomain routing", () => {
  describe("NEXT_PUBLIC_DOMAIN set (production-style)", () => {
    test("extracts tenant from host under base domain", () => {
      const base = "myapp.vercel.app";
      expect(
        resolveCustomSubdomain("acme.myapp.vercel.app", base),
      ).toBe("acme");
    });

    test("returns null for apex host", () => {
      expect(resolveCustomSubdomain("myapp.vercel.app", "myapp.vercel.app")).toBe(
        null,
      );
    });

    test("strips port before comparing", () => {
      const base = "pixora.test:3000";
      expect(resolveCustomSubdomain("foo.pixora.test:3000", base)).toBe("foo");
    });
  });

  describe("localhost fallback (no base domain env)", () => {
    test("sub.localhost yields sub", () => {
      expect(resolveCustomSubdomain("acme.localhost:3000", undefined)).toBe(
        "acme",
      );
    });

    test("plain localhost has no subdomain", () => {
      expect(resolveCustomSubdomain("localhost:3000", undefined)).toBe(null);
    });
  });

  describe("generic multi-part host", () => {
    test("first label is tenant when 3+ parts and not blocked prefix", () => {
      expect(
        resolveCustomSubdomain("client.project.example.com", undefined),
      ).toBe("client");
    });

    test("www is not treated as tenant subdomain", () => {
      expect(
        resolveCustomSubdomain("www.example.com", undefined),
      ).toBe(null);
    });
  });

  describe("published funnel host (*.pawal.dev)", () => {
    let savedDomain: string | undefined;
    let savedScheme: string | undefined;

    beforeEach(() => {
      savedDomain = process.env.NEXT_PUBLIC_DOMAIN;
      savedScheme = process.env.NEXT_PUBLIC_SCHEME;
      delete process.env.NEXT_PUBLIC_DOMAIN;
      delete process.env.NEXT_PUBLIC_SCHEME;
    });

    afterEach(() => {
      if (savedDomain === undefined) delete process.env.NEXT_PUBLIC_DOMAIN;
      else process.env.NEXT_PUBLIC_DOMAIN = savedDomain;
      if (savedScheme === undefined) delete process.env.NEXT_PUBLIC_SCHEME;
      else process.env.NEXT_PUBLIC_SCHEME = savedScheme;
    });

    test("defaults to pawal.dev when NEXT_PUBLIC_DOMAIN is unset", () => {
      expect(getFunnelBaseDomain()).toBe(DEFAULT_FUNNEL_PUBLIC_DOMAIN);
      expect(getFunnelSubdomainHost("my-offer")).toBe(
        `my-offer.${DEFAULT_FUNNEL_PUBLIC_DOMAIN}`,
      );
      expect(getFunnelLiveSiteUrl("my-offer")).toBe(
        `http://my-offer.${DEFAULT_FUNNEL_PUBLIC_DOMAIN}`,
      );
    });

    test("respects NEXT_PUBLIC_DOMAIN and scheme", () => {
      process.env.NEXT_PUBLIC_DOMAIN = "custom.test";
      process.env.NEXT_PUBLIC_SCHEME = "https";
      expect(getFunnelSubdomainHost("x")).toBe("x.custom.test");
      expect(getFunnelLiveSiteUrl("x")).toBe("https://x.custom.test");
    });
  });
});

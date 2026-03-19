import { describe, expect, test } from "bun:test";

import { resolveCustomSubdomain } from "@/lib/subdomain";

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
});

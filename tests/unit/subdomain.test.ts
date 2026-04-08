import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  DEFAULT_FUNNEL_PUBLIC_DOMAIN,
  getFunnelBaseDomain,
  getFunnelLiveSiteUrl,
  getFunnelSubdomainHost,
  resolveCustomSubdomain,
} from "@/lib/subdomain";

describe("subdomain", () => {
  describe("resolveCustomSubdomain", () => {
    describe("when NEXT_PUBLIC_DOMAIN is set (production-style)", () => {
      it("extracts single-label tenant from host under base domain", () => {
        const base = "myapp.vercel.app";
        const result = resolveCustomSubdomain("acme.myapp.vercel.app", base);
        expect(result).toBe("acme");
      });

      it("extracts multi-label prefix when base is a suffix of the host", () => {
        const base = "myapp.vercel.app";
        const result = resolveCustomSubdomain(
          "deep.sub.myapp.vercel.app",
          base,
        );
        expect(result).toBe("deep.sub");
      });

      it("returns null for apex host equal to base", () => {
        expect(
          resolveCustomSubdomain("myapp.vercel.app", "myapp.vercel.app"),
        ).toBeNull();
      });

      it("strips port on host and base before comparing", () => {
        const base = "pixora.test:3000";
        const result = resolveCustomSubdomain("foo.pixora.test:3000", base);
        expect(result).toBe("foo");
      });

      it("normalises tenant segment to lowercase", () => {
        const result = resolveCustomSubdomain("Acme.myapp.com", "myapp.com");
        expect(result).toBe("acme");
      });

      it("returns null for empty host", () => {
        expect(resolveCustomSubdomain("", "myapp.com")).toBeNull();
      });

      it("handles host with trailing dot after base strip", () => {
        const result = resolveCustomSubdomain("tenant.myapp.com.", "myapp.com");
        expect(result).not.toBeNull();
        expect(result).toContain("tenant");
      });
    });

    describe("when NEXT_PUBLIC_DOMAIN is unset (localhost + heuristic)", () => {
      it("returns first label for sub.localhost with port", () => {
        const result = resolveCustomSubdomain("acme.localhost:3000", undefined);
        expect(result).toBe("acme");
      });

      it("returns null for plain localhost with port", () => {
        expect(resolveCustomSubdomain("localhost:3000", undefined)).toBeNull();
      });

      it("returns tenant for generic 3+ label host when first label is not blocked", () => {
        const result = resolveCustomSubdomain(
          "client.project.example.com",
          undefined,
        );
        expect(result).toBe("client");
      });

      it("returns null for www prefix on three-part public host", () => {
        expect(
          resolveCustomSubdomain("www.example.com", undefined),
        ).toBeNull();
      });

      for (const prefix of ["api", "app", "admin"] as const) {
        it(`returns null for blocked prefix ${prefix}`, () => {
          const result = resolveCustomSubdomain(
            `${prefix}.example.com`,
            undefined,
          );
          expect(result).toBeNull();
        });
      }

      it("returns null for two-label non-localhost host (no subdomain heuristic)", () => {
        expect(resolveCustomSubdomain("example.com", undefined)).toBeNull();
      });

      it("returns null for empty host", () => {
        expect(resolveCustomSubdomain("", undefined)).toBeNull();
      });
    });
  });

  describe("published funnel URLs (env-dependent)", () => {
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

    it("getFunnelBaseDomain defaults when NEXT_PUBLIC_DOMAIN is unset", () => {
      expect(getFunnelBaseDomain()).toBe(DEFAULT_FUNNEL_PUBLIC_DOMAIN);
    });

    it("getFunnelSubdomainHost trims slug and lowercases", () => {
      const host = getFunnelSubdomainHost("  My-Offer  ");
      expect(host).toBe(`my-offer.${DEFAULT_FUNNEL_PUBLIC_DOMAIN}`);
    });

    it("getFunnelLiveSiteUrl uses http by default and strips trailing slash on empty path", () => {
      const url = getFunnelLiveSiteUrl("my-offer");
      expect(url).toBe(`http://my-offer.${DEFAULT_FUNNEL_PUBLIC_DOMAIN}`);
      expect(url.endsWith("/")).toBe(false);
    });

    it("respects NEXT_PUBLIC_DOMAIN and NEXT_PUBLIC_SCHEME", () => {
      process.env.NEXT_PUBLIC_DOMAIN = "custom.test";
      process.env.NEXT_PUBLIC_SCHEME = "https";
      expect(getFunnelSubdomainHost("x")).toBe("x.custom.test");
      expect(getFunnelLiveSiteUrl("x")).toBe("https://x.custom.test");
    });

    it("getFunnelBaseDomain trims NEXT_PUBLIC_DOMAIN", () => {
      process.env.NEXT_PUBLIC_DOMAIN = "  trimmed.test  ";
      expect(getFunnelBaseDomain()).toBe("trimmed.test");
    });
  });
});

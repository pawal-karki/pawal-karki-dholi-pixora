import { describe, expect, test } from "bun:test";

import { buildPublishedFunnelPageUrl, normalizeScheme } from "@/lib/funnel-url";

/**
 * Feature: Funnel published URLs — edge cases and subdomain routing.
 */
describe("Funnel URL builder — advanced", () => {
  test("default scheme is http when env undefined", () => {
    expect(normalizeScheme(undefined)).toBe("http");
  });

  test("empty string scheme defaults to http", () => {
    expect(normalizeScheme("")).toBe("http");
  });

  test("scheme with trailing colon is stripped", () => {
    expect(normalizeScheme("https:")).toBe("https");
  });

  test("full URL with all params", () => {
    const url = buildPublishedFunnelPageUrl({
      subDomainName: "acme",
      pathName: "checkout",
      scheme: "https",
      domain: "pixora.vercel.app",
    });
    expect(url).toBe("https://acme.pixora.vercel.app/checkout");
  });

  test("leading slash in pathName is stripped", () => {
    const url = buildPublishedFunnelPageUrl({
      subDomainName: "sale",
      pathName: "/pricing",
      scheme: "http",
      domain: "localhost:3000",
    });
    expect(url).toBe("http://sale.localhost:3000/pricing");
  });

  test("default domain falls back to localhost:3000", () => {
    const url = buildPublishedFunnelPageUrl({
      subDomainName: "demo",
      pathName: "home",
    });
    expect(url).toBe("http://demo.localhost:3000/home");
  });

  test("whitespace in subDomainName is trimmed", () => {
    const url = buildPublishedFunnelPageUrl({
      subDomainName: "  tenant  ",
      pathName: "page",
    });
    expect(url).toContain("tenant.localhost");
  });
});

import { describe, expect, test } from "bun:test";

import { resolveCustomSubdomain } from "@/lib/subdomain";

/**
 * Feature: Subdomain edge-cases and security boundaries.
 */
describe("Subdomain — advanced", () => {
  test("deep subdomains are extracted", () => {
    expect(
      resolveCustomSubdomain("deep.sub.myapp.vercel.app", "myapp.vercel.app"),
    ).toBe("deep.sub");
  });

  test("blocked prefixes: api, app, admin", () => {
    expect(resolveCustomSubdomain("api.example.com", undefined)).toBeNull();
    expect(resolveCustomSubdomain("app.example.com", undefined)).toBeNull();
    expect(resolveCustomSubdomain("admin.example.com", undefined)).toBeNull();
  });

  test("case-insensitive normalisation", () => {
    expect(
      resolveCustomSubdomain("Acme.myapp.com", "myapp.com"),
    ).toBe("acme");
  });

  test("empty host returns null", () => {
    expect(resolveCustomSubdomain("", "myapp.com")).toBeNull();
    expect(resolveCustomSubdomain("", undefined)).toBeNull();
  });

  test("host with trailing dot preserves subdomain extraction", () => {
    const result = resolveCustomSubdomain("tenant.myapp.com.", "myapp.com");
    expect(result).not.toBeNull();
    expect(result!).toContain("tenant");
  });
});

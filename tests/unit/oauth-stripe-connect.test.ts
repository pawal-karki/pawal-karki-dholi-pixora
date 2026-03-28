import { describe, expect, test } from "bun:test";
import { getStripeOAuthLink } from "@/lib/utils";

function buildStripeOAuthUrl(clientId: string, state: string): string {
  return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&state=${state}`;
}

function parseOAuthCallbackParams(url: string): { code: string; state: string; scope: string } | null {
  try {
    const parsed = new URL(url);
    const code = parsed.searchParams.get("code");
    const state = parsed.searchParams.get("state");
    const scope = parsed.searchParams.get("scope");
    if (!code || !state) return null;
    return { code, state, scope: scope || "" };
  } catch {
    return null;
  }
}

function parseOAuthState(state: string): { page: string; agencyId: string } | null {
  const parts = state.split("___");
  if (parts.length !== 2) return null;
  return { page: parts[0]!, agencyId: parts[1]! };
}

function validateStripeUserId(stripeUserId: string | undefined | null): boolean {
  return typeof stripeUserId === "string" && stripeUserId.startsWith("acct_") && stripeUserId.length > 5;
}

describe("OAuth Stripe Connect", () => {
  describe("OAuth URL generation", () => {
    test("builds correct authorize URL", () => {
      const url = buildStripeOAuthUrl("ca_test123", "launchpad___agency-1");
      expect(url).toContain("connect.stripe.com/oauth/authorize");
      expect(url).toContain("response_type=code");
      expect(url).toContain("client_id=ca_test123");
      expect(url).toContain("scope=read_write");
      expect(url).toContain("state=launchpad___agency-1");
    });

    test("getStripeOAuthLink includes client ID from env", () => {
      process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = "ca_test_abc";
      const url = getStripeOAuthLink("agency", "my-state");
      expect(url).toContain("ca_test_abc");
      expect(url).toContain("scope=read_write");
      expect(url).toContain("state=my-state");
    });

    test("getStripeOAuthLink works for subaccount type", () => {
      process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = "ca_test_xyz";
      const url = getStripeOAuthLink("subaccount", "sub-state");
      expect(url).toContain("ca_test_xyz");
      expect(url).toContain("state=sub-state");
    });
  });

  describe("OAuth callback parsing", () => {
    test("parses valid callback URL", () => {
      const result = parseOAuthCallbackParams(
        "http://localhost:3000/agency?code=ac_ABC123&state=launchpad___id-1&scope=read_write",
      );
      expect(result).toEqual({ code: "ac_ABC123", state: "launchpad___id-1", scope: "read_write" });
    });

    test("returns null for missing code", () => {
      const result = parseOAuthCallbackParams("http://localhost:3000?state=x");
      expect(result).toBeNull();
    });

    test("returns null for invalid URL", () => {
      expect(parseOAuthCallbackParams("not-a-url")).toBeNull();
    });

    test("handles missing scope gracefully", () => {
      const result = parseOAuthCallbackParams("http://localhost:3000?code=c&state=s");
      expect(result!.scope).toBe("");
    });
  });

  describe("OAuth state parsing", () => {
    test("parses page and agencyId", () => {
      const result = parseOAuthState("launchpad___5264d960-4f4b-4ce9-860d-c3116a9ff92a");
      expect(result).toEqual({
        page: "launchpad",
        agencyId: "5264d960-4f4b-4ce9-860d-c3116a9ff92a",
      });
    });

    test("returns null for invalid state", () => {
      expect(parseOAuthState("noseperator")).toBeNull();
    });

    test("returns null for too many separators", () => {
      expect(parseOAuthState("a___b___c")).toBeNull();
    });
  });

  describe("Stripe user ID validation", () => {
    test("valid acct_ ID passes", () => {
      expect(validateStripeUserId("acct_1234567890")).toBe(true);
    });
    test("null fails", () => {
      expect(validateStripeUserId(null)).toBe(false);
    });
    test("undefined fails", () => {
      expect(validateStripeUserId(undefined)).toBe(false);
    });
    test("empty string fails", () => {
      expect(validateStripeUserId("")).toBe(false);
    });
    test("wrong prefix fails", () => {
      expect(validateStripeUserId("cus_1234567890")).toBe(false);
    });
    test("just 'acct_' is too short", () => {
      expect(validateStripeUserId("acct_")).toBe(false);
    });
  });
});

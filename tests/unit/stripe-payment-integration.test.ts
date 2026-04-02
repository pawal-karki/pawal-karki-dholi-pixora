import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";

import {
  cn,
  constructMetadata,
  formatPrice,
  getStripeOAuthLink,
  logger,
} from "@/lib/utils";

const subscriptionFindFirst = mock();
const subscriptionFindUnique = mock();
const subAccountCount = mock();
const subAccountFindFirst = mock();
const userCount = mock();

mock.module("@/lib/db", () => ({
  db: {
    subscription: {
      findFirst: subscriptionFindFirst,
      findUnique: subscriptionFindUnique,
    },
    subAccount: {
      count: subAccountCount,
      findFirst: subAccountFindFirst,
    },
    user: {
      count: userCount,
    },
  },
}));

const {
  PLAN_LIMITS,
  canCreateSubAccount,
  canInviteTeamMember,
  getAgencyPlan,
  getAgencyPlanLimits,
  getAgencyUsageStats,
  getFirstCreatedSubAccountId,
  isSubscriptionRequiredForSubaccountAccess,
} = await import("@/lib/plan-limits");

interface PlanValidationResult {
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  planName: string;
  message?: string;
}

/* -------------------------------------------------------------------------- */
/* Plan & billing (subscription tiers, Stripe price keys, enforcement shape) */
/* -------------------------------------------------------------------------- */

function derivePlanName(subscriptionPlan: string | null | undefined): string {
  if (!subscriptionPlan) return "Starter";
  if (subscriptionPlan.includes("PRO")) return "Pro";
  if (subscriptionPlan.includes("AGENCY")) return "Agency";
  return "Starter";
}

function checkPlanAllowance(
  plan: string,
  currentCount: number,
  limitKey: "maxSubAccounts" | "maxTeamMembers",
): PlanValidationResult {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.Starter;
  const maxAllowed = limits[limitKey];
  const allowed = currentCount < maxAllowed;
  return {
    allowed,
    currentCount,
    maxAllowed,
    planName: plan,
    message: allowed ? undefined : `Limit reached on ${plan} plan`,
  };
}

function isSubscriptionActive(status: string): boolean {
  return ["active", "trialing"].includes(status);
}

function mapPlanKeyToStripePlan(key: string): string | null {
  switch (key) {
    case "PRO":
      return "price_PRO_PLAN";
    case "AGENCY":
      return "price_AGENCY_PLAN";
    default:
      return null;
  }
}

function computePeriodEndDate(timestamp: number | null): Date {
  if (timestamp && !isNaN(timestamp)) return new Date(timestamp * 1000);
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

function toCents(price: string | number): number {
  return Math.round(parseFloat(String(price)) * 100);
}

function truncateDescription(desc: string, maxLen: number = 1000): string {
  return desc.length > maxLen ? desc.substring(0, maxLen) : desc;
}

/* -------------------------------------------------------------------------- */
/* Checkout: line items, return URLs, cart invariants                          */
/* -------------------------------------------------------------------------- */

function extractPriceIds(prices: { priceId?: string; id?: string }[]): string[] {
  return prices.map((p) => p.priceId || p.id || String(p));
}

function buildLineItems(
  prices: { priceId?: string; id?: string; quantity?: number }[],
) {
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

/* -------------------------------------------------------------------------- */
/* Stripe Connect OAuth (authorize URL, callback, state, connected account)   */
/* -------------------------------------------------------------------------- */

function parseOAuthCallbackParams(
  url: string,
): { code: string; state: string; scope: string } | null {
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
  return (
    typeof stripeUserId === "string" &&
    stripeUserId.startsWith("acct_") &&
    stripeUserId.length > 5
  );
}

/**
 * Stripe payment integration — plans, checkout helpers, Connect OAuth, display.
 */
describe("Stripe payment integration", () => {
  describe("plan-limits module (mocked db)", () => {
    beforeEach(() => {
      subscriptionFindFirst.mockReset();
      subscriptionFindUnique.mockReset();
      subAccountCount.mockReset();
      subAccountFindFirst.mockReset();
      userCount.mockReset();
    });

    describe("getAgencyPlan", () => {
      test("no active subscription → Starter", async () => {
        subscriptionFindFirst.mockResolvedValue(null);
        await expect(getAgencyPlan("ag-1")).resolves.toBe("Starter");
      });
      test("subscription without plan field → Starter", async () => {
        subscriptionFindFirst.mockResolvedValue({ plan: null });
        await expect(getAgencyPlan("ag-1")).resolves.toBe("Starter");
      });
      test("PRO / AGENCY price strings", async () => {
        subscriptionFindFirst.mockResolvedValueOnce({ plan: "price_PRO_PLAN" });
        await expect(getAgencyPlan("ag-1")).resolves.toBe("Pro");
        subscriptionFindFirst.mockResolvedValueOnce({ plan: "price_AGENCY_PLAN" });
        await expect(getAgencyPlan("ag-1")).resolves.toBe("Agency");
      });
      test("unknown plan id → Starter", async () => {
        subscriptionFindFirst.mockResolvedValue({ plan: "price_other" });
        await expect(getAgencyPlan("ag-1")).resolves.toBe("Starter");
      });
    });

    test("getAgencyPlanLimits follows tier", async () => {
      subscriptionFindFirst.mockResolvedValue({ plan: "price_PRO_PLAN" });
      const limits = await getAgencyPlanLimits("ag-1");
      expect(limits.maxSubAccounts).toBe(5);
    });

    describe("canCreateSubAccount", () => {
      test("under limit → allowed", async () => {
        subscriptionFindFirst.mockResolvedValue({ plan: "price_PRO_PLAN" });
        subAccountCount.mockResolvedValue(2);
        const r = await canCreateSubAccount("ag-1");
        expect(r.allowed).toBe(true);
        expect(r.message).toBeUndefined();
      });
      test("at Starter limit → blocked with singular message", async () => {
        subscriptionFindFirst.mockResolvedValue({ plan: "price_other" });
        subAccountCount.mockResolvedValue(1);
        const r = await canCreateSubAccount("ag-1");
        expect(r.allowed).toBe(false);
        expect(r.message).toContain("1 sub-account");
        expect(r.message).not.toContain("sub-accounts");
      });
      test("at Pro limit → plural message", async () => {
        subscriptionFindFirst.mockResolvedValue({ plan: "price_PRO_PLAN" });
        subAccountCount.mockResolvedValue(5);
        const r = await canCreateSubAccount("ag-1");
        expect(r.allowed).toBe(false);
        expect(r.message).toContain("sub-accounts");
      });
    });

    describe("canInviteTeamMember", () => {
      test("under limit → allowed", async () => {
        subscriptionFindFirst.mockResolvedValue({ plan: "price_PRO_PLAN" });
        userCount.mockResolvedValue(1);
        const r = await canInviteTeamMember("ag-1");
        expect(r.allowed).toBe(true);
      });
      test("Starter at ceiling → singular team member message", async () => {
        subscriptionFindFirst.mockResolvedValue({ plan: "price_other" });
        userCount.mockResolvedValue(1);
        const r = await canInviteTeamMember("ag-1");
        expect(r.allowed).toBe(false);
        expect(r.message).toContain("1 team member");
      });
      test("Pro at ceiling → plural", async () => {
        subscriptionFindFirst.mockResolvedValue({ plan: "price_PRO_PLAN" });
        userCount.mockResolvedValue(5);
        const r = await canInviteTeamMember("ag-1");
        expect(r.allowed).toBe(false);
        expect(r.message).toContain("team members");
      });
    });

    test("getAgencyUsageStats aggregates counts and limits", async () => {
      subscriptionFindFirst.mockResolvedValue({ plan: "price_PRO_PLAN" });
      subAccountCount.mockResolvedValue(2);
      userCount.mockResolvedValue(3);
      const stats = await getAgencyUsageStats("ag-1");
      expect(stats.plan).toBe("Pro");
      expect(stats.subAccounts).toEqual({
        current: 2,
        max: 5,
        remaining: 3,
      });
      expect(stats.teamMembers).toEqual({
        current: 3,
        max: 5,
        remaining: 2,
      });
    });

    describe("isSubscriptionRequiredForSubaccountAccess", () => {
      test("no subscription row → not blocked", async () => {
        subscriptionFindUnique.mockResolvedValue(null);
        await expect(
          isSubscriptionRequiredForSubaccountAccess("ag-1"),
        ).resolves.toBe(false);
      });
      test("active subscription → not blocked", async () => {
        subscriptionFindUnique.mockResolvedValue({
          active: true,
          currentPeriodEndDate: new Date(0),
        });
        await expect(
          isSubscriptionRequiredForSubaccountAccess("ag-1"),
        ).resolves.toBe(false);
      });
      test("inactive but period not ended → not blocked", async () => {
        const future = new Date(Date.now() + 86400000);
        subscriptionFindUnique.mockResolvedValue({
          active: false,
          currentPeriodEndDate: future,
        });
        await expect(
          isSubscriptionRequiredForSubaccountAccess("ag-1"),
        ).resolves.toBe(false);
      });
      test("inactive after period, no sub id → blocked", async () => {
        subscriptionFindUnique.mockResolvedValue({
          active: false,
          currentPeriodEndDate: new Date(0),
        });
        await expect(
          isSubscriptionRequiredForSubaccountAccess("ag-1"),
        ).resolves.toBe(true);
      });
      test("inactive after period, first sub only allowed", async () => {
        subscriptionFindUnique.mockResolvedValue({
          active: false,
          currentPeriodEndDate: new Date(0),
        });
        subAccountFindFirst.mockResolvedValue({ id: "sub-first" });
        await expect(
          isSubscriptionRequiredForSubaccountAccess("ag-1", "sub-first"),
        ).resolves.toBe(false);
        await expect(
          isSubscriptionRequiredForSubaccountAccess("ag-1", "sub-other"),
        ).resolves.toBe(true);
      });
      test("inactive, no subaccounts → blocked", async () => {
        subscriptionFindUnique.mockResolvedValue({
          active: false,
          currentPeriodEndDate: new Date(0),
        });
        subAccountFindFirst.mockResolvedValue(null);
        await expect(
          isSubscriptionRequiredForSubaccountAccess("ag-1", "any"),
        ).resolves.toBe(true);
      });
    });

    test("getFirstCreatedSubAccountId", async () => {
      subAccountFindFirst.mockResolvedValue(null);
      await expect(getFirstCreatedSubAccountId("ag-1")).resolves.toBeNull();
      subAccountFindFirst.mockResolvedValue({ id: "first-id" });
      await expect(getFirstCreatedSubAccountId("ag-1")).resolves.toBe("first-id");
    });
  });

  describe("plans & subscription limits", () => {
    describe("plan derivation from Stripe subscription item", () => {
      test("null or undefined → Starter", () => {
        expect(derivePlanName(null)).toBe("Starter");
        expect(derivePlanName(undefined)).toBe("Starter");
      });
      test("PRO / AGENCY price ids map to tiers", () => {
        expect(derivePlanName("price_PRO_PLAN")).toBe("Pro");
        expect(derivePlanName("price_AGENCY_PLAN")).toBe("Agency");
      });
      test("unknown id → Starter; substring PRO still Pro", () => {
        expect(derivePlanName("some_random_plan")).toBe("Starter");
        expect(derivePlanName("my_PRO_plan")).toBe("Pro");
      });
    });

    describe("PLAN_LIMITS", () => {
      test("Starter: 1 subaccount, 1 team member", () => {
        expect(PLAN_LIMITS.Starter.maxSubAccounts).toBe(1);
        expect(PLAN_LIMITS.Starter.maxTeamMembers).toBe(1);
      });
      test("Pro: 5 / 5", () => {
        expect(PLAN_LIMITS.Pro.maxSubAccounts).toBe(5);
        expect(PLAN_LIMITS.Pro.maxTeamMembers).toBe(5);
      });
      test("Agency: unlimited", () => {
        expect(PLAN_LIMITS.Agency.maxSubAccounts).toBe(Infinity);
        expect(PLAN_LIMITS.Agency.maxTeamMembers).toBe(Infinity);
      });
    });

    describe("plan allowance checks", () => {
      test("Starter at capacity blocks new subaccounts", () => {
        const r = checkPlanAllowance("Starter", 1, "maxSubAccounts");
        expect(r.allowed).toBe(false);
        expect(r.message).toContain("Limit reached");
      });
      test("Starter under limit allows", () => {
        const r = checkPlanAllowance("Starter", 0, "maxSubAccounts");
        expect(r.allowed).toBe(true);
        expect(r.maxAllowed).toBe(1);
      });
      test("Pro team member ceiling", () => {
        expect(checkPlanAllowance("Pro", 4, "maxTeamMembers").allowed).toBe(true);
        expect(checkPlanAllowance("Pro", 5, "maxTeamMembers").allowed).toBe(false);
      });
      test("Agency never blocked; unknown plan → Starter limits", () => {
        expect(checkPlanAllowance("Agency", 999, "maxSubAccounts").allowed).toBe(true);
        expect(checkPlanAllowance("Unknown", 0, "maxSubAccounts").maxAllowed).toBe(1);
      });
    });

    describe("internal plan key → Stripe price id", () => {
      test("PRO / AGENCY", () => {
        expect(mapPlanKeyToStripePlan("PRO")).toBe("price_PRO_PLAN");
        expect(mapPlanKeyToStripePlan("AGENCY")).toBe("price_AGENCY_PLAN");
      });
      test("STARTER → null", () => {
        expect(mapPlanKeyToStripePlan("STARTER")).toBeNull();
      });
    });

    describe("billing period end from Stripe unix timestamp", () => {
      test("valid timestamp", () => {
        const ts = 1700000000;
        expect(computePeriodEndDate(ts).getTime()).toBe(ts * 1000);
      });
      test("null → ~30 days ahead", () => {
        const d = computePeriodEndDate(null);
        const diff = d.getTime() - Date.now();
        expect(diff).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
        expect(diff).toBeLessThan(31 * 24 * 60 * 60 * 1000);
      });
    });
  });

  describe("checkout & session helpers", () => {
    describe("line items", () => {
      test("extractPriceIds prefers priceId", () => {
        expect(extractPriceIds([{ priceId: "price_1", id: "fallback" }])).toEqual([
          "price_1",
        ]);
      });
      test("extractPriceIds falls back to id", () => {
        expect(extractPriceIds([{ id: "prod_2" }])).toEqual(["prod_2"]);
      });
      test("buildLineItems default quantity 1", () => {
        expect(buildLineItems([{ priceId: "p1" }])).toEqual([
          { price: "p1", quantity: 1 },
        ]);
      });
      test("buildLineItems respects quantity", () => {
        expect(buildLineItems([{ priceId: "p1", quantity: 3 }])[0]!.quantity).toBe(3);
      });
    });

    describe("success / cancel URL normalization & allowlist", () => {
      test("normalizeBaseUrl strips trailing slash", () => {
        expect(normalizeBaseUrl("https://pixora.app/")).toBe("https://pixora.app");
        expect(normalizeBaseUrl("https://pixora.app")).toBe("https://pixora.app");
      });
      const hosts = ["localhost", "pixora.vercel.app"];
      test("allows trusted hosts", () => {
        expect(isUrlAllowed("http://localhost:3000/success", hosts)).toBe(true);
        expect(isUrlAllowed("https://pixora.vercel.app/billing", hosts)).toBe(true);
      });
      test("rejects other hosts and garbage", () => {
        expect(isUrlAllowed("https://evil.com/steal", hosts)).toBe(false);
        expect(isUrlAllowed("not-a-url", hosts)).toBe(false);
      });
    });

    describe("cart agency consistency", () => {
      test("single agency → valid", () => {
        expect(
          checkCartAgencyConsistency([{ agencyId: "a1" }, { agencyId: "a1" }], "a1"),
        ).toEqual({ valid: true });
      });
      test("mixed agencies → invalid", () => {
        const r = checkCartAgencyConsistency(
          [{ agencyId: "a1" }, { agencyId: "a2" }],
          "a1",
        );
        expect(r.valid).toBe(false);
        expect(r.error).toContain("different agencies");
      });
      test("empty cart → valid", () => {
        expect(checkCartAgencyConsistency([], "a1")).toEqual({ valid: true });
      });
    });
  });

  describe("subscription status mapping", () => {
    test.each(["active", "trialing"])("'%s' counts as active", (s) => {
      expect(isSubscriptionActive(s)).toBe(true);
    });
    test.each([
      "canceled",
      "past_due",
      "unpaid",
      "incomplete",
      "incomplete_expired",
    ])("'%s' is not active", (s) => {
      expect(isSubscriptionActive(s)).toBe(false);
    });
  });

  describe("Stripe Connect OAuth", () => {
    let savedClientId: string | undefined;
    let savedPublicUrl: string | undefined;

    beforeEach(() => {
      savedClientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID;
      savedPublicUrl = process.env.NEXT_PUBLIC_URL;
    });

    afterEach(() => {
      if (savedClientId === undefined) {
        delete process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID;
      } else {
        process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = savedClientId;
      }
      if (savedPublicUrl === undefined) {
        delete process.env.NEXT_PUBLIC_URL;
      } else {
        process.env.NEXT_PUBLIC_URL = savedPublicUrl;
      }
    });

    test("getStripeOAuthLink: agency flow uses env client id and state", () => {
      process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = "ca_test_abc";
      process.env.NEXT_PUBLIC_URL = "https://billing.example.com";
      const url = getStripeOAuthLink("agency", "my-state");
      expect(url).toContain("connect.stripe.com/oauth/authorize");
      expect(url).toContain("response_type=code");
      expect(url).toContain("ca_test_abc");
      expect(url).toContain("scope=read_write");
      expect(url).toContain("state=my-state");
      expect(url).toContain(
        encodeURIComponent("https://billing.example.com/agency"),
      );
    });

    test("getStripeOAuthLink: subaccount flow", () => {
      process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID = "ca_test_xyz";
      const url = getStripeOAuthLink("subaccount", "sub-state");
      expect(url).toContain("ca_test_xyz");
      expect(url).toContain("state=sub-state");
    });

    test("OAuth callback query parsing", () => {
      const result = parseOAuthCallbackParams(
        "http://localhost:3000/agency?code=ac_ABC123&state=launchpad___id-1&scope=read_write",
      );
      expect(result).toEqual({
        code: "ac_ABC123",
        state: "launchpad___id-1",
        scope: "read_write",
      });
      expect(parseOAuthCallbackParams("http://localhost:3000?state=x")).toBeNull();
      expect(parseOAuthCallbackParams("not-a-url")).toBeNull();
      expect(parseOAuthCallbackParams("http://localhost:3000?code=c&state=s")!.scope).toBe(
        "",
      );
    });

    test("OAuth state payload page___agencyId", () => {
      expect(
        parseOAuthState("launchpad___5264d960-4f4b-4ce9-860d-c3116a9ff92a"),
      ).toEqual({
        page: "launchpad",
        agencyId: "5264d960-4f4b-4ce9-860d-c3116a9ff92a",
      });
      expect(parseOAuthState("noseperator")).toBeNull();
      expect(parseOAuthState("a___b___c")).toBeNull();
    });

    test("connected account id acct_* validation", () => {
      expect(validateStripeUserId("acct_1234567890")).toBe(true);
      expect(validateStripeUserId(null)).toBe(false);
      expect(validateStripeUserId(undefined)).toBe(false);
      expect(validateStripeUserId("")).toBe(false);
      expect(validateStripeUserId("cus_1234567890")).toBe(false);
      expect(validateStripeUserId("acct_")).toBe(false);
    });
  });

  describe("utils shared with billing UI", () => {
    test("cn merges tailwind classes", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });

    test("logger logs in development only", () => {
      const prev = process.env.NODE_ENV;
      const logSpy = spyOn(console, "log").mockImplementation(() => {});
      process.env.NODE_ENV = "development";
      logger("hello", { a: 1 });
      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
      process.env.NODE_ENV = "production";
      logger("silent");
      process.env.NODE_ENV = prev;
    });

    test("constructMetadata defaults and noIndex", () => {
      const base = constructMetadata();
      expect(base.title).toBe("Pixora - Agency Management Platform");
      expect(base.metadataBase?.toString()).toMatch(/pawal\.dev/);
      const noIx = constructMetadata({ noIndex: true });
      expect(noIx.robots).toEqual({ index: false, follow: false });
      process.env.NEXT_PUBLIC_URL = "https://app.pixora.test";
      const custom = constructMetadata({
        title: "Billing",
        description: "Pay",
        image: "/og.png",
      });
      expect(custom.openGraph?.images).toEqual([{ url: "/og.png" }]);
      delete process.env.NEXT_PUBLIC_URL;
    });
  });

  describe("pricing display & Stripe metadata", () => {
    test("formatPrice NPR-style label", () => {
      expect(formatPrice(999)).toContain("999");
      expect(formatPrice(999)).toMatch(/^Rs/);
      expect(formatPrice(Number.NaN)).toBe("Rs 0");
      expect(formatPrice(0)).toMatch(/Rs\s*0/);
      const big = formatPrice(12999);
      expect(big).toContain("Rs");
      expect(big).toMatch(/12[,.]?999/);
    });

    test("amounts for Stripe (cents)", () => {
      expect(toCents("100")).toBe(10000);
      expect(toCents("19.99")).toBe(1999);
      expect(toCents("0")).toBe(0);
      expect(toCents(49.5)).toBe(4950);
    });

    test("product description length cap", () => {
      expect(truncateDescription("Short")).toBe("Short");
      expect(truncateDescription("x".repeat(1500)).length).toBe(1000);
      expect(truncateDescription("y".repeat(1000)).length).toBe(1000);
    });
  });
});

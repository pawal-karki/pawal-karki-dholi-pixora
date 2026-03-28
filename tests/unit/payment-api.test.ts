import { describe, expect, test } from "bun:test";
import { PLAN_LIMITS, type PlanLimits, type PlanValidationResult } from "@/lib/plan-limits";

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
    case "PRO": return "price_PRO_PLAN";
    case "AGENCY": return "price_AGENCY_PLAN";
    default: return null;
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

describe("Payment API & plan limits", () => {
  describe("plan derivation from subscription", () => {
    test("null subscription = Starter", () => {
      expect(derivePlanName(null)).toBe("Starter");
    });
    test("undefined subscription = Starter", () => {
      expect(derivePlanName(undefined)).toBe("Starter");
    });
    test("price_PRO_PLAN = Pro", () => {
      expect(derivePlanName("price_PRO_PLAN")).toBe("Pro");
    });
    test("price_AGENCY_PLAN = Agency", () => {
      expect(derivePlanName("price_AGENCY_PLAN")).toBe("Agency");
    });
    test("unknown plan = Starter", () => {
      expect(derivePlanName("some_random_plan")).toBe("Starter");
    });
    test("partial PRO match works", () => {
      expect(derivePlanName("my_PRO_plan")).toBe("Pro");
    });
  });

  describe("PLAN_LIMITS constants", () => {
    test("Starter has 1 subaccount, 1 team member", () => {
      expect(PLAN_LIMITS.Starter.maxSubAccounts).toBe(1);
      expect(PLAN_LIMITS.Starter.maxTeamMembers).toBe(1);
    });
    test("Pro has 5 subaccounts, 5 team members", () => {
      expect(PLAN_LIMITS.Pro.maxSubAccounts).toBe(5);
      expect(PLAN_LIMITS.Pro.maxTeamMembers).toBe(5);
    });
    test("Agency has unlimited", () => {
      expect(PLAN_LIMITS.Agency.maxSubAccounts).toBe(Infinity);
      expect(PLAN_LIMITS.Agency.maxTeamMembers).toBe(Infinity);
    });
  });

  describe("plan allowance checks", () => {
    test("Starter with 0 subaccounts → allowed", () => {
      const r = checkPlanAllowance("Starter", 0, "maxSubAccounts");
      expect(r.allowed).toBe(true);
      expect(r.maxAllowed).toBe(1);
    });
    test("Starter with 1 subaccount → blocked", () => {
      const r = checkPlanAllowance("Starter", 1, "maxSubAccounts");
      expect(r.allowed).toBe(false);
      expect(r.message).toContain("Limit reached");
    });
    test("Pro with 4 team members → allowed", () => {
      const r = checkPlanAllowance("Pro", 4, "maxTeamMembers");
      expect(r.allowed).toBe(true);
    });
    test("Pro with 5 team members → blocked", () => {
      const r = checkPlanAllowance("Pro", 5, "maxTeamMembers");
      expect(r.allowed).toBe(false);
    });
    test("Agency never blocked", () => {
      const r = checkPlanAllowance("Agency", 999, "maxSubAccounts");
      expect(r.allowed).toBe(true);
    });
    test("unknown plan falls back to Starter", () => {
      const r = checkPlanAllowance("Unknown", 0, "maxSubAccounts");
      expect(r.maxAllowed).toBe(1);
    });
  });

  describe("subscription status mapping", () => {
    test("active is active", () => {
      expect(isSubscriptionActive("active")).toBe(true);
    });
    test("trialing is active", () => {
      expect(isSubscriptionActive("trialing")).toBe(true);
    });
    test.each(["canceled", "past_due", "unpaid", "incomplete", "incomplete_expired"])(
      "'%s' is not active", (s) => {
        expect(isSubscriptionActive(s)).toBe(false);
      },
    );
  });

  describe("plan key to Stripe plan mapping", () => {
    test("PRO maps correctly", () => {
      expect(mapPlanKeyToStripePlan("PRO")).toBe("price_PRO_PLAN");
    });
    test("AGENCY maps correctly", () => {
      expect(mapPlanKeyToStripePlan("AGENCY")).toBe("price_AGENCY_PLAN");
    });
    test("unknown key returns null", () => {
      expect(mapPlanKeyToStripePlan("STARTER")).toBeNull();
    });
  });

  describe("period end date computation", () => {
    test("valid timestamp converts to Date", () => {
      const ts = 1700000000;
      const d = computePeriodEndDate(ts);
      expect(d.getTime()).toBe(ts * 1000);
    });
    test("null falls back to ~30 days from now", () => {
      const d = computePeriodEndDate(null);
      const diff = d.getTime() - Date.now();
      expect(diff).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
      expect(diff).toBeLessThan(31 * 24 * 60 * 60 * 1000);
    });
  });

  describe("price to cents conversion", () => {
    test("integer price", () => {
      expect(toCents("100")).toBe(10000);
    });
    test("decimal price", () => {
      expect(toCents("19.99")).toBe(1999);
    });
    test("zero", () => {
      expect(toCents("0")).toBe(0);
    });
    test("number input", () => {
      expect(toCents(49.5)).toBe(4950);
    });
  });

  describe("product description truncation", () => {
    test("short description unchanged", () => {
      expect(truncateDescription("Short")).toBe("Short");
    });
    test("long description truncated at 1000", () => {
      const long = "x".repeat(1500);
      expect(truncateDescription(long).length).toBe(1000);
    });
    test("exactly 1000 chars unchanged", () => {
      const exact = "y".repeat(1000);
      expect(truncateDescription(exact).length).toBe(1000);
    });
  });
});

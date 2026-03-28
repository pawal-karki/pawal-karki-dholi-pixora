import { describe, expect, test } from "bun:test";

type SubscriptionState = {
  active: boolean;
  currentPeriodEndDate: Date;
};

function shouldBlockSubaccountAccess(
  subscription: SubscriptionState | null,
  currentSubAccountId: string | undefined,
  firstSubAccountId: string | null,
): boolean {
  if (!subscription) return false;
  if (subscription.active) return false;
  if (subscription.currentPeriodEndDate > new Date()) return false;
  if (!currentSubAccountId) return true;
  if (!firstSubAccountId) return true;
  return firstSubAccountId !== currentSubAccountId;
}

function computeRemainingResources(current: number, max: number): number {
  return Math.max(0, max - current);
}

function formatLimitMessage(limitType: string, max: number, plan: string): string {
  const plural = max === 1 ? "" : "s";
  return `You've reached the maximum of ${max} ${limitType}${plural} on the ${plan} plan. Upgrade to add more.`;
}

describe("Subscription access control", () => {
  const pastDate = new Date("2025-01-01");
  const futureDate = new Date("2030-12-31");

  describe("shouldBlockSubaccountAccess", () => {
    test("no subscription → not blocked (free tier)", () => {
      expect(shouldBlockSubaccountAccess(null, "sa-1", "sa-1")).toBe(false);
    });

    test("active subscription → not blocked", () => {
      expect(shouldBlockSubaccountAccess(
        { active: true, currentPeriodEndDate: pastDate },
        "sa-2",
        "sa-1",
      )).toBe(false);
    });

    test("inactive but within billing period → not blocked", () => {
      expect(shouldBlockSubaccountAccess(
        { active: false, currentPeriodEndDate: futureDate },
        "sa-2",
        "sa-1",
      )).toBe(false);
    });

    test("expired + first subaccount → not blocked", () => {
      expect(shouldBlockSubaccountAccess(
        { active: false, currentPeriodEndDate: pastDate },
        "sa-1",
        "sa-1",
      )).toBe(false);
    });

    test("expired + non-first subaccount → blocked", () => {
      expect(shouldBlockSubaccountAccess(
        { active: false, currentPeriodEndDate: pastDate },
        "sa-2",
        "sa-1",
      )).toBe(true);
    });

    test("expired + no currentSubAccountId → blocked", () => {
      expect(shouldBlockSubaccountAccess(
        { active: false, currentPeriodEndDate: pastDate },
        undefined,
        "sa-1",
      )).toBe(true);
    });

    test("expired + no first subaccount found → blocked", () => {
      expect(shouldBlockSubaccountAccess(
        { active: false, currentPeriodEndDate: pastDate },
        "sa-1",
        null,
      )).toBe(true);
    });
  });

  describe("remaining resource computation", () => {
    test("3 used out of 5 → 2 remaining", () => {
      expect(computeRemainingResources(3, 5)).toBe(2);
    });
    test("at limit → 0 remaining", () => {
      expect(computeRemainingResources(5, 5)).toBe(0);
    });
    test("over limit → still 0 (clamped)", () => {
      expect(computeRemainingResources(7, 5)).toBe(0);
    });
    test("infinity max → large remaining", () => {
      expect(computeRemainingResources(100, Infinity)).toBe(Infinity);
    });
  });

  describe("limit message formatting", () => {
    test("singular for 1 item", () => {
      const msg = formatLimitMessage("sub-account", 1, "Starter");
      expect(msg).toContain("1 sub-account on");
      expect(msg).not.toContain("sub-accounts");
    });
    test("plural for multiple items", () => {
      const msg = formatLimitMessage("team member", 5, "Pro");
      expect(msg).toContain("5 team members on");
    });
    test("includes plan name", () => {
      const msg = formatLimitMessage("sub-account", 5, "Pro");
      expect(msg).toContain("Pro plan");
    });
  });
});

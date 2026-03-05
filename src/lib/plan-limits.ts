import { db } from "@/lib/db";

export interface PlanLimits {
  maxSubAccounts: number;
  maxTeamMembers: number;
  planName: string;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  Starter: {
    maxSubAccounts: 1,
    maxTeamMembers: 1,
    planName: "Starter",
  },
  Pro: {
    maxSubAccounts: 5,
    maxTeamMembers: 5,
    planName: "Pro",
  },
  Agency: {
    maxSubAccounts: Infinity,
    maxTeamMembers: Infinity,
    planName: "Agency",
  },
};

export interface PlanValidationResult {
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  planName: string;
  message?: string;
}

/**
 * Get current plan for an agency
 */
export async function getAgencyPlan(agencyId: string): Promise<string> {
  const subscription = await db.subscription.findFirst({
    where: { agencyId, active: true },
  });

  if (!subscription?.plan) return "Starter";

  if (subscription.plan.includes("PRO")) return "Pro";
  if (subscription.plan.includes("AGENCY")) return "Agency";

  return "Starter";
}

/**
 * Get plan limits for an agency
 */
export async function getAgencyPlanLimits(agencyId: string): Promise<PlanLimits> {
  const plan = await getAgencyPlan(agencyId);
  return PLAN_LIMITS[plan] || PLAN_LIMITS.Starter;
}

/**
 * Check if agency can create more subaccounts
 */
export async function canCreateSubAccount(agencyId: string): Promise<PlanValidationResult> {
  const [plan, currentCount] = await Promise.all([
    getAgencyPlan(agencyId),
    db.subAccount.count({ where: { agencyId } }),
  ]);

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.Starter;
  const allowed = currentCount < limits.maxSubAccounts;

  return {
    allowed,
    currentCount,
    maxAllowed: limits.maxSubAccounts,
    planName: plan,
    message: allowed
      ? undefined
      : `You've reached the maximum of ${limits.maxSubAccounts} sub-account${limits.maxSubAccounts === 1 ? "" : "s"} on the ${plan} plan. Upgrade to add more.`,
  };
}

/**
 * Check if agency can invite more team members
 */
export async function canInviteTeamMember(agencyId: string): Promise<PlanValidationResult> {
  const [plan, currentCount] = await Promise.all([
    getAgencyPlan(agencyId),
    db.user.count({ where: { agencyId } }),
  ]);

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.Starter;
  const allowed = currentCount < limits.maxTeamMembers;

  return {
    allowed,
    currentCount,
    maxAllowed: limits.maxTeamMembers,
    planName: plan,
    message: allowed
      ? undefined
      : `You've reached the maximum of ${limits.maxTeamMembers} team member${limits.maxTeamMembers === 1 ? "" : "s"} on the ${plan} plan. Upgrade to add more.`,
  };
}

/**
 * Get usage stats for an agency
 */
export async function getAgencyUsageStats(agencyId: string) {
  const [plan, subAccountCount, teamMemberCount] = await Promise.all([
    getAgencyPlan(agencyId),
    db.subAccount.count({ where: { agencyId } }),
    db.user.count({ where: { agencyId } }),
  ]);

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.Starter;

  return {
    plan,
    subAccounts: {
      current: subAccountCount,
      max: limits.maxSubAccounts,
      remaining: Math.max(0, limits.maxSubAccounts - subAccountCount),
    },
    teamMembers: {
      current: teamMemberCount,
      max: limits.maxTeamMembers,
      remaining: Math.max(0, limits.maxTeamMembers - teamMemberCount),
    },
  };
}

/**
 * Whether subaccount access should be blocked due to an ended/cancelled subscription.
 * Access is allowed during the paid period and blocked only after period end.
 */
export async function isSubscriptionRequiredForSubaccountAccess(
  agencyId: string
): Promise<boolean> {
  const subscription = await db.subscription.findUnique({
    where: { agencyId },
  });

  // No subscription record means starter/free flow.
  if (!subscription) return false;

  // Active subscriptions are always allowed.
  if (subscription.active) return false;

  // Keep access until billing period end.
  const now = new Date();
  if (subscription.currentPeriodEndDate > now) return false;

  // Subscription has ended and is inactive.
  return true;
}

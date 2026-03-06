import React from "react";
import { redirect } from "next/navigation";

import { getAgencyDetails, getAuthDetails } from "@/lib/queries";
import { syncSubscriptionFromSession } from "@/lib/stripe-actions";
import { getAgencyUsageStats } from "@/lib/plan-limits";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Users, Layers } from "lucide-react";
import AgencySubscriptionSection from "@/components/modules/agency/AgencySubscriptionSection";
import { AutoDismissAlert } from "@/components/ui/auto-dismiss-alert";

interface BillingPageProps {
  params: Promise<{ agencyId: string | undefined }>;
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    session_id?: string;
    subscription_required?: string;
  }>;
}

export default async function BillingPage({ params, searchParams }: BillingPageProps) {
  const { agencyId } = await params;
  const { success, canceled, session_id, subscription_required } = await searchParams;

  if (!agencyId) redirect("/agency/unauthorized");

  // Parallelize initial data fetches
  const [user, agencyDetails] = await Promise.all([
    getAuthDetails(),
    getAgencyDetails(agencyId),
  ]);

  if (!user) redirect("/agency/sign-in");
  if (!agencyDetails) redirect("/agency/unauthorized");

  // Sync subscription from Stripe session if returning from checkout
  if (success === "true" && session_id) {
    await syncSubscriptionFromSession(session_id, agencyId);
  }

  const isOwner = user.role === Role.AGENCY_OWNER;

  // Fetch plan prices and usage stats server-side
  const [planPricesData, usageStats] = await Promise.all([
    db.planPrice.findMany(),
    getAgencyUsageStats(agencyId),
  ]);

  const planPrices: Record<string, string> = {};
  for (const p of planPricesData) {
    planPrices[p.key] = p.priceId;
  }

  // Get current subscription
  const subscription = agencyDetails.Subscriptions?.[0];
  const currentPlan = usageStats.plan;
  const isActive = subscription?.active ?? false;
  const periodEnd = subscription?.currentPeriodEndDate;

  // Calculate usage percentages for progress bars
  const subAccountUsagePercent = usageStats.subAccounts.max === Infinity
    ? 0
    : Math.min(100, (usageStats.subAccounts.current / usageStats.subAccounts.max) * 100);
  const teamUsagePercent = usageStats.teamMembers.max === Infinity
    ? 0
    : Math.min(100, (usageStats.teamMembers.current / usageStats.teamMembers.max) * 100);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Billing</h1>
      <Separator />

      {/* Success/Canceled Alerts - Auto dismiss after 5 seconds */}
      {success === "true" && (
        <AutoDismissAlert
          type="success"
          title="Subscription Successful!"
          description="Thank you for subscribing. Your plan has been activated."
          duration={5000}
        />
      )}

      {canceled === "true" && (
        <AutoDismissAlert
          type="warning"
          title="Checkout Canceled"
          description="Your checkout was canceled. You can try again anytime."
          duration={5000}
        />
      )}

      {subscription_required === "true" && (
        <AutoDismissAlert
          type="warning"
          title="Subscription Required"
          description="Your subscription period has ended. Renew a paid plan to access subaccounts."
          duration={7000}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{currentPlan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={
                    isActive || currentPlan === "Starter" ? "default" : "destructive"
                  }
                >
                  {isActive || currentPlan === "Starter" ? "Active" : "Inactive"}
                </Badge>
              </div>
              {periodEnd && isActive && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Renews</span>
                  <span className="font-medium text-sm">
                    {new Date(periodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Your current resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Sub Accounts Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Sub Accounts</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usageStats.subAccounts.current} / {usageStats.subAccounts.max === Infinity ? "∞" : usageStats.subAccounts.max}
                  </span>
                </div>
                {usageStats.subAccounts.max !== Infinity && (
                  <Progress
                    value={subAccountUsagePercent}
                    className={subAccountUsagePercent >= 100 ? "bg-red-100" : ""}
                  />
                )}
                {usageStats.subAccounts.remaining === 0 && usageStats.subAccounts.max !== Infinity && (
                  <p className="text-xs text-amber-600">Limit reached. Upgrade to add more.</p>
                )}
              </div>

              {/* Team Members Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Team Members</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usageStats.teamMembers.current} / {usageStats.teamMembers.max === Infinity ? "∞" : usageStats.teamMembers.max}
                  </span>
                </div>
                {usageStats.teamMembers.max !== Infinity && (
                  <Progress
                    value={teamUsagePercent}
                    className={teamUsagePercent >= 100 ? "bg-red-100" : ""}
                  />
                )}
                {usageStats.teamMembers.remaining === 0 && usageStats.teamMembers.max !== Infinity && (
                  <p className="text-xs text-amber-600">Limit reached. Upgrade to add more.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {subscription?.customerId
                ? "Payment method on file."
                : "No payment method."}
              {agencyDetails.connectAccountId ? " Stripe Connect enabled." : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <h2 className="text-2xl font-bold mt-8">Available Plans</h2>
      <Separator />

      <AgencySubscriptionSection
        agencyId={agencyId}
        isOwner={isOwner}
        currentPlan={currentPlan}
        hasActiveSubscription={isActive}
        planPrices={planPrices}
      />
    </div>
  );
}

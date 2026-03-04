"use client";

import React, { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

import { PRICING } from "@/config/pricing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PlanPrices = Record<string, string>;

interface Props {
  agencyId: string;
  isOwner: boolean;
  currentPlan?: string | null;
  hasActiveSubscription?: boolean;
  planPrices: PlanPrices;
}

const PLAN_KEY_MAP: Record<string, string> = {
  Starter: "STARTER",
  Pro: "PRO",
  Agency: "AGENCY",
};

export default function AgencySubscriptionSection({
  agencyId,
  isOwner,
  currentPlan,
  hasActiveSubscription = false,
  planPrices,
}: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const getPriceId = useCallback(
    (planTitle: string): string => {
      const key = PLAN_KEY_MAP[planTitle];
      return key ? planPrices[key] || "" : "";
    },
    [planPrices]
  );

  const isCurrentPlan = useCallback(
    (planTitle: string) => {
      if (!currentPlan) return planTitle === "Starter";
      return currentPlan.toLowerCase().includes(planTitle.toLowerCase());
    },
    [currentPlan]
  );

  const handleSubscribe = useCallback(
    async (planTitle: string) => {
      if (!isOwner) {
        toast.error("Only the agency owner can manage subscriptions.");
        return;
      }

      const priceId = getPriceId(planTitle);
      if (!priceId) {
        toast.error("Price not configured for this plan.");
        return;
      }

      try {
        setLoadingPlan(planTitle);

        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/agency/${agencyId}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/agency/${agencyId}/billing?canceled=true`;

        const res = await fetch("/api/stripe/create-subscription-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agencyId, priceId, successUrl, cancelUrl }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to start checkout");
        }

        if (!data.url) {
          throw new Error("Invalid response from server");
        }

        // Redirect to Stripe checkout page
        window.location.href = data.url;
      } catch (err) {
        toast.error("Subscription failed", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
        setLoadingPlan(null);
      }
    },
    [agencyId, isOwner, getPriceId]
  );

  const canCancelPaidPlan = useMemo(
    () =>
      isOwner &&
      hasActiveSubscription &&
      !!currentPlan &&
      !currentPlan.toLowerCase().includes("starter"),
    [isOwner, hasActiveSubscription, currentPlan]
  );

  const handleCancelSubscription = useCallback(async () => {
    if (!canCancelPaidPlan) return;
    const confirmed = window.confirm(
      "Are you sure you want to cancel your current subscription?"
    );
    if (!confirmed) return;

    try {
      setIsCancelling(true);
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      toast.success("Subscription will cancel at period end.");
      window.location.reload();
    } catch (err) {
      toast.error("Cancellation failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsCancelling(false);
    }
  }, [agencyId, canCancelPaidPlan]);

  return (
    <div className="flex flex-col gap-6">
      {!isOwner && (
        <p className="text-sm text-muted-foreground">
          Only the agency owner can manage subscriptions.
        </p>
      )}

      {canCancelPaidPlan && (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={isCancelling}
            onClick={handleCancelSubscription}
          >
            {isCancelling ? "Cancelling..." : "Cancel Current Subscription"}
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PRICING.map((plan) => {
          const priceId = getPriceId(plan.title);
          const isCurrent = isCurrentPlan(plan.title);
          const isStarter = plan.title === "Starter";
          const isLoading = loadingPlan === plan.title;

          return (
            <Card
              key={plan.title}
              className={`relative overflow-hidden ${
                plan.title === "Pro" ? "border-primary" : ""
              } ${isCurrent ? "ring-2 ring-primary" : ""}`}
            >
              {plan.title === "Pro" && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-0 left-0 bg-emerald-500 text-white px-3 py-1 text-xs font-medium rounded-br-lg">
                  Current
                </div>
              )}

              <CardHeader className={isCurrent ? "pt-8" : ""}>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  {plan.price}
                  {plan.duration && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {plan.duration}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">{plan.highlight}</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {plan.features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                </div>

                <SubscribeButton
                  isStarter={isStarter}
                  isCurrent={isCurrent}
                  isOwner={isOwner}
                  isLoading={isLoading}
                  hasPriceId={!!priceId}
                  onSubscribe={() => handleSubscribe(plan.title)}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

interface SubscribeButtonProps {
  isStarter: boolean;
  isCurrent: boolean;
  isOwner: boolean;
  isLoading: boolean;
  hasPriceId: boolean;
  onSubscribe: () => void;
}

function SubscribeButton({
  isStarter,
  isCurrent,
  isOwner,
  isLoading,
  hasPriceId,
  onSubscribe,
}: SubscribeButtonProps) {
  if (isStarter) {
    return (
      <Button className="w-full mt-2" size="sm" variant="outline" disabled>
        {isCurrent ? "Current Plan" : "Free Plan"}
      </Button>
    );
  }

  if (isCurrent) {
    return (
      <Button className="w-full mt-2" size="sm" variant="outline" disabled>
        Current Plan
      </Button>
    );
  }

  if (!hasPriceId) {
    return (
      <Button className="w-full mt-2" size="sm" variant="outline" disabled>
        Not Available
      </Button>
    );
  }

  return (
    <Button
      className="w-full mt-2"
      size="sm"
      disabled={!isOwner || isLoading}
      onClick={onSubscribe}
    >
      {isLoading ? "Redirecting..." : "Subscribe"}
    </Button>
  );
}

import React from "react";
import { redirect } from "next/navigation";

import { getAgencyDetails, getAuthDetails } from "@/lib/queries";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BillingPageProps {
  params: Promise<{
    agencyId: string | undefined;
  }>;
}

const BillingPage: React.FC<BillingPageProps> = async ({ params }) => {
  const { agencyId } = await params;
  const user = await getAuthDetails();

  if (!user) redirect("/agency/sign-in");
  if (!agencyId) redirect("/agency/unauthorized");

  const agencyDetails = await getAgencyDetails(agencyId);

  if (!agencyDetails) redirect("/agency/unauthorized");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Billing</h1>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Your current subscription plan details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-emerald-500">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Your current usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sub Accounts</span>
                <span className="font-medium">
                  {agencyDetails.SubAccounts?.length || 0} /{" "}
                  {agencyDetails.goal}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Team Members</span>
                <span className="font-medium">Unlimited</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              No payment method on file.
              {agencyDetails.connectAccountId
                ? " Stripe is connected."
                : " Connect Stripe to add payment methods."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <h2 className="text-2xl font-bold mt-8">Available Plans</h2>
      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        {/* Starter Plan */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Starter</CardTitle>
            <CardDescription>
              Ideal for individuals exploring Pixora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">Free</div>
            <p className="text-sm font-semibold mb-3">Included features</p>
            <ul className="space-y-2 text-sm">
              <li>✓ 1 Sub-account</li>
              <li>✓ 1 Team member</li>
              <li>✓ Basic drag-and-drop builder</li>
              <li>✓ Publish to Pixora subdomain</li>
              <li>✓ Limited templates</li>
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="relative overflow-hidden border-primary">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
            Popular
          </div>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For freelancers and growing teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              NPR 3,799
              <span className="text-sm font-normal text-muted-foreground">
                /month
              </span>
            </div>
            <p className="text-sm font-semibold mb-3">
              Everything in Starter plus
            </p>
            <ul className="space-y-2 text-sm">
              <li>✓ Up to 5 Sub-accounts</li>
              <li>✓ Up to 5 Team members</li>
              <li>✓ Custom domain deployment</li>
              <li>✓ Advanced funnel builder</li>
              <li>✓ CRM & lead management</li>
              <li>✓ Access to premium templates</li>
            </ul>
          </CardContent>
        </Card>

        {/* Agency Plan */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Agency</CardTitle>
            <CardDescription>
              Complete toolkit for digital agencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              NPR 12,999
              <span className="text-sm font-normal text-muted-foreground">
                /month
              </span>
            </div>
            <p className="text-sm font-semibold mb-3">Everything in Pro plus</p>
            <ul className="space-y-2 text-sm">
              <li>✓ Unlimited Sub-accounts</li>
              <li>✓ Unlimited Team members</li>
              <li>✓ White-label branding</li>
              <li>✓ Client billing via Stripe Connect</li>
              <li>✓ Performance analytics dashboard</li>
              <li>✓ Priority support</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingPage;

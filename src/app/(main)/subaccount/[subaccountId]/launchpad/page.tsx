import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Funnel } from "lucide-react";

import { getSubAccountDetails } from "@/lib/queries";
import { connectStripeSubAccount } from "@/lib/stripe-actions";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LaunchpadPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const LaunchpadPage: React.FC<LaunchpadPageProps> = async ({
  params,
  searchParams,
}) => {
  const { subaccountId } = await params;
  const { code } = await searchParams;

  if (!subaccountId) redirect("/subaccount/unauthorized");

  let subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  let connectedStripeAccount = false;

  // Handle Stripe OAuth callback
  if (code && !subAccountDetails.connectAccountId) {
    console.log(
      "Received Stripe OAuth code for subaccount, attempting to connect..."
    );
    const result = await connectStripeSubAccount(subaccountId, code);
    console.log("Stripe connect result:", result);
    if (result.success) {
      connectedStripeAccount = true;
      // Refresh subaccount details
      const refreshedDetails = await getSubAccountDetails(subaccountId);
      if (refreshedDetails) {
        subAccountDetails = refreshedDetails;
      }
    } else {
      console.error("Stripe connect failed:", result.error);
    }
  }

  const isAllDetailsExist =
    subAccountDetails.address &&
    subAccountDetails.subAccountLogo &&
    subAccountDetails.city &&
    subAccountDetails.companyEmail &&
    subAccountDetails.companyPhone &&
    subAccountDetails.country &&
    subAccountDetails.name &&
    subAccountDetails.state &&
    subAccountDetails.zipCode;

  // Build the Stripe OAuth link
  const stripeOAuthLink = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&state=subaccount___${subaccountId}`;

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full h-full max-w-[800px]">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Lets get started!</CardTitle>
            <CardDescription>
              Follow the steps below to get your subaccount setup
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center border p-4 rounded-md gap-2">
              <div className="flex md:items-center gap-4 flex-col md:flex-row">
                <Image
                  src={subAccountDetails.subAccountLogo}
                  alt="App Logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>Fill in all your business details</p>
              </div>
              {isAllDetailsExist ? (
                <CheckCircle2
                  role="status"
                  aria-label="Done"
                  className="text-emerald-500 p-2 flex-shrink-0 w-12 h-12"
                />
              ) : (
                <Link
                  href={`/subaccount/${subaccountId}/settings`}
                  className={buttonVariants()}
                >
                  Start
                </Link>
              )}
            </div>
            <div className="flex justify-between items-center border p-4 rounded-md gap-2">
              <div className="flex md:items-center gap-4 flex-col md:flex-row">
                <Image
                  src="/stripelogo.png"
                  alt="Stripe Logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>Connect your Stripe account to accept payments</p>
              </div>
              {subAccountDetails.connectAccountId || connectedStripeAccount ? (
                <CheckCircle2
                  role="status"
                  aria-label="Done"
                  className="text-emerald-500 p-2 flex-shrink-0 w-12 h-12"
                />
              ) : (
                <Link href={stripeOAuthLink} className={buttonVariants()}>
                  Connect Stripe
                </Link>
              )}
            </div>
            <div className="flex justify-between items-center border p-4 rounded-md gap-2">
              <div className="flex md:items-center gap-4 flex-col md:flex-row">
                <div className="h-20 w-20 rounded-md bg-muted p-4 flex items-center justify-center flex-shrink-0">
                  <Funnel className="h-full w-full text-muted-foreground" />
                </div>
                <p>Create your first funnel</p>
              </div>
              <Link
                href={`/subaccount/${subaccountId}/funnels`}
                className={buttonVariants()}
              >
                Start
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchpadPage;

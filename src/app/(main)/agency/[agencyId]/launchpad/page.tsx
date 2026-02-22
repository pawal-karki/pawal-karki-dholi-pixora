import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { getAgencyDetails } from "@/lib/queries";
import { connectStripeAccount } from "@/lib/stripe-actions";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LaunchpadPageProps {
  params: Promise<{
    agencyId: string | undefined;
  }>;
  searchParams: Promise<{
    code: string | undefined;
  }>;
}

const LaunchpadPage: React.FC<LaunchpadPageProps> = async ({
  params,
  searchParams,
}) => {
  const { agencyId } = await params;
  const { code } = await searchParams;

  if (!agencyId) redirect("/agency/unauthorized");

  let agencyDetails = await getAgencyDetails(agencyId);

  if (!agencyDetails) redirect("/agency/unauthorized");

  const isAllDetailsExist =
    agencyDetails.address &&
    agencyDetails.agencyLogo &&
    agencyDetails.city &&
    agencyDetails.companyEmail &&
    agencyDetails.companyPhone &&
    agencyDetails.country &&
    agencyDetails.name &&
    agencyDetails.state &&
    agencyDetails.zipCode;

  // Build the Stripe OAuth link
  const stripeOAuthLink = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_URL}agency&state=launchpad___${agencyDetails.id}`;

  let connectedStripeAccount: boolean = false;

  // Handle Stripe OAuth callback - exchange code for access token and save
  if (code && !agencyDetails.connectAccountId) {
    console.log("Received Stripe OAuth code, attempting to connect...");
    const result = await connectStripeAccount(agencyId, code);
    console.log("Stripe connect result:", result);
    if (result.success) {
      connectedStripeAccount = true;
      // Refresh agency details to get the updated connectAccountId
      const refreshedDetails = await getAgencyDetails(agencyId);
      if (refreshedDetails) {
        agencyDetails = refreshedDetails;
      }
    } else {
      console.error("Stripe connect failed:", result.error);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full h-full max-w-[800px]">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Lets get started!</CardTitle>
            <CardDescription>
              Follow the steps below to get your account setup
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">

            <div className="flex justify-between items-center border p-4 rounded-md gap-2">
              <div className="flex md:items-center gap-4 flex-col md:flex-row">
                <Image
                  src="/stripelogo.png"
                  alt="App Logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>
                  Connect your stripe account to accept payments and see your
                  dashboard.
                </p>
              </div>
              {agencyDetails.connectAccountId || connectedStripeAccount ? (
                <CheckCircle2
                  role="status"
                  aria-label="Done"
                  className="text-emerald-500 p-2 flex-shrink-0 w-12 h-12"
                />
              ) : (
                <Link href={stripeOAuthLink} className={buttonVariants()}>
                  Start
                </Link>
              )}
            </div>
            <div className="flex justify-between items-center border p-4 rounded-md gap-2">
              <div className="flex md:items-center gap-4 flex-col md:flex-row">
                <Image
                  src={agencyDetails.agencyLogo}
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
                  href={`/agency/${agencyId}/settings`}
                  className={buttonVariants()}
                >
                  Start
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchpadPage;


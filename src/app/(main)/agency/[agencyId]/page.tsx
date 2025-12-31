import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Clipboard,
  Contact2,
  DollarSign,
  Goal,
} from "lucide-react";

import { getAgencyDetails, getSubAccountsByAgency } from "@/lib/queries";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface AgencyIdPageProps {
  params: Promise<{
    agencyId: string | undefined;
  }>;
}

const AgencyIdPage: React.FC<AgencyIdPageProps> = async ({ params }) => {
  const { agencyId } = await params;

  if (!agencyId) redirect("/agency/unauthorized");

  const agencyDetails = await getAgencyDetails(agencyId);

  if (!agencyDetails) redirect("/agency/unauthorized");

  const subAccounts = await getSubAccountsByAgency(agencyId);

  return (
    <div className="relative h-full">
      {!agencyDetails.connectAccountId && (
        <div className="absolute -top-10 -left-10 right-0 bottom-0 z-30 flex items-center justify-center backdrop-blur-md bg-background/50">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Stripe</CardTitle>
              <CardDescription>
                You need to connect your stripe account to see metrics
              </CardDescription>
              <Link
                href={`/agency/${agencyDetails.id}/launchpad`}
                className="p-2 w-fit bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Clipboard className="w-4 h-4" />
                Launch Pad
              </Link>
            </CardHeader>
          </Card>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <Separator className="mt-2 mb-6" />
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex gap-4 flex-col xl:!flex-row">
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>Income</CardDescription>
              <CardTitle className="text-4xl">$0.00</CardTitle>
              <small className="text-xs text-muted-foreground">
                For the year {format(new Date(), "yyyy")}
              </small>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Total revenue generated as reflected in your stripe dashboard.
            </CardContent>
            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>Potential Income</CardDescription>
              <CardTitle className="text-4xl">$0.00</CardTitle>
              <small className="text-xs text-muted-foreground">
                For the year {format(new Date(), "yyyy")}
              </small>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This is how much you can close.
            </CardContent>
            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>Active Clients</CardDescription>
              <CardTitle className="text-4xl">{subAccounts.length}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Reflects the number of sub accounts you own and manage.
            </CardContent>
            <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
          <Card className="flex-1 relative">
            <CardHeader>
              <CardTitle>Agency Goal</CardTitle>
              <CardDescription>
                <p className="mt-2">
                  Reflects the number of sub accounts you want to own and
                  manage.
                </p>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">
                    Current: {subAccounts.length}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Goal: {agencyDetails.goal}
                  </span>
                </div>
                <Progress
                  value={(subAccounts.length / agencyDetails.goal) * 100}
                />
              </div>
            </CardFooter>
            <Goal className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
        </div>
        <div className="flex gap-4 xl:!flex-row flex-col">
          <Card className="p-4 flex-1">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Connect your Stripe account to view transaction history
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
              No transaction data available
            </CardContent>
          </Card>
          <Card className="xl:w-[400px] w-full">
            <CardHeader>
              <CardTitle>Conversions</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
              Connect Stripe to view conversion metrics
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgencyIdPage;

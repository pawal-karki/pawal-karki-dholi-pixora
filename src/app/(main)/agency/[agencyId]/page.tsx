import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Clipboard,
  Contact2,
  CreditCard,
  DollarSign,
  Goal,
  TrendingUp,
  ArrowUpRight,
  Wallet,
} from "lucide-react";

import { getAgencyDetails, getSubAccountsByAgency, getAuthDetails } from "@/lib/queries";
import {
  getAgencyDashboardMetrics,
  getStripeTransactions,
  getStripeTransactionsByDateRange,
  getAgencySubscriptionHistory,
} from "@/lib/stripe/dashboard";
import { subMonths } from "date-fns";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionHistory } from "@/components/modules/dashboard/transaction-history";
import { ClientTransactionGraph } from "@/components/modules/dashboard/client-transaction-graph";

interface AgencyIdPageProps {
  params: Promise<{
    agencyId: string | undefined;
  }>;
}

const AgencyIdPage: React.FC<AgencyIdPageProps> = async ({ params }) => {
  const { agencyId } = await params;

  if (!agencyId) redirect("/agency/unauthorized");

  // Parallelize initial data fetches
  const [agencyDetails, subAccounts, user] = await Promise.all([
    getAgencyDetails(agencyId),
    getSubAccountsByAgency(agencyId),
    getAuthDetails(),
  ]);

  if (!agencyDetails || !user) redirect("/agency/unauthorized");

  if (user.role !== "AGENCY_OWNER" && user.role !== "AGENCY_ADMIN") {
    redirect("/subaccount");
  }

  const subAccountIds = subAccounts.map((sub) => sub.id);

  // Parallelize all Stripe/metrics fetches
  const endDate = new Date();
  const startDate = subMonths(endDate, 3);

  const [metrics, stripeTransactions, subscriptionHistory, graphTransactions] = await Promise.all([
    getAgencyDashboardMetrics(agencyId, agencyDetails.connectAccountId, subAccountIds),
    agencyDetails.connectAccountId
      ? getStripeTransactions(agencyDetails.connectAccountId, 10, subAccountIds)
      : Promise.resolve([]),
    getAgencySubscriptionHistory(agencyId),
    agencyDetails.connectAccountId
      ? getStripeTransactionsByDateRange(agencyDetails.connectAccountId, startDate, endDate, subAccountIds)
      : Promise.resolve([]),
  ]);

  // Format currency
  const formatCurrency = (amount: number, currency: string = "NPR") => {
    return `${currency} ${amount.toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate goal progress
  const goalProgress = Math.min(
    100,
    (subAccounts.length / agencyDetails.goal) * 100
  );

  return (
    <div className="relative h-full">
      {!agencyDetails.connectAccountId && (
        <div className="absolute -top-10 -left-10 right-0 bottom-0 z-30 flex items-center justify-center backdrop-blur-md bg-background/50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Connect Your Stripe
              </CardTitle>
              <CardDescription>
                You need to connect your Stripe account to see revenue metrics
                and accept payments from clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/agency/${agencyDetails.id}/launchpad`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Clipboard className="w-4 h-4" />
                Go to Launch Pad
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <Separator className="mt-2 mb-6" />

      <div className="flex flex-col gap-6 pb-6">
        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Income Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Income
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(metrics.totalRevenue)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Total revenue for {format(new Date(), "yyyy")}
              </p>
              {metrics.totalRevenue > 0 && (
                <p className="text-xs text-emerald-600 mt-1">
                  Via Stripe Connect
                </p>
              )}
            </CardContent>
            <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </Card>

          {/* Potential Income Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Potential Income
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(metrics.potentialIncome)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                From pipeline opportunities
              </p>
              {metrics.potentialIncome > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Active deals in progress
                </p>
              )}
            </CardContent>
            <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>

          {/* Active Clients Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Contact2 className="h-4 w-4" />
                Active Clients
              </CardDescription>
              <CardTitle className="text-3xl font-bold">
                {subAccounts.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Sub accounts you manage
              </p>
            </CardContent>
            <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Contact2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </Card>

          {/* Agency Goal Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Goal className="h-4 w-4" />
                Agency Goal
              </CardDescription>
              <CardTitle className="text-xl font-bold">
                {subAccounts.length} / {agencyDetails.goal}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={goalProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {goalProgress >= 100
                  ? "🎉 Goal achieved!"
                  : `${Math.round(goalProgress)}% towards goal`}
              </p>
            </CardContent>
            <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Goal className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </Card>
        </div>

        {/* Revenue Overview Graph */}
        {(agencyDetails.connectAccountId || metrics.potentialIncome > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Income from client payments and potential income from pipeline opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientTransactionGraph
                transactions={graphTransactions}
                potentialIncome={metrics.potentialIncome}
                startDate={startDate}
                endDate={endDate}
                currency={metrics.currency}
              />
            </CardContent>
          </Card>
        )}

        {/* Transaction History Section */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Recent payments and subscription activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="subscriptions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="subscriptions">
                    My Subscriptions
                  </TabsTrigger>
                  <TabsTrigger value="client-payments">
                    Client Payments
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="subscriptions">
                  <TransactionHistory
                    transactions={subscriptionHistory}
                    emptyMessage="No subscription payments yet"
                  />
                </TabsContent>

                <TabsContent value="client-payments">
                  {agencyDetails.connectAccountId ? (
                    stripeTransactions.length > 0 ? (
                      <TransactionHistory
                        transactions={stripeTransactions}
                        emptyMessage="No client payments received yet"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                        <CreditCard className="h-12 w-12 mb-4 opacity-20" />
                        <p className="font-medium">No client payments yet</p>
                        <p className="text-sm text-center mt-1 max-w-xs">
                          Payments will appear here when clients complete checkout on your funnels
                        </p>
                        <p className="text-xs text-muted-foreground mt-3">
                          Stripe Connect: Connected ✓
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                      <Wallet className="h-12 w-12 mb-4 opacity-20" />
                      <p className="font-medium">Stripe Connect Required</p>
                      <p className="text-sm text-center mt-1">
                        Connect Stripe to receive client payments
                      </p>
                      <Link
                        href={`/agency/${agencyDetails.id}/launchpad`}
                        className="mt-3 text-sm text-primary hover:underline"
                      >
                        Set up Stripe Connect →
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Stats / Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Summary</CardTitle>
              <CardDescription>
                {format(new Date(), "MMMM yyyy")} overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Revenue</p>
                    <p className="text-xs text-muted-foreground">This year</p>
                  </div>
                </div>
                <p className="font-bold text-emerald-600">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pipeline Value</p>
                    <p className="text-xs text-muted-foreground">Open deals</p>
                  </div>
                </div>
                <p className="font-bold text-blue-600">
                  {formatCurrency(metrics.potentialIncome)}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Contact2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Clients</p>
                    <p className="text-xs text-muted-foreground">Sub accounts</p>
                  </div>
                </div>
                <p className="font-bold">{subAccounts.length}</p>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Need more insights?
                </p>
                <Link
                  href={`/agency/${agencyDetails.id}/billing`}
                  className="text-sm text-primary hover:underline"
                >
                  View Billing Details →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgencyIdPage;

import React from "react";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
  Contact2,
  DollarSign,
  Goal,
} from "lucide-react";

import { getSubAccountDetails } from "@/lib/queries";
import { db } from "@/lib/db";

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
import FunnelPerformance from "@/components/modules/dashboard/funnel-performance";

interface SubAccountIdPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const SubAccountIdPage: React.FC<SubAccountIdPageProps> = async ({ params }) => {
  const { subaccountId } = await params;

  if (!subaccountId) redirect("/subaccount/unauthorized");

  const subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  // Get counts for dashboard
  // TODO: cache dashboard counts to avoid repeated queries on refresh
  const funnelCount = await db.funnel.count({
    where: { subAccountId: subaccountId },
  });

  const pipelineCount = await db.pipeline.count({
    where: { subAccountId: subaccountId },
  });

  const contactCount = await db.contact.count({
    where: { subAccountId: subaccountId },
  });

  const funnels = await db.funnel.findMany({
    where: { subAccountId: subaccountId },
    include: { funnelPages: true },
  });

  const funnelPerformanceData = funnels
    .map((funnel) => funnel.funnelPages)
    .flat()
    .reduce((acc, page) => {
      // If visits is null or undefined, treat as 0
      const visits = page.visits || 0;

      const existing = acc.find((e) => e.name === page.name);
      if (existing) {
        existing.visits += visits;
      } else {
        acc.push({ name: page.name, visits: visits });
      }
      return acc;
    }, [] as { name: string; visits: number }[]);

  return (
    <div className="relative h-full">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <Separator className="mt-2 mb-6" />

      <div className="flex flex-col gap-4 pb-6">
        <div className="flex gap-4 flex-col xl:!flex-row">
          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>Total Funnels</CardDescription>
              <CardTitle className="text-4xl">{funnelCount}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Number of funnels created for this subaccount.
            </CardContent>
            <DollarSign className="absolute right-4 top-4 text-muted-foreground" />
          </Card>

          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>Pipelines</CardDescription>
              <CardTitle className="text-4xl">{pipelineCount}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Active pipelines for managing leads and deals.
            </CardContent>
            <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
          </Card>

          <Card className="flex-1 relative">
            <CardHeader>
              <CardDescription>Contacts</CardDescription>
              <CardTitle className="text-4xl">{contactCount}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Total contacts in your database.
            </CardContent>
            <Contact2 className="absolute right-4 top-4 text-muted-foreground" />
          </Card>

          <Card className="flex-1 relative">
            <CardHeader>
              <CardTitle>Subaccount Goal</CardTitle>
              <CardDescription>
                <p className="mt-2">
                  Track your progress towards your revenue goal.
                </p>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">
                    Current: $0
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Goal: ${subAccountDetails.goal.toLocaleString()}
                  </span>
                </div>
                <Progress value={0} />
              </div>
            </CardFooter>
            <Goal className="absolute right-4 top-4 text-muted-foreground" />
          </Card>
        </div>

        <div className="flex gap-4 xl:!flex-row flex-col">
          <FunnelPerformance data={funnelPerformanceData} />
        </div>

        <div className="flex gap-4 xl:!flex-row flex-col">
          <Card className="p-4 flex-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest activity in your subaccount
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
              No recent activity
            </CardContent>
          </Card>
          <Card className="xl:w-[400px] w-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <a href={`/subaccount/${subaccountId}/funnels`} className="p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                → Create a new funnel
              </a>
              <a href={`/subaccount/${subaccountId}/pipelines`} className="p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                → Manage pipelines
              </a>
              <a href={`/subaccount/${subaccountId}/contacts`} className="p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                → View contacts
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubAccountIdPage;


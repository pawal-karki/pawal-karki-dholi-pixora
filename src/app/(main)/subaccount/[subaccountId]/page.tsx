import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Contact2,
  FolderKanban,
  Goal,
  LayoutGrid,
  ArrowRight,
  TrendingUp,
  Activity,
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
import { Button } from "@/components/ui/button";
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

  // Get counts and metrics for dashboard
  const [funnelCount, pipelineCount, contactCount, ticketValue] = await Promise.all([
    db.funnel.count({
      where: { subAccountId: subaccountId },
    }),
    db.pipeline.count({
      where: { subAccountId: subaccountId },
    }),
    db.contact.count({
      where: { subAccountId: subaccountId },
    }),
    // Get total value from tickets in pipelines
    db.ticket.aggregate({
      where: {
        lane: {
          pipeline: {
            subAccountId: subaccountId,
          },
        },
      },
      _sum: {
        value: true,
      },
    }),
  ]);

  const funnels = await db.funnel.findMany({
    where: { subAccountId: subaccountId },
    include: { funnelPages: true },
  });

  const funnelPerformanceData = funnels
    .map((funnel) => funnel.funnelPages)
    .flat()
    .reduce((acc, page) => {
      const visits = page.visits || 0;
      const existing = acc.find((e) => e.name === page.name);
      if (existing) {
        existing.visits += visits;
      } else {
        acc.push({ name: page.name, visits: visits });
      }
      return acc;
    }, [] as { name: string; visits: number }[]);

  // Calculate revenue/goal progress
  const totalPipelineValue = ticketValue._sum.value?.toNumber() || 0;
  const goalProgress = subAccountDetails.goal > 0
    ? Math.min(100, (totalPipelineValue / subAccountDetails.goal) * 100)
    : 0;

  // Get recent activity (notifications)
  const recentActivity = await db.notification.findMany({
    where: {
      subAccountId: subaccountId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <div className="relative h-full">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <Separator className="mt-2 mb-6" />

      <div className="flex flex-col gap-6 pb-6">
        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Funnels Card */}
          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <Link href={`/subaccount/${subaccountId}/funnels`}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Total Funnels
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{funnelCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Active marketing funnels
                </p>
              </CardContent>
              <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutGrid className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </Link>
          </Card>

          {/* Pipelines Card */}
          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <Link href={`/subaccount/${subaccountId}/pipelines`}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Pipelines
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{pipelineCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Active sales pipelines
                </p>
              </CardContent>
              <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderKanban className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </Link>
          </Card>

          {/* Contacts Card */}
          <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
            <Link href={`/subaccount/${subaccountId}/contacts`}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Contact2 className="h-4 w-4" />
                  Contacts
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{contactCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Total contacts in CRM
                </p>
              </CardContent>
              <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Contact2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </Link>
          </Card>

          {/* Goal Progress Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Goal className="h-4 w-4" />
                Revenue Goal
              </CardDescription>
              <CardTitle className="text-xl font-bold">
                NPR {totalPipelineValue.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Pipeline value</span>
                <span>Goal: NPR {subAccountDetails.goal.toLocaleString()}</span>
              </div>
              <Progress value={goalProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {goalProgress >= 100
                  ? "🎉 Goal achieved!"
                  : `${Math.round(goalProgress)}% towards goal`}
              </p>
            </CardContent>
            <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </Card>
        </div>

        {/* Funnel Performance */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FunnelPerformance data={funnelPerformanceData} />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Get things done faster</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between group"
                asChild
              >
                <Link href={`/subaccount/${subaccountId}/funnels`}>
                  Create a new funnel
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between group"
                asChild
              >
                <Link href={`/subaccount/${subaccountId}/pipelines`}>
                  Manage pipelines
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between group"
                asChild
              >
                <Link href={`/subaccount/${subaccountId}/contacts`}>
                  View contacts
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between group"
                asChild
              >
                <Link href={`/subaccount/${subaccountId}/media`}>
                  Media library
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates in your subaccount</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.notification}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[150px] text-muted-foreground">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p>No recent activity</p>
                <p className="text-xs mt-1">Activity will appear here as you work</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubAccountIdPage;

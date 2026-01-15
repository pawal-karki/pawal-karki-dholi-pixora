import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getSubAccountDetails } from "@/lib/queries";
import { db } from "@/lib/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FunnelSteps from "./_components/funnel-steps";
import FunnelDetails from "@/components/forms/funnel-details";
import FunnelProducts from "@/components/forms/funnel-products";

interface FunnelPageProps {
  params: Promise<{
    subaccountId: string | undefined;
    funnelId: string | undefined;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

const FunnelPage: React.FC<FunnelPageProps> = async ({ params, searchParams }) => {
  const { subaccountId, funnelId } = await params;
  const { tab } = await searchParams;
  const defaultTab = tab === "products" ? "products" : tab === "settings" ? "settings" : "steps";

  if (!subaccountId || !funnelId) redirect("/subaccount/unauthorized");

  const subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  // Get funnel with pages
  const funnel = await db.funnel.findUnique({
    where: { id: funnelId },
    include: {
      funnelPages: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!funnel) redirect(`/subaccount/${subaccountId}/funnels`);

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Header bar matching screenshot */}
      <div className="flex items-center justify-between py-4 border-b mb-4">
        <div className="flex items-center gap-4">
          <Link href={`/subaccount/${subaccountId}/funnels`} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold">{funnel.name}</h1>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="absolute top-[20px] right-0 z-10">
          <TabsList className="grid w-[300px] grid-cols-3 bg-transparent">
            <TabsTrigger
              value="steps"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none"
            >
              Steps
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none"
            >
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="steps" className="mt-0 h-full">
          <FunnelSteps
            funnel={funnel}
            subaccountId={subaccountId}
            pages={funnel.funnelPages}
            funnelId={funnelId}
          />
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Products</CardTitle>
              <CardDescription>
                Select which products will be available for checkout in this funnel.
                Products are managed in your Stripe dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelProducts
                subAccountId={subaccountId}
                funnelId={funnelId}
                currentProducts={funnel.liveProducts || "[]"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Settings</CardTitle>
              <CardDescription>
                Configure your funnel settings here such as domain, name, and favicon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelDetails
                subAccountId={subaccountId}
                defaultData={funnel}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FunnelPage;

import React from "react";
import { redirect } from "next/navigation";

import { getSubAccountDetails } from "@/lib/queries";
import { db } from "@/lib/db";

interface PipelinesPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const PipelinesPage: React.FC<PipelinesPageProps> = async ({ params }) => {
  const { subaccountId } = await params;

  if (!subaccountId) redirect("/subaccount/unauthorized");

  const subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  // Get pipelines for this subaccount
  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
  });

  // Redirect to the first pipeline if exists
  if (pipelines.length > 0) {
    redirect(`/subaccount/${subaccountId}/pipelines/${pipelines[0].id}`);
  }

  // If no pipelines, redirect to create one or show empty state
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <h1 className="text-2xl font-bold mb-2">No Pipelines Found</h1>
      <p className="text-muted-foreground mb-4">
        Create your first pipeline to start managing leads
      </p>
    </div>
  );
};

export default PipelinesPage;


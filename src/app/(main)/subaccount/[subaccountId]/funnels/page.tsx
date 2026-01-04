import React from "react";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";

import { getSubAccountDetails } from "@/lib/queries";
import { db } from "@/lib/db";

import FunnelDetails from "@/components/forms/funnel-details";
import FunnelsDataTable from "./data-table";
import { columns } from "./columns";

interface FunnelsPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const FunnelsPage: React.FC<FunnelsPageProps> = async ({ params }) => {
  const { subaccountId } = await params;

  if (!subaccountId) redirect("/subaccount/unauthorized");

  const subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  // Get funnels for this subaccount
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subaccountId },
    include: {
      funnelPages: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Funnels</h1>
      <FunnelsDataTable
        actionButtonText={
          <>
            <PlusCircle className="w-4 h-4" />
            Create Funnel
          </>
        }
        modalChildren={<FunnelDetails subAccountId={subaccountId} />}
        filterValue="name"
        columns={columns}
        data={funnels}
      />
    </div>
  );
};

export default FunnelsPage;

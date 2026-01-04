import React from "react";
import { redirect } from "next/navigation";

import { getAuthDetails, getSubAccountDetails } from "@/lib/queries";
import { db } from "@/lib/db";

import SubAccountDetails from "@/components/forms/subaccount-details";
import UserDetailsForm from "@/components/forms/user-details";

interface SubAccountSettingsPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const SubAccountSettingsPage: React.FC<SubAccountSettingsPageProps> = async ({
  params,
}) => {
  const { subaccountId } = await params;
  const user = await getAuthDetails();

  if (!user) redirect("/agency/sign-in");
  if (!subaccountId) redirect("/subaccount/unauthorized");

  const subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  // Get agency details for the form
  const agencyDetails = await db.agency.findUnique({
    where: { id: subAccountDetails.agencyId },
  });

  if (!agencyDetails) redirect("/subaccount/unauthorized");

  return (
    <div className="flex flex-col gap-4 max-w-4xl w-full mx-auto">
      <SubAccountDetails
        agencyDetails={agencyDetails}
        details={subAccountDetails}
        userId={user.id}
        userName={user.name}
      />
      <UserDetailsForm
        type="subaccount"
        id={subaccountId}
        userData={user}
      />
    </div>
  );
};

export default SubAccountSettingsPage;


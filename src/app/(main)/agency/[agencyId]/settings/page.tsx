import React from "react";
import { redirect } from "next/navigation";

import { getAuthDetails, getAgencyDetails } from "@/lib/queries";

import AgencyDetails from "@/components/forms/agencyDetails";
import UserDetailsForm from "@/components/forms/user-details";

interface AgencySettingsPageProps {
  params: Promise<{
    agencyId: string | undefined;
  }>;
}

const AgencySettingsPage: React.FC<AgencySettingsPageProps> = async ({
  params,
}) => {
  const { agencyId } = await params;
  const user = await getAuthDetails();

  if (!user) redirect("/agency/sign-in");
  if (!agencyId) redirect("/agency/unauthorized");

  const agencyDetails = await getAgencyDetails(agencyId);

  if (!agencyDetails) redirect("/agency/unauthorized");

  const subAccounts = agencyDetails.SubAccounts;

  return (
    <div className="flex flex-col gap-4 max-w-4xl w-full mx-auto">
      <AgencyDetails data={agencyDetails} />
      <UserDetailsForm
        type="agency"
        id={agencyId}
        subAccounts={subAccounts}
        userData={user}
      />
    </div>
  );
};

export default AgencySettingsPage;


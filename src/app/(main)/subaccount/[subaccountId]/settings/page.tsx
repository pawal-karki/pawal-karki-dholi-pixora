import React from "react";
import { redirect } from "next/navigation";

import { getAuthDetails, getSubAccountDetails } from "@/lib/queries";
import { db } from "@/lib/db";

import SubAccountDetails from "@/components/forms/subaccount-details";
import UserDetailsForm from "@/components/forms/user-details";
import { AISettingsForm } from "@/components/chat/ai-settings-form";

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

  // Get existing AI settings
  const aiSettings = await db.aISettings.findUnique({
    where: { agencyId: subAccountDetails.agencyId },
    select: {
      aiProvider: true,
      model: true,
      temperature: true,
      maxTokens: true,
      enabled: true,
      systemPrompt: true,
    },
  });

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
      <AISettingsForm
        agencyId={subAccountDetails.agencyId}
        currentSettings={aiSettings}
      />
    </div>
  );
};

export default SubAccountSettingsPage;


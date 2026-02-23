import React from "react";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { getAgencyDetails, getAuthUserGroup, getAuthDetails, getInvitationsByAgencyId } from "@/lib/queries";

import TeamsDataTable from "./data-table";
import { teamTableColumns } from "./columns";
import SendInvitation from "@/components/forms/send-invitation";

interface TeamPageProps {
  params: Promise<{
    agencyId: string | undefined;
  }>;
}

const TeamPage: React.FC<TeamPageProps> = async ({ params }) => {
  const { agencyId } = await params;
  const user = await getAuthDetails();

  if (!user) redirect("/agency/sign-in");
  if (!agencyId) redirect("/agency/unauthorized");

  if (user.role !== "AGENCY_OWNER" && user.role !== "AGENCY_ADMIN") {
    redirect("/agency/unauthorized");
  }

  const teamMembers = await getAuthUserGroup(agencyId);
  if (!teamMembers) redirect("/agency/sign-in");

  const agencyDetails = await getAgencyDetails(agencyId);
  if (!agencyDetails) redirect("/agency/unauthorized");

  const invitations = await getInvitationsByAgencyId(agencyId);

  const mergedData = [
    ...teamMembers.map((user) => ({
      ...user,
      permissions: user.Permissions || [],
      status: "ACTIVE",
    })),
    ...invitations.map((invitation) => ({
      id: invitation.id,
      name: "Pending Invitation",
      email: invitation.email,
      role: invitation.role,
      agency: agencyDetails,
      avatarUrl: "",
      agencyId: agencyId,
      permissions: [],
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
      password: null,
    })),
  ] as any;

  return (
    <TeamsDataTable
      actionButtonText={
        <>
          <Plus className="w-4 h-4" />
          Add
        </>
      }
      modalChildren={<SendInvitation agencyId={agencyId} subAccounts={agencyDetails.SubAccounts} />}
      filterValue="name"
      columns={teamTableColumns}
      data={mergedData}
    />
  );
};

export default TeamPage;


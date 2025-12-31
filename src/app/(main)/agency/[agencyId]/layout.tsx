import React from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { verifyAndAccpetInvitations, getAuthDetails, getNotifications } from "@/lib/queries";

import Sidebar from "@/components/navigation/sidebar";
import BlurPage from "@/components/global/blur-page";
import InfoBar from "@/components/global/info-bar";

interface AgencyIdLayoutProps extends React.PropsWithChildren {
  params: Promise<{
    agencyId: string | undefined;
  }>;
}

const AgencyIdLayout: React.FC<AgencyIdLayoutProps> = async ({
  params,
  children,
}) => {
  const { agencyId } = await params;
  const user = await getAuthDetails();
  const verifiedAgencyId = await verifyAndAccpetInvitations();

  if (!user) redirect("/agency/sign-in");
  if (!verifiedAgencyId || !agencyId) redirect("/agency");

  if (user.role !== Role.AGENCY_OWNER && user.role !== Role.AGENCY_ADMIN) {
    redirect("/agency/unauthorized");
  }

  const notifications = await getNotifications(verifiedAgencyId);

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={agencyId} type="agency" />
      <div className="md:pl-[280px]">
        <InfoBar
          notifications={notifications}
          subAccountId={user.id}
          role={user.role}
          user={{
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          }}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default AgencyIdLayout;


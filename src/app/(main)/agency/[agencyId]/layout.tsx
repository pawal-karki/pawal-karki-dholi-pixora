import React from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { getAuthDetails, getNotifications } from "@/lib/queries";

import Sidebar from "@/components/navigation/sidebar";
import BlurPage from "@/components/global/blur-page";
import InfoBar from "@/components/global/info-bar";
import { FloatingChat } from "@/components/chat/floating-chat";

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

  if (!agencyId) redirect("/agency");

  // Only check auth - invitation verification already done on /agency page
  const user = await getAuthDetails();

  if (!user) redirect("/agency/sign-in");
  if (!user.agencyId) redirect("/agency");

  if (user.role !== Role.AGENCY_OWNER && user.role !== Role.AGENCY_ADMIN) {
    redirect("/agency/unauthorized");
  }

  const notifications = await getNotifications(user.agencyId);

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={agencyId} type="agency" />
      <div className="md:pl-[280px]">
        <InfoBar
          notifications={notifications}
          subAccountId={user.id}
          role={user.role}
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          }}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
      <FloatingChat agencyId={agencyId} />
    </div>
  );
};

export default AgencyIdLayout;


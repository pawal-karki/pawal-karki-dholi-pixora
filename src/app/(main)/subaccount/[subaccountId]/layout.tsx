import React from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { getAuthDetails, getNotifications, getSubAccountDetails } from "@/lib/queries";

import Sidebar from "@/components/navigation/sidebar";
import BlurPage from "@/components/global/blur-page";
import InfoBar from "@/components/global/info-bar";
import { FloatingChat } from "@/components/chat/floating-chat";

interface SubAccountIdLayoutProps extends React.PropsWithChildren {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const SubAccountIdLayout: React.FC<SubAccountIdLayoutProps> = async ({
  params,
  children,
}) => {
  const { subaccountId } = await params;

  if (!subaccountId) redirect("/subaccount/unauthorized");

  const user = await getAuthDetails();

  if (!user) redirect("/agency/sign-in");

  if (user.role === Role.SUBACCOUNT_GUEST) {
    redirect("/subaccount/unauthorized");
  }

  // Check if user has access to this subaccount
  const hasAccess = user.Permissions?.find(
    (permission) =>
      permission.access && permission.subAccountId === subaccountId
  );

  if (!hasAccess) redirect("/subaccount/unauthorized");

  const subAccountDetails = await getSubAccountDetails(subaccountId);
  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  const notifications = await getNotifications(subAccountDetails.agencyId);

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={subaccountId} type="subaccount" />
      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          subAccountId={subaccountId}
          role={user.role as Role}
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
      <FloatingChat agencyId={subAccountDetails.agencyId} subAccountId={subaccountId} />
    </div>
  );
};

export default SubAccountIdLayout;


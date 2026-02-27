import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { getAuthDetails, getSubAccountDetails } from "@/lib/queries";
import { ChatContainer } from "@/components/chat/chat-container";

interface Props {
  params: Promise<{ subaccountId: string }>;
}

export default async function SubAccountChatPage({ params }: Props) {
  const { subaccountId } = await params;

  const user = await getAuthDetails();
  if (!user) redirect("/agency/sign-in");

  if (user.role === Role.SUBACCOUNT_GUEST) {
    redirect("/subaccount/unauthorized");
  }

  const hasAccess = user.Permissions?.find(
    (p) => p.access && p.subAccountId === subaccountId
  );
  if (!hasAccess) redirect("/subaccount/unauthorized");

  const subAccount = await getSubAccountDetails(subaccountId);
  if (!subAccount) redirect("/subaccount/unauthorized");

  return (
    <div className="h-[calc(100vh-90px)]">
      <ChatContainer
        agencyId={subAccount.agencyId}
        subAccountId={subaccountId}
        currentUserId={user.id}
        currentUserName={user.name}
      />
    </div>
  );
}

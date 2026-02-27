import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { getAuthDetails } from "@/lib/queries";
import { ChatContainer } from "@/components/chat/chat-container";

interface Props {
  params: Promise<{ agencyId: string }>;
}

export default async function AgencyChatPage({ params }: Props) {
  const { agencyId } = await params;

  const user = await getAuthDetails();
  if (!user) redirect("/agency/sign-in");
  if (user.role !== Role.AGENCY_OWNER && user.role !== Role.AGENCY_ADMIN) {
    redirect("/agency/unauthorized");
  }

  return (
    <div className="h-[calc(100vh-90px)]">
      <ChatContainer
        agencyId={agencyId}
        currentUserId={user.id}
        currentUserName={user.name}
        showAISettings
      />
    </div>
  );
}

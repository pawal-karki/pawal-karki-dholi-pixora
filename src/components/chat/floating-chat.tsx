import { getAuthDetails } from "@/lib/queries";
import { FloatingChatWidget } from "@/components/chat/floating-chat-widget";

interface Props {
  agencyId: string;
  subAccountId?: string;
}

export async function FloatingChat({ agencyId, subAccountId }: Props) {
  const user = await getAuthDetails();
  if (!user) return null;

  return (
    <FloatingChatWidget
      agencyId={agencyId}
      subAccountId={subAccountId}
      currentUserId={user.id}
      currentUserName={user.name}
    />
  );
}

import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { getAuthDetails } from "@/lib/queries";
import { getAISettings } from "@/queries/chat";
import { AISettingsForm } from "@/components/chat/ai-settings-form";

interface Props {
  params: Promise<{ agencyId: string }>;
}

export default async function AISettingsPage({ params }: Props) {
  const { agencyId } = await params;

  const user = await getAuthDetails();
  if (!user) redirect("/agency/sign-in");

  if (user.role !== Role.AGENCY_OWNER && user.role !== Role.AGENCY_ADMIN) {
    redirect("/agency/unauthorized");
  }

  const aiSettings = await getAISettings(agencyId);

  return (
    <div className="mx-auto w-full max-w-6xl py-6 px-4">
      <AISettingsForm agencyId={agencyId} currentSettings={aiSettings} />
    </div>
  );
}

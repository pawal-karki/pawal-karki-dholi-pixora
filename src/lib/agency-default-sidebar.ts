import type { Icon } from "@prisma/client";

type SidebarRow = { name: string; icon: Icon; link: string };

/** Default agency sidebar rows (same as upsertAgency create). */
export function getDefaultAgencySidebarOptions(agencyId: string): SidebarRow[] {
  return [
    { name: "Dashboard", icon: "category", link: `/agency/${agencyId}` },
    { name: "Launchpad", icon: "clipboardIcon", link: `/agency/${agencyId}/launchpad` },
    { name: "Billing", icon: "payment", link: `/agency/${agencyId}/billing` },
    { name: "Contact Messages", icon: "messages", link: `/agency/${agencyId}/contact-messages` },
    { name: "Settings", icon: "settings", link: `/agency/${agencyId}/settings` },
    { name: "Sub Accounts", icon: "person", link: `/agency/${agencyId}/all-subaccounts` },
    { name: "Team", icon: "shield", link: `/agency/${agencyId}/team` },
    { name: "Chat", icon: "messages", link: `/agency/${agencyId}/chat` },
    { name: "AI Settings", icon: "chip", link: `/agency/${agencyId}/ai-settings` },
  ];
}

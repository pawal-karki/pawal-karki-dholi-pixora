import React from "react";
import {
  type AgencySidebarOption,
  type SubAccountSidebarOption,
} from "@prisma/client";

import { getAuthDetails } from "@/lib/queries";

import MenuOptions from "./menu-options";

interface SidebarProps {
  id: string;
  type: "agency" | "subaccount";
}

const Sidebar: React.FC<SidebarProps> = async ({ id, type }) => {
  const user = await getAuthDetails();

  if (!user || !user.agency) return null;

  // Memoize subaccount lookup
  const subAccount = user.agency.SubAccounts.find(
    (subAccount) => subAccount.id === id
  );

  const details = type === "agency" ? user.agency : subAccount;

  if (!details) return null;

  const isWhiteLabelAgency = user.agency.whiteLabel;

  // Optimize logo selection
  let sideBarLogo: string = user.agency.agencyLogo || "/assets/pixora-logo.svg";

  if (
    !isWhiteLabelAgency &&
    type === "subaccount" &&
    subAccount?.subAccountLogo
  ) {
    sideBarLogo = subAccount.subAccountLogo;
  }

  // Optimize sidebar options selection
  let sidebarOptions: AgencySidebarOption[] | SubAccountSidebarOption[] = [];

  if (type === "agency") {
    sidebarOptions = user.agency.SidebarOptions || [];

    // Check if Testimonials exists, if not, add it virtually
    const hasTestimonials = sidebarOptions.some(opt => opt.name === "Testimonials");
    if (!hasTestimonials) {
      sidebarOptions = [
        ...sidebarOptions,
        {
          id: "virtual-testimonial",
          name: "Testimonials",
          link: `/agency/${user.agency.id}/testimonials`,
          icon: "star",
          agencyId: user.agency.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as AgencySidebarOption
      ];
    }
  } else {
    sidebarOptions = subAccount?.sidebarOptions || [];
  }

  // Optimize subaccounts filtering - create a Set for O(1) lookup
  const permissionSet = new Set(
    (user.Permissions || [])
      .filter((permission) => permission?.access === true)
      .map((permission) => permission?.subAccountId)
      .filter((id): id is string => Boolean(id))
  );

  const subAccounts = (user.agency.SubAccounts || []).filter((subAccount) =>
    permissionSet.has(subAccount.id)
  );

  return (
    <MenuOptions
      details={details}
      id={id}
      sideBarLogo={sideBarLogo}
      sideBarOptions={sidebarOptions || []}
      subAccount={subAccounts || []}
      user={user}
    />
  );
};

export default Sidebar;

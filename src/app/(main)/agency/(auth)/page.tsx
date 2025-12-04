import React from "react";
import { getAuthDetails, verifyAndAccpetInvitations } from "@/lib/queries";

const Page = async () => {
  // Verify invitations and get agency ID (works for both Clerk and JWT auth)
  const agencyId = await verifyAndAccpetInvitations();
  console.log("Agency ID:", agencyId);

  // Get full user details
  const user = await getAuthDetails();
  console.log("User:", user);

  return <div>Agency Dashboard</div>;
};

export default Page;

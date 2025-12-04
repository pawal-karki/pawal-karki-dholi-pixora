import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getAuthDetails } from "@/lib/queries";

const Page = async () => {
  const authUser = await currentUser();
  if (!authUser) return redirect("/agency/sign-in");

  const agencyId = await verifyAndAccpetInvitations();

  const  user  = await getAuthDetails();

  return <div>Agency Dashboard</div>;
};
export default Page;

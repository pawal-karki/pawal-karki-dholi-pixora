import React from "react";
import { redirect } from "next/navigation";

import { getAuthDetails } from "@/lib/queries";

const SubAccountMainPage = async () => {
  const user = await getAuthDetails();

  if (!user) redirect("/agency/sign-in");

  // Find the first subaccount the user has access to
  const getFirstSubAccountWithAccess = user.Permissions?.find(
    (permission) => permission.access === true
  );

  if (getFirstSubAccountWithAccess) {
    redirect(`/subaccount/${getFirstSubAccountWithAccess.subAccountId}`);
  }

  // If no subaccount access, redirect to agency unauthorized
  redirect("/subaccount/unauthorized");
};

export default SubAccountMainPage;


import React from "react";
import { redirect } from "next/navigation";
import {
  getAuthDetails,
  verifyAndAccpetInvitations,
  getCurrentUserEmail,
} from "@/lib/queries";
import { User } from "@prisma/client";
import AgencyDetails from "@/components/forms/agencyDetails";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

const Page = async ({ searchParams }: PageProps) => {

  const params = await searchParams;

  // Verify and accept invitations first, as this might create the user
  const agencyId = await verifyAndAccpetInvitations();

  // Then get auth details after the user might have been created
  const user = await getAuthDetails();

  console.log("Agency ID:", agencyId);

  if (agencyId) {
    if (user?.role === "SUBACCOUNT_USER" || user?.role === "SUBACCOUNT_GUEST") {
      return redirect("/subaccount");
    } else if (["AGENCY_OWNER", "AGENCY_ADMIN"].includes(user?.role ?? "")) {
      if (params?.plans) {
        return redirect(
          `/agency/${agencyId}/billing?plan=${params.plans}`
        );
      }

      // Handle Stripe OAuth redirect from Stripe Connect
      // The state parameter is passed by Stripe when redirecting back
      // Format: statePath___id (e.g., "launchpad___agency123" or "subaccount___subaccount123")
      if (params?.state) {
        const [statePath, stateId] = params.state.split("___");
        if (!stateId) return <div>Not Authorized</div>;

        // If we have a code from Stripe, redirect to launchpad with the code
        if (params.code && statePath === "launchpad") {
          return redirect(
            `/agency/${stateId}/launchpad?code=${params.code}`
          );
        }

        // Handle subaccount Stripe Connect redirect
        if (params.code && statePath === "subaccount") {
          return redirect(
            `/subaccount/${stateId}/launchpad?code=${params.code}`
          );
        }

        // Otherwise redirect to the state path
        return redirect(`/agency/${stateId}/${statePath}`);
      }

      return redirect(`/agency/${agencyId}`);
    } else {
      return <div>Not Authorized</div>;
    }
  }

  // No agency found - show agency creation form
  const userEmail = await getCurrentUserEmail();

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[800px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl font-bold">Welcome to Pixora</h1>
        <p className="text-gray-500">
          Create your Agency Account to get started
        </p>
        <AgencyDetails data={{ companyEmail: userEmail ?? undefined }} />
      </div>
    </div>
  );
};
export default Page;

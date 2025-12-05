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
  searchParams: { [key: string]: string | undefined };
};

const Page = async ({ searchParams }: PageProps) => {
  // Verify invitations and get agency ID (works for both Clerk and JWT auth)
  const agencyId = await verifyAndAccpetInvitations();
  console.log("Agency ID:", agencyId);

  // Get full user details (already returns the user object without password)
  const user = await getAuthDetails();

  if (agencyId) {
    if (user?.role === "SUBACCOUNT_USER" || user?.role === "SUBACCOUNT_GUEST") {
      return redirect("/agency");
    } else if (["AGENCY_OWNER", "AGENCY_ADMIN"].includes(user?.role ?? "")) {
      if (searchParams?.plans) {
        return redirect(
          `/agency/${agencyId}/billing?plan=${searchParams.plans}`
        );
      }

      // Handle Stripe billing redirect from Stripe
      // The state parameter is passed by Stripe when redirecting back from billing
      // Format: statePath___agencyId (e.g., "billing___agency123")
      if (searchParams?.state) {
        const [statePath, stateAgencyId] = searchParams.state.split("___");
        if (!stateAgencyId) return <div>Not Authorized</div>;
        return redirect(
          `/agency/${stateAgencyId}?state=${statePath}?code=${
            searchParams.code ?? ""
          }`
        );
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

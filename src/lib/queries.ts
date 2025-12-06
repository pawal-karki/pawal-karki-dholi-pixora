"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Agency, Role, User } from "@prisma/client";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { v4 } from "uuid";

/**
 * Gets the current user's email from either Clerk or JWT auth.
 * Supports both authentication methods.
 *
 * @returns The user's email or null if not authenticated
 */
export const getCurrentUserEmail = async (): Promise<string | null> => {
  // First try Clerk auth
  const clerkUser = await currentUser();
  if (clerkUser) {
    return clerkUser.emailAddresses[0].emailAddress;
  }

  // Fall back to JWT auth
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded && typeof decoded === "object" && "email" in decoded) {
      return decoded.email as string;
    }
  }

  return null;
};

/**
 * Checks if user is authenticated via Clerk (OAuth).
 */
export const isClerkAuth = async (): Promise<boolean> => {
  const clerkUser = await currentUser();
  return !!clerkUser;
};

/**
 * Fetches the authenticated user's details from the database.
 *
 * Works with both Clerk and JWT authentication.
 * Looks up the user by email, then finds their full profile
 * including their agency, subaccounts, sidebar options, and permissions.
 *
 * @returns The user object with all relations, or null if not authenticated
 */
export const getAuthDetails = async () => {
  const email = await getCurrentUserEmail();
  if (!email) return null;

  const userData = await db.user.findUnique({
    where: {
      email: email,
    },
    include: {
      agency: {
        include: {
          SidebarOptions: true,
          SubAccounts: {
            include: {
              sidebarOptions: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });

  // Never leak password hash to the rest of the app
  if (!userData) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = userData as typeof userData & {
    password?: string | null;
  };

  return safeUser;
};

/**
 * Creates a new team member for an agency.
 *
 * Used when inviting users to join an agency. Agency owners cannot be
 * created through this function (they're created during agency setup).
 *
 * @param agencyId - The agency to add the user to
 * @param user - The user data to create
 * @returns The created user, or null if user is an agency owner
 */
export const createTeamUser = async (agencyId: string, user: User) => {
  // Agency owners are created separately during agency onboarding
  if (user.role === "AGENCY_OWNER") return null;

  const response = await db.user.create({
    data: { ...user },
  });
  return response;
};

/**
 * Logs an activity notification for the agency dashboard.
 *
 * Creates a notification entry that shows up in the agency's activity feed.
 * Can be scoped to a specific subaccount or the entire agency.
 *
 * If no user is logged in, it tries to find a user associated with the
 * subaccount to attribute the action to (useful for automated actions).
 *
 * @param agencyId - Optional agency ID (will be derived from subaccount if not provided)
 * @param description - What happened (e.g., "created a new funnel")
 * @param subaccountId - Optional subaccount to scope the notification to
 * @throws Error if neither agencyId nor subaccountId is provided
 */
export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}) => {
  const userEmail = await getCurrentUserEmail();
  let userData;

  // If no authenticated user, find a user linked to the subaccount
  // This handles automated/system actions
  if (!userEmail) {
    const response = await db.user.findFirst({
      where: {
        agency: {
          SubAccounts: {
            some: { id: subaccountId },
          },
        },
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: userEmail },
    });
  }

  if (!userData) {
    console.log("Could not find a user");
    return;
  }

  // Resolve agency ID from subaccount if not directly provided
  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      throw new Error(
        "You need to provide atleast an agency Id or subaccount Id"
      );
    }
    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });
    if (response) foundAgencyId = response.agencyId;
  }

  // Create notification - linked to subaccount if provided, otherwise agency-level
  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        user: {
          connect: {
            id: userData.id,
          },
        },
        agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        subAccount: {
          connect: { id: subaccountId },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        user: {
          connect: {
            id: userData.id,
          },
        },
        agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

/**
 * Checks for pending invitations and accepts them for the current user.
 *
 * Called after a user signs up or logs in. If they have a pending
 * invitation to join an agency, this creates their user record with
 * the invited role and links them to the agency.
 *
 * Works with both Clerk (OAuth) and JWT authentication.
 * - Clerk users: Full invitation flow with metadata updates
 * - JWT users: Returns their existing agency ID (invitations handled at signup)
 *
 * @returns The agency ID if user belongs to one, null otherwise, or redirects to sign-in
 */
export const verifyAndAccpetInvitations = async () => {
  const userEmail = await getCurrentUserEmail();
  const clerkUser = await currentUser();

  // If no auth at all, redirect to sign-in
  if (!userEmail) {
    return redirect("/agency/sign-in");
  }

  // For JWT users, just return their agency ID (invitations handled at signup)
  if (!clerkUser) {
    const existingUser = await db.user.findUnique({
      where: { email: userEmail },
      include: { agency: true },
    });
    return existingUser?.agencyId || null;
  }

  // For Clerk users, handle the invitation flow
  // Check if user has a pending invitation
  const invitationsExist = await db.invitation.findUnique({
    where: {
      email: clerkUser.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  // If invitation exists, create the user with the invited role
  if (invitationsExist) {
    const userDetails = await createTeamUser(invitationsExist.agencyId, {
      email: invitationsExist.email,
      agencyId: invitationsExist.agencyId,
      avatarUrl: clerkUser.imageUrl,
      id: clerkUser.id,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      role: invitationsExist.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: null,
    });

    await saveActivityLogsNotification({
      agencyId: invitationsExist?.agencyId,
      description: `${clerkUser.firstName} ${clerkUser.lastName} has joined the agency`,
      subaccountId: undefined,
    });

    if (userDetails) {
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(userDetails.id, {
          publicMetadata: {
            role: userDetails.role || "SUBACCOUNT_USER",
          },
        });
      } catch (error) {
        console.log("Could not update Clerk metadata:", error);
      }

      await db.invitation.delete({
        where: {
          email: userDetails.email,
        },
      });
      return userDetails?.agencyId;
    } else {
      return null;
    }
  } else {
    // No invitation - check if user already has an agency

    const existingUser = await db.user.findUnique({
      where: { email: clerkUser.emailAddresses[0].emailAddress },
    });
    return existingUser?.agencyId || null;
  }
};

export const updateAgencyDetails = async (
  agencyId: string,
  details: Partial<Agency>
) => {
  if (!agencyId) return null;
  const agency = await db.agency.update({
    where: { id: agencyId },
    data: {
      ...details,
      updatedAt: new Date(),
    },
  });
  return agency; // return the updated agency as a response
};

/**
 * Initializes or updates the current user in the database.
 * Works with both Clerk and JWT auth.
 */
export const initUser = async (newUser?: Partial<User>) => {
  const clerkUser = await currentUser();
  const userEmail = await getCurrentUserEmail();

  if (!userEmail) return null;

  if (clerkUser) {
    const userData = await db.user.upsert({
      where: { email: clerkUser.emailAddresses[0].emailAddress },
      update: {
        ...newUser,
        avatarUrl: clerkUser.imageUrl,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "User",
      },
      create: {
        id: clerkUser.id,
        avatarUrl: clerkUser.imageUrl,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "User",
        email: clerkUser.emailAddresses[0].emailAddress,
        role: (newUser?.role as Role) || "SUBACCOUNT_USER",
      },
    });

    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkUser.id, {
        privateMetadata: {
          role: newUser?.role || "SUBACCOUNT_USER",
        },
      });
    } catch (error) {
      console.log("Could not update Clerk metadata:", error);
    }

    return userData;
  }

  const existingUser = await db.user.findUnique({
    where: { email: userEmail },
  });

  if (existingUser) {
    const userData = await db.user.update({
      where: { email: userEmail },
      data: {
        ...newUser,
        updatedAt: new Date(),
      },
    });
    return userData;
  }

  return null;
};

// Input type for creating/updating agency (more flexible than Prisma's Agency type)
type UpsertAgencyInput = {
  id: string;
  name: string;
  agencyLogo: string;
  companyEmail: string;
  companyPhone: string;
  whiteLabel: boolean;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  connectAccountId: string;
  customerId: string;
  goal: number;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Creates or updates an agency with default sidebar options.
 * Links the current user to the agency.
 */
export const upsertAgency = async (agency: UpsertAgencyInput) => {
  if (!agency.companyEmail) return null;

  const userEmail = await getCurrentUserEmail();
  if (!userEmail) return null;

  try {
    const agencyDetails = await db.agency.upsert({
      where: { id: agency.id },
      update: {
        name: agency.name,
        agencyLogo: agency.agencyLogo,
        companyEmail: agency.companyEmail,
        companyPhone: agency.companyPhone,
        whiteLabel: agency.whiteLabel,
        address: agency.address,
        city: agency.city,
        state: agency.state,
        zipCode: agency.zipCode,
        country: agency.country,
        goal: agency.goal,
        connectAccountId: agency.connectAccountId,
        customerId: agency.customerId,
        updatedAt: new Date(),
      },
      create: {
        id: agency.id,
        name: agency.name,
        agencyLogo: agency.agencyLogo,
        companyEmail: agency.companyEmail,
        companyPhone: agency.companyPhone,
        whiteLabel: agency.whiteLabel,
        address: agency.address,
        city: agency.city,
        state: agency.state,
        zipCode: agency.zipCode,
        country: agency.country,
        goal: agency.goal,
        connectAccountId: agency.connectAccountId,
        customerId: agency.customerId,
        users: {
          connect: { email: userEmail },
        },
        SidebarOptions: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    });

    return agencyDetails;
  } catch (error) {
    console.log("Error upserting agency:", error);
    return null;
  }
};

/**
 * Deletes an agency and all related data.
 *
 * This is a destructive operation that removes:
 * - The agency itself
 * - All subaccounts under the agency
 * - All users associated with the agency
 * - All related data (funnels, contacts, etc.)
 *
 * @param agencyId - The ID of the agency to delete
 * @returns The deleted agency object
 */
export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({
    where: { id: agencyId },
  });
  return response;
};

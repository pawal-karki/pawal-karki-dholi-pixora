"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Agency, Role, User } from "@prisma/client";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { v4 } from "uuid";
import { type FunnelDetailsSchema } from "@/lib/validators/funnel-details";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CreateMediaType } from "@/lib/types";
import { canCreateSubAccount } from "@/lib/plan-limits";

/**
 * Gets the current user's email from either Clerk or JWT auth.
 * Supports both authentication methods.
 * Handles rate limiting gracefully by falling back to JWT auth.
 *
 * @returns The user's email or null if not authenticated
 */
export const getCurrentUserEmail = async (): Promise<string | null> => {
  try {
    // First try Clerk auth
    const clerkUser = await currentUser();
    if (clerkUser) {
      return clerkUser.emailAddresses[0].emailAddress;
    }
  } catch (error: any) {
    // Handle rate limiting (429) or other Clerk errors
    // Fall back to JWT auth instead of throwing
    if (error?.status === 429 || error?.clerkError) {
      console.warn(
        "Clerk rate limit hit, falling back to JWT auth:",
        error.status
      );
      // Continue to JWT auth fallback below
    } else {
      // For other errors, log but still try JWT fallback
      console.warn(
        "Clerk auth error, falling back to JWT auth:",
        error?.message
      );
    }
  }

  // Fall back to JWT auth
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && typeof decoded === "object" && "email" in decoded) {
        return decoded.email as string;
      }
    }
  } catch (error) {
    console.warn("JWT auth fallback failed:", error);
  }

  return null;
};

/**
 * Checks if user is authenticated via Clerk (OAuth).
 * Handles rate limiting gracefully.
 */
export const isClerkAuth = async (): Promise<boolean> => {
  try {
    const clerkUser = await currentUser();
    return !!clerkUser;
  } catch (error: any) {
    // If rate limited or other Clerk error, return false
    // The app will fall back to JWT auth
    if (error?.status === 429 || error?.clerkError) {
      console.warn("Clerk rate limit hit in isClerkAuth");
      return false;
    }
    throw error; // Re-throw unexpected errors
  }
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

  // Try to get Clerk user, but handle rate limiting gracefully
  let clerkUser = null;
  try {
    clerkUser = await currentUser();
  } catch (error: any) {
    // If rate limited, continue with JWT auth only
    if (error?.status === 429 || error?.clerkError) {
      console.warn(
        "Clerk rate limit hit in verifyAndAccpetInvitations, using JWT auth only"
      );
    } else {
      throw error; // Re-throw unexpected errors
    }
  }

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
  const clerkEmail = clerkUser.emailAddresses[0].emailAddress;
  console.log("LOG: Checking invitation for Clerk email:", clerkEmail);

  const invitationsExist = await db.invitation.findUnique({
    where: {
      email: clerkEmail,
      status: "PENDING",
    },
  });

  console.log("LOG: Invitation found in DB:", invitationsExist);

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
    console.log("LOG: Created Team User:", userDetails);

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
      } catch (error: any) {
        // Handle rate limiting or other Clerk errors gracefully
        if (error?.status === 429 || error?.clerkError) {
          console.warn(
            "Clerk rate limit hit when updating metadata:",
            error.status
          );
        } else {
          console.log("Could not update Clerk metadata:", error);
        }
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
  const userEmail = await getCurrentUserEmail();

  // Try to get Clerk user, but handle rate limiting gracefully
  let clerkUser = null;
  try {
    clerkUser = await currentUser();
  } catch (error: any) {
    // If rate limited, continue with JWT auth only
    if (error?.status === 429 || error?.clerkError) {
      console.warn("Clerk rate limit hit in initUser, using JWT auth only");
    } else {
      throw error; // Re-throw unexpected errors
    }
  }

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
    } catch (error: any) {
      // Handle rate limiting or other Clerk errors gracefully
      if (error?.status === 429 || error?.clerkError) {
        console.warn(
          "Clerk rate limit hit when updating metadata:",
          error.status
        );
      } else {
        console.log("Could not update Clerk metadata:", error);
      }
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

/**
 * Gets agency details by ID including subaccounts
 */
export const getAgencyDetails = async (agencyId: string) => {
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    include: {
      SubAccounts: true,
      Subscriptions: true,
    },
  });
  return agency;
};

/**
 * Gets notifications for an agency
 */
export const getNotifications = async (agencyId: string) => {
  const notifications = await db.notification.findMany({
    where: { agencyId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          agencyId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return notifications;
};

/**
 * Gets subaccounts for an agency
 */
export const getSubAccountsByAgency = async (agencyId: string) => {
  const subAccounts = await db.subAccount.findMany({
    where: { agencyId },
  });
  return subAccounts;
};

/**
 * Gets subaccount details by ID
 */
export const getSubAccountDetails = async (subAccountId: string) => {
  const subAccount = await db.subAccount.findUnique({
    where: { id: subAccountId },
  });
  return subAccount;
};

// Input type for creating/updating subaccount
type UpsertSubAccountInput = {
  id: string;
  name: string;
  subAccountLogo: string;
  companyEmail: string;
  companyPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  agencyId: string;
  connectAccountId: string;
  goal: number;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Creates or updates a subaccount with default sidebar options.
 */
export const upsertSubAccount = async (subAccount: UpsertSubAccountInput) => {
  if (!subAccount.companyEmail) {
    console.log("upsertSubAccount: No company email provided");
    return null;
  }

  const userEmail = await getCurrentUserEmail();
  if (!userEmail) {
    console.log("upsertSubAccount: No user email - not authenticated");
    return null;
  }

  // Check if this is a new subaccount (not an update)
  const existingSubAccount = await db.subAccount.findUnique({
    where: { id: subAccount.id },
  });

  // If creating new subaccount, check plan limits
  if (!existingSubAccount) {
    const planCheck = await canCreateSubAccount(subAccount.agencyId);
    if (!planCheck.allowed) {
      console.log("upsertSubAccount: Plan limit reached -", planCheck.message);
      throw new Error(`PLAN_LIMIT: ${planCheck.message}`);
    }
  }

  // Get the agency owner to link permission
  const agencyOwner = await db.user.findFirst({
    where: {
      agency: { id: subAccount.agencyId },
      role: "AGENCY_OWNER",
    },
  });

  if (!agencyOwner) {
    console.log(
      "upsertSubAccount: No agency owner found for agency:",
      subAccount.agencyId
    );
    return null;
  }

  try {
    const permissionId = v4();
    const subAccountDetails = await db.subAccount.upsert({
      where: { id: subAccount.id },
      update: {
        name: subAccount.name,
        subAccountLogo: subAccount.subAccountLogo,
        companyEmail: subAccount.companyEmail,
        companyPhone: subAccount.companyPhone,
        address: subAccount.address,
        city: subAccount.city,
        state: subAccount.state,
        zipCode: subAccount.zipCode,
        country: subAccount.country,
        goal: subAccount.goal,
        connectAccountId: subAccount.connectAccountId,
        updatedAt: new Date(),
      },
      create: {
        id: subAccount.id,
        name: subAccount.name,
        subAccountLogo: subAccount.subAccountLogo,
        companyEmail: subAccount.companyEmail,
        companyPhone: subAccount.companyPhone,
        address: subAccount.address,
        city: subAccount.city,
        state: subAccount.state,
        zipCode: subAccount.zipCode,
        country: subAccount.country,
        goal: subAccount.goal,
        connectAccountId: subAccount.connectAccountId,
        agencyId: subAccount.agencyId,
        permissions: {
          create: {
            id: permissionId,
            access: true,
            email: agencyOwner.email,
          },
        },
        pipelines: {
          create: [{ name: "Lead Cycle" }],
        },
        sidebarOptions: {
          create: [
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/subaccount/${subAccount.id}/launchpad`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/subaccount/${subAccount.id}/settings`,
            },
            {
              name: "Funnels",
              icon: "pipelines",
              link: `/subaccount/${subAccount.id}/funnels`,
            },
            {
              name: "Media",
              icon: "database",
              link: `/subaccount/${subAccount.id}/media`,
            },
            {
              name: "Pipelines",
              icon: "flag",
              link: `/subaccount/${subAccount.id}/pipelines`,
            },
            {
              name: "Contacts",
              icon: "person",
              link: `/subaccount/${subAccount.id}/contacts`,
            },
            {
              name: "Dashboard",
              icon: "category",
              link: `/subaccount/${subAccount.id}`,
            },
          ],
        },
      },
    });

    return subAccountDetails;
  } catch (error) {
    console.log("Error upserting subaccount:", error);
    return null;
  }
};

/**
 * Deletes a subaccount
 */
export const deleteSubAccount = async (subAccountId: string) => {
  const response = await db.subAccount.delete({
    where: { id: subAccountId },
  });
  return response;
};

/**
 * Updates agency connected account ID (for Stripe)
 */
export const updateAgencyConnectedId = async (
  agencyId: string,
  connectAccountId: string
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { connectAccountId },
  });
  return response;
};

/**
 * Gets all team members for an agency
 */
export const getAuthUserGroup = async (agencyId: string) => {
  const teamMembers = await db.user.findMany({
    where: {
      agency: { id: agencyId },
    },
    include: {
      agency: {
        include: {
          SubAccounts: true,
        },
      },
      Permissions: {
        include: {
          subAccount: true,
        },
      },
    },
  });
  return teamMembers;
};

/**
 * Gets a single user by email
 */
export const getAuthUser = async (email: string) => {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      agency: {
        include: {
          SubAccounts: true,
        },
      },
      Permissions: {
        include: {
          subAccount: true,
        },
      },
    },
  });
  return user;
};

/**
 * Deletes a user
 */
export const deleteUser = async (userId: string) => {
  // First delete all permissions for this user
  await db.permissions.deleteMany({
    where: {
      email: (await db.user.findUnique({ where: { id: userId } }))?.email,
    },
  });

  const response = await db.user.delete({
    where: { id: userId },
  });
  return response;
};

export const deleteInvitation = async (invitationId: string) => {
  try {
    const response = await db.invitation.delete({
      where: { id: invitationId },
    });
    return response;
  } catch (error) {
    return null;
  }
};

/**
 * Sends an invitation to join an agency
 */
export const sendInvitation = async (
  agencyId: string,
  email: string,
  role: Role
) => {
  const invitation = await db.invitation.create({
    data: {
      email,
      agencyId,
      role,
    },
  });
  return invitation;
};

/**
 * Updates user details including permissions
 */
export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  });
  return response;
};

/**
 * Changes user permissions for a subaccount
 */
export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId,
      },
    });
    return response;
  } catch (error) {
    console.log("Could not change permission:", error);
    return null;
  }
};

export const getFunnels = async (subAccountId: string) => {
  const response = await db.funnel.findMany({
    where: {
      subAccountId,
    },
    include: {
      funnelPages: true,
    },
  });

  return response;
};

export const getFunnel = async (funnelId: string) => {
  const response = await db.funnel.findUnique({
    where: {
      id: funnelId,
    },
    include: {
      funnelPages: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return response;
};

export const upsertFunnel = async (
  subAccountId: string,
  funnel: FunnelDetailsSchema & { liveProducts: string },
  funnelId: string
) => {
  console.log("upsertFunnel called with:", { subAccountId, funnel, funnelId });
  const response = await db.funnel.upsert({
    where: {
      id: funnelId,
    },
    update: funnel,
    create: {
      ...funnel,
      id: funnelId || v4(),
      subAccountId,
    },
  });

  return response;
};

export const createCheckoutPage = async (
  subAccountId: string,
  funnelId: string,
  productName: string,
  content: string
) => {
  const response = await db.funnelPage.create({
    data: {
      name: `Checkout - ${productName}`,
      pathName: `checkout-${productName.toLowerCase().replace(/\s+/g, "-")}-${v4().slice(0, 4)}`,
      funnelId,
      order: 99, // default to end
      content,
    },
  });
  return response;
};

export const updateFunnelProducts = async (
  products: string,
  funnelId: string
) => {
  const response = await db.funnel.update({
    where: {
      id: funnelId,
    },
    data: {
      liveProducts: products,
    },
  });

  return response;
};

export const upsertFunnelPage = async (
  subAccountId: string,
  funnelId: string,
  funnelPage: Prisma.FunnelPageCreateWithoutFunnelInput
) => {
  if (!subAccountId || !funnelId) return undefined;
  console.log("upsertFunnelPage called with:", {
    subAccountId,
    funnelId,
    funnelPage,
  });

  const response = await db.funnelPage.upsert({
    where: {
      id: funnelPage.id || "",
    },
    update: funnelPage,
    create: {
      ...funnelPage,
      funnelId,
      content: funnelPage.content
        ? funnelPage.content
        : JSON.stringify([
          {
            content: [],
            id: "__body",
            name: "Body",
            styles: { backgroundColor: "white" },
            type: "__body",
          },
        ]),
    },
  });

  // reset page cache
  revalidatePath(`/subaccount/${subAccountId}/funnels/${funnelId}`);

  return response;
};

export const deleteFunnelPage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({
    where: {
      id: funnelPageId,
    },
  });

  return response;
};

export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findFirst({
    where: {
      id: funnelPageId,
    },
  });

  return response;
};

export const updateFunnelPageVisits = async (funnelPageId: string) => {
  const response = await db.funnelPage.update({
    where: {
      id: funnelPageId,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
  });

  return response;
};

export const getMedia = async (subAccountId: string) => {
  const mediaFiles = await db.subAccount.findUnique({
    where: {
      id: subAccountId,
    },
    include: {
      media: true,
    },
  });

  return mediaFiles;
};

export const createMedia = async (
  subAccountId: string,
  mediaFiles: CreateMediaType
) => {
  const { link, name } = mediaFiles;

  const response = await db.media.create({
    data: {
      subAccountId,
      link,
      name,
    },
  });

  return response;
};

export const deleteMedia = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId,
    },
  });

  return response;
};

export const getDomainContent = async (subDomainName: string) => {
  const response = await db.funnel.findUnique({
    where: {
      subDomainName,
    },
    include: {
      funnelPages: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return response;
};

export const searchContacts = async (searchTerms: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  });

  return response;
};

export const getSubAccountWithContacts = async (subAccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subAccountId,
    },
    include: {
      contacts: {
        include: {
          tickets: {
            select: {
              value: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return response;
};

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact,
  });

  return response;
};

export const getProducts = async (subaccountId: string) => {
  const response = await db.product.findMany({
    where: { subAccountId: subaccountId },
  });
  return response;
};

export const upsertProduct = async (
  subaccountId: string,
  product: Prisma.ProductUncheckedCreateInput
) => {
  // ensure ID is present for upsert, or generated for create
  const productId = product.id || v4();

  const response = await db.product.upsert({
    where: { id: productId },
    update: product,
    create: { ...product, id: productId, subAccountId: subaccountId },
  });

  await saveActivityLogsNotification({
    agencyId: undefined,
    description: `Updated product | ${response.name}`,
    subaccountId: subaccountId,
  });

  return response;
};

export const deleteProduct = async (productId: string) => {
  const response = await db.product.delete({
    where: { id: productId },
  });

  return response;
};

export const getInvitationsByAgencyId = async (agencyId: string) => {
  const response = await db.invitation.findMany({
    where: {
      agencyId,
      status: "PENDING",
    },
  });
  return response;
};

export const getTestimonials = async (agencyId: string) => {
  const response = await (db as any).testimonial.findMany({
    where: { agencyId },
  });
  return response;
};

export const upsertTestimonial = async (
  agencyId: string,
  testimonial: any
) => {
  const testimonialId = testimonial.id || v4();
  const response = await (db as any).testimonial.upsert({
    where: { id: testimonialId },
    update: testimonial,
    create: { ...testimonial, id: testimonialId, agencyId },
  });
  return response;
};

export const deleteTestimonial = async (testimonialId: string) => {
  const response = await (db as any).testimonial.delete({
    where: { id: testimonialId },
  });
  return response;
};

export const getAllTestimonials = async () => {
  const response = await (db as any).testimonial.findMany();
  return response;
};

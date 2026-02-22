"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role, User } from "@prisma/client";

import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { isClerkError } from "@/queries/_helpers";

// ─── Cached Clerk user ───────────────────────────────────────────────────────

/**
 * Cached Clerk user fetch to prevent duplicate API calls within a request.
 */
const getClerkUserCached = cache(async () => {
    try {
        return await currentUser();
    } catch (error: unknown) {
        if (isClerkError(error) && (error.status === 429 || error.clerkError)) {
            console.warn("Clerk rate limit hit:", error.status);
            return null;
        }
        console.warn(
            "Clerk auth error:",
            isClerkError(error) ? error.message : String(error)
        );
        return null;
    }
});

// ─── getCurrentUserEmail ──────────────────────────────────────────────────────

/**
 * Gets the current user's email from either Clerk or JWT auth.
 */
export const getCurrentUserEmail = async (): Promise<string | null> => {
    const clerkUser = await getClerkUserCached();
    if (clerkUser) {
        return clerkUser.emailAddresses[0].emailAddress;
    }

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token) {
            const decoded = verifyToken(token);
            if (
                decoded &&
                typeof decoded === "object" &&
                "email" in decoded
            ) {
                return decoded.email as string;
            }
        }
    } catch (error) {
        console.warn("JWT auth fallback failed:", error);
    }

    return null;
};

// ─── isClerkAuth ──────────────────────────────────────────────────────────────

export const isClerkAuth = async (): Promise<boolean> => {
    try {
        const clerkUser = await currentUser();
        return !!clerkUser;
    } catch (error: unknown) {
        if (isClerkError(error) && (error.status === 429 || error.clerkError)) {
            console.warn("Clerk rate limit hit in isClerkAuth");
            return false;
        }
        throw error;
    }
};

// ─── getAuthDetails ───────────────────────────────────────────────────────────

const getAuthDetailsInternal = async () => {
    const email = await getCurrentUserEmail();
    if (!email) return null;

    const userData = await db.user.findUnique({
        where: { email },
        include: {
            agency: {
                include: {
                    SidebarOptions: true,
                    SubAccounts: {
                        include: { sidebarOptions: true },
                    },
                },
            },
            Permissions: true,
        },
    });

    if (!userData) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = userData as typeof userData & {
        password?: string | null;
    };

    return safeUser;
};

export const getAuthDetails = cache(getAuthDetailsInternal);

// ─── createTeamUser ───────────────────────────────────────────────────────────

export const createTeamUser = async (agencyId: string, user: User) => {
    if (user.role === "AGENCY_OWNER") return null;
    const response = await db.user.create({ data: { ...user } });
    return response;
};

// ─── initUser ────────────────────────────────────────────────────────────────

export const initUser = async (newUser?: Partial<User>) => {
    const userEmail = await getCurrentUserEmail();

    let clerkUser = null;
    try {
        clerkUser = await currentUser();
    } catch (error: unknown) {
        if (isClerkError(error) && (error.status === 429 || error.clerkError)) {
            console.warn("Clerk rate limit hit in initUser, using JWT auth only");
        } else {
            throw error;
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
                ...(newUser?.role && { role: newUser.role as Role }),
                ...(newUser?.agencyId !== undefined && {
                    agencyId: newUser.agencyId,
                }),
            },
            create: {
                id: clerkUser.id,
                avatarUrl: clerkUser.imageUrl,
                name:
                    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
                    "User",
                email: clerkUser.emailAddresses[0].emailAddress,
                role: (newUser?.role as Role) || "SUBACCOUNT_USER",
                agencyId: newUser?.agencyId || null,
            },
        });

        try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(clerkUser.id, {
                privateMetadata: { role: newUser?.role || "SUBACCOUNT_USER" },
            });
        } catch (error: unknown) {
            if (isClerkError(error) && (error.status === 429 || error.clerkError)) {
                console.warn("Clerk rate limit hit when updating metadata:", error.status);
            } else {
                console.log("Could not update Clerk metadata:", error);
            }
        }

        return userData;
    }

    const existingUser = await db.user.findUnique({ where: { email: userEmail } });
    if (existingUser) {
        return await db.user.update({
            where: { email: userEmail },
            data: { ...newUser, updatedAt: new Date() },
        });
    }

    return null;
};

// ─── verifyAndAccpetInvitations ───────────────────────────────────────────────
// Import deferred to break potential circular dep with notifications

export const verifyAndAccpetInvitations = async () => {
    const userEmail = await getCurrentUserEmail();
    const clerkUser = await getClerkUserCached();

    if (!userEmail) return redirect("/agency/sign-in");

    if (!clerkUser) {
        const existingUser = await db.user.findUnique({
            where: { email: userEmail },
            include: { agency: true },
        });
        return existingUser?.agencyId || null;
    }

    const clerkEmail = clerkUser.emailAddresses[0].emailAddress;
    const invitationsExist = await db.invitation.findUnique({
        where: { email: clerkEmail, status: "PENDING" },
    });

    if (invitationsExist) {
        let userDetails;
        if (invitationsExist.role === "AGENCY_OWNER") {
            userDetails = await db.user.create({
                data: {
                    email: invitationsExist.email,
                    agencyId: invitationsExist.agencyId,
                    avatarUrl: clerkUser.imageUrl,
                    id: clerkUser.id,
                    name: `${clerkUser.firstName} ${clerkUser.lastName}`,
                    role: invitationsExist.role,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    password: null,
                },
            });
        } else {
            userDetails = await createTeamUser(invitationsExist.agencyId, {
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
        }

        if (userDetails) {
            // Dynamic import to avoid circular dep with notifications
            const { saveActivityLogsNotification } = await import(
                "@/queries/notifications"
            );
            await saveActivityLogsNotification({
                agencyId: invitationsExist.agencyId,
                description: `${clerkUser.firstName} ${clerkUser.lastName} has joined the agency`,
                subaccountId: undefined,
            });

            try {
                const client = await clerkClient();
                await client.users.updateUserMetadata(userDetails.id, {
                    publicMetadata: { role: userDetails.role || "SUBACCOUNT_USER" },
                });
            } catch (error: unknown) {
                if (isClerkError(error) && (error.status === 429 || error.clerkError)) {
                    console.warn("Clerk rate limit hit when updating metadata:", error.status);
                } else {
                    console.log("Could not update Clerk metadata:", error);
                }
            }

            await db.invitation.delete({
                where: { email: userDetails.email },
            });
            return userDetails?.agencyId;
        } else {
            return null;
        }
    } else {
        const existingUser = await db.user.findUnique({
            where: { email: clerkUser.emailAddresses[0].emailAddress },
        });
        return existingUser?.agencyId || null;
    }
};

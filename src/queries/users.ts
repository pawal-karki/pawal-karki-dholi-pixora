"use server";

import { db } from "@/lib/db";
import { Role, User } from "@prisma/client";

// ─── getAuthUser ──────────────────────────────────────────────────────────────

export const getAuthUser = async (email: string) => {
    const user = await db.user.findUnique({
        where: { email },
        include: {
            agency: { include: { SubAccounts: true } },
            Permissions: { include: { subAccount: true } },
        },
    });
    return user;
};

// ─── updateUser ───────────────────────────────────────────────────────────────

export const updateUser = async (user: Partial<User>) => {
    if (!user.email && !user.id) {
        throw new Error("Either email or id must be provided to update user");
    }
    const whereClause = user.id ? { id: user.id } : { email: user.email! };
    const response = await db.user.update({ where: whereClause, data: { ...user } });
    return response;
};

// ─── deleteUser ───────────────────────────────────────────────────────────────

export const deleteUser = async (userId: string) => {
    await db.permissions.deleteMany({
        where: {
            email: (await db.user.findUnique({ where: { id: userId } }))?.email,
        },
    });
    const response = await db.user.delete({ where: { id: userId } });
    return response;
};

// ─── changeUserPermissions ────────────────────────────────────────────────────

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
            create: { access: permission, email: userEmail, subAccountId },
        });
        return response;
    } catch (error) {
        console.log("Could not change permission:", error);
        return null;
    }
};

// ─── sendInvitation ───────────────────────────────────────────────────────────

export const sendInvitation = async (
    agencyId: string,
    email: string,
    role: Role
) => {
    const invitation = await db.invitation.create({
        data: { email, agencyId, role },
    });
    return invitation;
};

// ─── deleteInvitation ────────────────────────────────────────────────────────

export const deleteInvitation = async (invitationId: string) => {
    try {
        const response = await db.invitation.delete({ where: { id: invitationId } });
        return response;
    } catch {
        return null;
    }
};

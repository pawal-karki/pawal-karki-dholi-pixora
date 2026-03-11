"use server";

import { cache } from "react";

import { db } from "@/lib/db";
import { formatActivityNotification } from "@/lib/notification-format";
import { getCurrentUserEmail } from "@/queries/auth";

// ─── saveActivityLogsNotification ────────────────────────────────────────────

/**
 * Logs an activity notification for the agency dashboard.
 * Can be scoped to a specific subaccount or the entire agency.
 */
export const saveActivityLogsNotification = async ({
    agencyId,
    description,
    subaccountId,
    /**
     * Optional: explicitly set which user should own this notification.
     * Defaults to the acting user resolved from auth.
     */
    targetUserId,
}: {
    agencyId?: string;
    description: string;
    subaccountId?: string;
    targetUserId?: string;
}) => {
    const userEmail = await getCurrentUserEmail();
    let userData;

    if (!userEmail) {
        const response = await db.user.findFirst({
            where: {
                agency: {
                    SubAccounts: { some: { id: subaccountId } },
                },
            },
        });
        if (response) userData = response;
    } else {
        userData = await db.user.findUnique({ where: { email: userEmail } });
    }

    if (!userData) {
        console.log("Could not find a user");
        return;
    }

    let foundAgencyId = agencyId;
    if (!foundAgencyId) {
        if (!subaccountId) {
            console.error("[notifications] saveActivityLogsNotification: missing agencyId and subaccountId");
            return;
        }
        const response = await db.subAccount.findUnique({
            where: { id: subaccountId },
        });
        if (response) foundAgencyId = response.agencyId;
    }

    if (!foundAgencyId) {
        console.error("[notifications] saveActivityLogsNotification: could not resolve agencyId");
        return;
    }

    const notificationUserId = targetUserId || userData.id;

    if (subaccountId) {
        await db.notification.create({
            data: {
                notification: formatActivityNotification(
                    userData.name,
                    description,
                ),
                user: { connect: { id: notificationUserId } },
                agency: { connect: { id: foundAgencyId } },
                subAccount: { connect: { id: subaccountId } },
            },
        });
    } else {
        await db.notification.create({
            data: {
                notification: formatActivityNotification(
                    userData.name,
                    description,
                ),
                user: { connect: { id: notificationUserId } },
                agency: { connect: { id: foundAgencyId } },
            },
        });
    }
};

// ─── getNotifications ────────────────────────────────────────────────────────

const getNotificationsInternal = async (agencyId: string) => {
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
        take: 20,
    });
    return notifications;
};

export const getNotifications = cache(getNotificationsInternal);

// ─── markNotificationRead ──────────────────────────────────────────────────────

export const markNotificationRead = async (notificationId: string) => {
    try {
        await db.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    } catch (error) {
        console.error("[notifications] markNotificationRead error:", error);
        throw new Error("Failed to mark notification as read");
    }
};

// ─── markAllNotificationsReadForCurrentUser ────────────────────────────────────

export const markAllNotificationsReadForCurrentUser = async () => {
    try {
        const email = await getCurrentUserEmail();
        if (!email) {
            throw new Error("Not authenticated");
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("User not found");
        }

        await db.notification.updateMany({
            where: { userId: user.id, read: false },
            data: { read: true },
        });
    } catch (error) {
        console.error("[notifications] markAllNotificationsReadForCurrentUser error:", error);
        throw new Error("Failed to mark notifications as read");
    }
};

"use server";

import { cache } from "react";

import { db } from "@/lib/db";
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
}: {
    agencyId?: string;
    description: string;
    subaccountId?: string;
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
            throw new Error(
                "You need to provide atleast an agency Id or subaccount Id"
            );
        }
        const response = await db.subAccount.findUnique({
            where: { id: subaccountId },
        });
        if (response) foundAgencyId = response.agencyId;
    }

    if (subaccountId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                user: { connect: { id: userData.id } },
                agency: { connect: { id: foundAgencyId } },
                subAccount: { connect: { id: subaccountId } },
            },
        });
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                user: { connect: { id: userData.id } },
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

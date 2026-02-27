"use server";

import { v4 } from "uuid";

import { db } from "@/lib/db";
import { getCurrentUserEmail } from "@/queries/auth";
import { canCreateSubAccount } from "@/lib/plan-limits";

// ─── getSubAccountDetails ─────────────────────────────────────────────────────

export const getSubAccountDetails = async (subAccountId: string) => {
    const subAccount = await db.subAccount.findUnique({
        where: { id: subAccountId },
    });
    return subAccount;
};

// ─── getSubAccountsByAgency ───────────────────────────────────────────────────

export const getSubAccountsByAgency = async (agencyId: string) => {
    const subAccounts = await db.subAccount.findMany({ where: { agencyId } });
    return subAccounts;
};

// ─── getSubAccountTeamMembers ─────────────────────────────────────────────────

export const getSubAccountTeamMembers = async (subAccountId: string) => {
    const subAccountWithAccess = await db.user.findMany({
        where: {
            agency: {
                SubAccounts: { some: { id: subAccountId } },
            },
            Permissions: { some: { subAccountId, access: true } },
        },
    });
    return subAccountWithAccess;
};

// ─── upsertSubAccount ─────────────────────────────────────────────────────────

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

    const existingSubAccount = await db.subAccount.findUnique({
        where: { id: subAccount.id },
    });

    if (!existingSubAccount) {
        const planCheck = await canCreateSubAccount(subAccount.agencyId);
        if (!planCheck.allowed) {
            console.log("upsertSubAccount: Plan limit reached -", planCheck.message);
            throw new Error(`PLAN_LIMIT: ${planCheck.message}`);
        }
    }

    const agencyOwner = await db.user.findFirst({
        where: {
            agency: { id: subAccount.agencyId },
            role: "AGENCY_OWNER",
        },
    });

    if (!agencyOwner) {
        console.log("upsertSubAccount: No agency owner found for agency:", subAccount.agencyId);
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
                pipelines: { create: [{ name: "Lead Cycle" }] },
                sidebarOptions: {
                    create: [
                        { name: "Launchpad", icon: "clipboardIcon", link: `/subaccount/${subAccount.id}/launchpad` },
                        { name: "Settings", icon: "settings", link: `/subaccount/${subAccount.id}/settings` },
                        { name: "Funnels", icon: "pipelines", link: `/subaccount/${subAccount.id}/funnels` },
                        { name: "Media", icon: "database", link: `/subaccount/${subAccount.id}/media` },
                        { name: "Pipelines", icon: "flag", link: `/subaccount/${subAccount.id}/pipelines` },
                        { name: "Contacts", icon: "person", link: `/subaccount/${subAccount.id}/contacts` },
                        { name: "Dashboard", icon: "category", link: `/subaccount/${subAccount.id}` },
                        { name: "Chat", icon: "messages", link: `/subaccount/${subAccount.id}/chat` },
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

// ─── deleteSubAccount ─────────────────────────────────────────────────────────

export const deleteSubAccount = async (subAccountId: string) => {
    const response = await db.subAccount.delete({ where: { id: subAccountId } });
    return response;
};

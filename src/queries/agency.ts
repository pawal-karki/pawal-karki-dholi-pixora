"use server";

import { cache } from "react";
import { Agency } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUserEmail } from "@/queries/auth";

// ─── getAgencyDetails ─────────────────────────────────────────────────────────

const getAgencyDetailsInternal = async (agencyId: string) => {
    const agency = await db.agency.findUnique({
        where: { id: agencyId },
        include: {
            SubAccounts: true,
            Subscriptions: true,
        },
    });
    return agency;
};

export const getAgencyDetails = cache(getAgencyDetailsInternal);

// ─── updateAgencyDetails ──────────────────────────────────────────────────────

export const updateAgencyDetails = async (
    agencyId: string,
    details: Partial<Agency>
) => {
    if (!agencyId) return null;
    const agency = await db.agency.update({
        where: { id: agencyId },
        data: { ...details, updatedAt: new Date() },
    });
    return agency;
};

// ─── deleteAgency ─────────────────────────────────────────────────────────────

export const deleteAgency = async (agencyId: string) => {
    const response = await db.agency.delete({ where: { id: agencyId } });
    return response;
};

// ─── updateAgencyConnectedId ──────────────────────────────────────────────────

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

// ─── getAuthUserGroup ─────────────────────────────────────────────────────────

export const getAuthUserGroup = async (agencyId: string) => {
    const teamMembers = await db.user.findMany({
        where: { agency: { id: agencyId } },
        include: {
            agency: { include: { SubAccounts: true } },
            Permissions: { include: { subAccount: true } },
        },
    });
    return teamMembers;
};

// ─── upsertAgency ─────────────────────────────────────────────────────────────

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

export const upsertAgency = async (agency: UpsertAgencyInput) => {
    if (!agency.companyEmail) return null;

    const userEmail = await getCurrentUserEmail();
    if (!userEmail) return null;

    const existingAgency = await db.agency.findUnique({
        where: { id: agency.id },
        include: { users: true },
    });
    const isNewAgency = !existingAgency;

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
                users: { connect: { email: userEmail } },
                SidebarOptions: {
                    create: [
                        { name: "Dashboard", icon: "category", link: `/agency/${agency.id}` },
                        { name: "Launchpad", icon: "clipboardIcon", link: `/agency/${agency.id}/launchpad` },
                        { name: "Billing", icon: "payment", link: `/agency/${agency.id}/billing` },
                        { name: "Settings", icon: "settings", link: `/agency/${agency.id}/settings` },
                        { name: "Sub Accounts", icon: "person", link: `/agency/${agency.id}/all-subaccounts` },
                        { name: "Team", icon: "shield", link: `/agency/${agency.id}/team` },
                    ],
                },
            },
        });

        if (agencyDetails) {
            const existingUser = await db.user.findUnique({ where: { email: userEmail } });
            if (isNewAgency) {
                await db.user.update({
                    where: { email: userEmail },
                    data: { agencyId: agencyDetails.id, role: "AGENCY_OWNER" },
                });
            } else if (existingUser && existingUser.agencyId !== agencyDetails.id) {
                await db.user.update({
                    where: { email: userEmail },
                    data: { agencyId: agencyDetails.id },
                });
            }
        }

        return agencyDetails;
    } catch (error) {
        console.log("Error upserting agency:", error);
        return null;
    }
};

// ─── getInvitationsByAgencyId ─────────────────────────────────────────────────

export const getInvitationsByAgencyId = async (agencyId: string) => {
    const response = await db.invitation.findMany({
        where: { agencyId, status: "PENDING" },
    });
    return response;
};


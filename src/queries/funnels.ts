"use server";

import { v4 } from "uuid";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { type FunnelDetailsSchema } from "@/queries/validators";

export const getFunnels = async (subAccountId: string) => {
    const response = await db.funnel.findMany({
        where: { subAccountId },
        include: { funnelPages: true },
    });
    return response;
};

export const getFunnel = async (funnelId: string) => {
    const response = await db.funnel.findUnique({
        where: { id: funnelId },
        include: { funnelPages: { orderBy: { order: "asc" } } },
    });
    return response;
};

export const upsertFunnel = async (
    subAccountId: string,
    funnel: FunnelDetailsSchema & { liveProducts: string },
    funnelId: string
) => {
    const response = await db.funnel.upsert({
        where: { id: funnelId },
        update: funnel,
        create: { ...funnel, id: funnelId || v4(), subAccountId },
    });
    return response;
};

export const upsertFunnelPage = async (
    subAccountId: string,
    funnelId: string,
    funnelPage: Prisma.FunnelPageCreateWithoutFunnelInput
) => {
    if (!subAccountId || !funnelId) return undefined;
    const response = await db.funnelPage.upsert({
        where: { id: funnelPage.id || "" },
        update: funnelPage,
        create: {
            ...funnelPage,
            funnelId,
            content: funnelPage.content
                ? funnelPage.content
                : JSON.stringify([{ content: [], id: "__body", name: "Body", styles: { backgroundColor: "white" }, type: "__body" }]),
        },
    });
    revalidatePath(`/subaccount/${subAccountId}/funnels/${funnelId}`);
    return response;
};

export const deleteFunnelPage = async (funnelPageId: string) => {
    const response = await db.funnelPage.delete({ where: { id: funnelPageId } });
    return response;
};

export const getFunnelPageDetails = async (funnelPageId: string) => {
    const response = await db.funnelPage.findFirst({ where: { id: funnelPageId } });
    return response;
};

export const updateFunnelProducts = async (products: string, funnelId: string) => {
    const response = await db.funnel.update({
        where: { id: funnelId },
        data: { liveProducts: products },
    });
    return response;
};

export const updateFunnelPageVisits = async (funnelPageId: string) => {
    const response = await db.funnelPage.update({
        where: { id: funnelPageId },
        data: { visits: { increment: 1 } },
    });
    return response;
};

export const getDomainContent = async (subDomainName: string) => {
    const response = await db.funnel.findUnique({
        where: { subDomainName },
        include: { funnelPages: { orderBy: { order: "asc" } } },
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
            order: 99,
            content,
        },
    });
    return response;
};

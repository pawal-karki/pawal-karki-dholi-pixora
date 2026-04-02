"use server";

import { v4 } from "uuid";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getFunnelLiveSiteUrl, getFunnelSubdomainHost } from "@/lib/subdomain";
import { type FunnelDetailsSchema } from "@/queries/validators";

function normalizeFunnelSubdomain(name: string) {
    return name.trim().toLowerCase();
}

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
    const payload = {
        ...funnel,
        subDomainName: normalizeFunnelSubdomain(funnel.subDomainName),
    };
    try {
        const prior = await db.funnel.findUnique({
            where: { id: funnelId },
            select: { subDomainName: true },
        });
        const response = await db.funnel.upsert({
            where: { id: funnelId },
            update: payload,
            create: { ...payload, id: funnelId || v4(), subAccountId },
        });
        const slug = response.subDomainName?.trim();
        if (slug) {
            const liveUrl = getFunnelLiveSiteUrl(slug);
            const host = getFunnelSubdomainHost(slug);
            if (!prior) {
                console.log(`[subdomain] Subdomain create: reserved "${slug}" for funnel ${response.id}`);
                console.log(`[subdomain] Now live on ${host} (${liveUrl})`);
            } else if (prior.subDomainName !== slug) {
                console.log(
                    `[subdomain] Subdomain update: "${prior.subDomainName}" → "${slug}" — public host ${host} (${liveUrl})`,
                );
            } else {
                console.log(`[subdomain] Funnel saved (${response.id}); public URL ${liveUrl}`);
            }
        }
        return response;
    } catch (e) {
        if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
        ) {
            const target = e.meta?.target;
            const fields = Array.isArray(target) ? target : target ? [target] : [];
            if (fields.some((f) => String(f).includes("subDomainName"))) {
                throw new Error(
                    "That subdomain is already taken. Choose a different one."
                );
            }
        }
        throw e;
    }
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

"use server";

import { v4 } from "uuid";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { saveActivityLogsNotification } from "@/queries/notifications";

// ─── getProducts ──────────────────────────────────────────────────────────────

export const getProducts = async (subaccountId: string) => {
    const response = await db.product.findMany({
        where: { subAccountId: subaccountId },
    });
    return response;
};

// ─── upsertProduct ────────────────────────────────────────────────────────────

export const upsertProduct = async (
    subaccountId: string,
    product: Prisma.ProductUncheckedCreateInput
) => {
    const productId = product.id || v4();

    const response = await db.product.upsert({
        where: { id: productId },
        update: product,
        create: { ...product, id: productId, subAccountId: subaccountId },
    });

    await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated product | ${response.name}`,
        subaccountId,
    });

    return response;
};

// ─── deleteProduct ────────────────────────────────────────────────────────────

export const deleteProduct = async (productId: string) => {
    const response = await db.product.delete({ where: { id: productId } });
    return response;
};

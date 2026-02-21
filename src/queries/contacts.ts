"use server";

import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

import { Prisma } from "@prisma/client";

export const searchContacts = async (searchTerms: string, subAccountId: string) => {
    const response = await db.contact.findMany({
        where: {
            name: { contains: searchTerms, mode: "insensitive" },
            subAccountId,
        },
    });
    return response;
};

export const getSubAccountWithContacts = async (subAccountId: string) => {
    const response = await db.subAccount.findUnique({
        where: { id: subAccountId },
        include: {
            contacts: {
                include: { tickets: { select: { value: true } } },
                orderBy: { createdAt: "asc" },
            },
        },
    });
    if (response) {
        return {
            ...response,
            contacts: response.contacts.map((contact) => ({
                ...contact,
                tickets: contact.tickets.map((ticket) => ({
                    ...ticket,
                    value: ticket.value ? String(ticket.value) : null,
                })),
            })),
        };
    }
    return response;
};

export type UpsertContactInput = {
    id?: string;
    name: string;
    email?: string;
    subAccountId: string;
};

export const upsertContact = async (contact: UpsertContactInput) => {
    const response = await db.contact.upsert({
        where: { id: contact.id || uuidv4() },
        update: {
            name: contact.name,
            email: contact.email || "",
            subAccountId: contact.subAccountId,
        },
        create: {
            id: contact.id || uuidv4(),
            name: contact.name,
            email: contact.email || "",
            subAccountId: contact.subAccountId,
        },
    });

    return response;
};

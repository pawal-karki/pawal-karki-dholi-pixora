"use server";

import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { Prisma, Tag } from "@prisma/client";

export const getTicketsWithTags = async (pipelineId: string) => {
    const response = await db.ticket.findMany({
        where: { lane: { pipelineId } },
        include: { tags: true, assigned: true, customer: true },
    });
    return response.map((ticket) => ({
        ...ticket,
        value: ticket.value ? String(ticket.value) : null,
    }));
};

export const upsertTicket = async (
    ticket: Prisma.TicketUncheckedCreateInput,
    tags: Tag[]
) => {
    const response = await db.ticket.upsert({
        where: { id: ticket.id || uuidv4() },
        update: { ...ticket, tags: { set: tags.map((tag) => ({ id: tag.id })) } },
        create: { ...ticket, tags: { connect: tags.map((tag) => ({ id: tag.id })) } },
        include: {
            assigned: true,
            customer: true,
            tags: true,
            lane: true,
        },
    });
    return { ...response, value: response.value ? String(response.value) : null };
};

export const deleteTicket = async (ticketId: string) => {
    const response = await db.ticket.delete({ where: { id: ticketId } });
    return response;
};

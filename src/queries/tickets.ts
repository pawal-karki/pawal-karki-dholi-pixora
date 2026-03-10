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
    // Fetch old assignment before upserting to detect new assignment
    const prevTicket = ticket.id
        ? await db.ticket.findUnique({
            where: { id: ticket.id as string },
            select: { assignedUserId: true },
        })
        : null;

    const response = await db.ticket.upsert({
        where: { id: ticket.id || uuidv4() },
        update: { ...ticket, tags: { set: tags.map((tag) => ({ id: tag.id })) } },
        create: { ...ticket, tags: { connect: tags.map((tag) => ({ id: tag.id })) } },
        include: {
            assigned: true,
            customer: true,
            tags: true,
            lane: { include: { pipeline: { include: { subAccount: true } } } },
        },
    });

    // ── Trigger email notification when ticket is newly assigned ──────────────
    const newAssigneeId = response.assignedUserId;
    const prevAssigneeId = prevTicket?.assignedUserId;
    const isNewAssignment = newAssigneeId && newAssigneeId !== prevAssigneeId;

    if (isNewAssignment && response.assigned) {
        const assignee = response.assigned;
        const lane = response.lane;
        const subAccount = lane?.pipeline?.subAccount;
        const pipelineId = lane?.pipelineId;

        // Build the URL to the pipeline (fallback to base URL if env not set)
        const baseUrl =
            process.env.NEXT_PUBLIC_DOMAIN
                ? `https://${process.env.NEXT_PUBLIC_DOMAIN}`
                : process.env.NEXT_PUBLIC_URL || "https://pawal.dev";

        const subAccountId = subAccount?.id;
        const pipelineUrl = subAccountId && pipelineId
            ? `${baseUrl}/subaccount/${subAccountId}/pipelines/${pipelineId}`
            : baseUrl;

        // Send email — fire-and-forget, never block the ticket save
        try {
            const { sendTicketAssignmentEmail } = await import("@/lib/email");
            await sendTicketAssignmentEmail({
                to: assignee.email,
                assigneeName: assignee.name,
                ticketName: response.name,
                laneName: lane?.name ?? "Unknown Lane",
                subAccountName: subAccount?.name ?? "Your Workspace",
                pipelineUrl,
                description: response.description,
            });
        } catch (emailErr) {
            console.error("[upsertTicket] Failed to send assignment email:", emailErr);
        }

        // Save activity notification in the dashboard
        try {
            const { saveActivityLogsNotification } = await import("@/queries/notifications");
            await saveActivityLogsNotification({
                agencyId: subAccount?.agencyId,
                description: `assigned ticket | ${response.name} | to ${assignee.name}`,
                subaccountId: subAccountId,
                // Ensure the notification belongs to the assignee so they see it
                targetUserId: assignee.id,
            });
        } catch (notifErr) {
            console.error("[upsertTicket] Failed to save notification:", notifErr);
        }
    }

    return { ...response, value: response.value ? String(response.value) : null };
};

export const deleteTicket = async (ticketId: string) => {
    const response = await db.ticket.delete({ where: { id: ticketId } });
    return response;
};

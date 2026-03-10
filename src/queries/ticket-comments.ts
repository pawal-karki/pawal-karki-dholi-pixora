"use server";

import { db } from "@/lib/db";
import { getAuthDetails } from "@/queries/auth";

/** Returns just the id and role of the currently signed-in user (Clerk or JWT) */
export const getCurrentUserInfo = async (): Promise<{ id: string; role: string } | null> => {
    try {
        const user = await getAuthDetails();
        if (!user) return null;
        return { id: user.id, role: user.role };
    } catch (error) {
        console.error("[ticket-comments] getCurrentUserInfo error:", error);
        return null;
    }
};

/** Fetch all comments for a ticket (visible to everyone) */
export const getTicketComments = async (ticketId: string) => {
    try {
        return await db.ticketComment.findMany({
            where: { ticketId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });
    } catch (error) {
        console.error("[ticket-comments] getTicketComments error:", error);
        return [];
    }
};

/** Add a comment — restricted to AGENCY_OWNER and AGENCY_ADMIN roles */
export const addTicketComment = async (ticketId: string, content: string) => {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo) {
        throw new Error("Not authenticated");
    }

    if (userInfo.role !== "AGENCY_OWNER" && userInfo.role !== "AGENCY_ADMIN") {
        throw new Error("Only agency owners and admins can post comments");
    }

    const trimmed = content.trim();
    if (!trimmed) {
        throw new Error("Comment cannot be empty");
    }

    try {
        return await db.ticketComment.create({
            data: {
                content: trimmed,
                ticketId,
                authorId: userInfo.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
        });
    } catch (error) {
        console.error("[ticket-comments] addTicketComment error:", error);
        throw new Error("Failed to post comment. Please try again.");
    }
};

/** Delete a comment — restricted to AGENCY_OWNER and AGENCY_ADMIN */
export const deleteTicketComment = async (commentId: string) => {
    const userInfo = await getCurrentUserInfo();

    if (!userInfo) throw new Error("Not authenticated");
    if (userInfo.role !== "AGENCY_OWNER" && userInfo.role !== "AGENCY_ADMIN") {
        throw new Error("Only agency owners and admins can delete comments");
    }

    try {
        return await db.ticketComment.delete({ where: { id: commentId } });
    } catch (error) {
        console.error("[ticket-comments] deleteTicketComment error:", error);
        throw new Error("Failed to delete comment. Please try again.");
    }
};

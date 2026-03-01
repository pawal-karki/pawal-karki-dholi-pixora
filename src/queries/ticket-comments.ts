"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/** Get the current user from the JWT cookie */
async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return null;
        const payload = verifyToken(token);
        if (!payload) return null;
        return await db.user.findUnique({ where: { id: payload.userId } });
    } catch (error) {
        console.error("[ticket-comments] getCurrentUser error:", error);
        return null;
    }
}

/** Returns just the id and role of the currently signed-in user */
export const getCurrentUserInfo = async (): Promise<{ id: string; role: string } | null> => {
    try {
        const user = await getCurrentUser();
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

/** Add a comment — restricted to AGENCY_OWNER role only */
export const addTicketComment = async (ticketId: string, content: string) => {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    if (user.role !== "AGENCY_OWNER") {
        throw new Error("Only agency owners can post comments");
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
                authorId: user.id,
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

/** Delete a comment — restricted to AGENCY_OWNER and comment's own author */
export const deleteTicketComment = async (commentId: string) => {
    const user = await getCurrentUser();

    if (!user) throw new Error("Not authenticated");
    if (user.role !== "AGENCY_OWNER") throw new Error("Only agency owners can delete comments");

    try {
        return await db.ticketComment.delete({ where: { id: commentId } });
    } catch (error) {
        console.error("[ticket-comments] deleteTicketComment error:", error);
        throw new Error("Failed to delete comment. Please try again.");
    }
};

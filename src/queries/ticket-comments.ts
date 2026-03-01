"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/** Get the current user from the JWT cookie */
async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    return db.user.findUnique({ where: { id: payload.userId } });
}

/** Returns just the id and role of the currently signed-in user */
export const getCurrentUserInfo = async (): Promise<{ id: string; role: string } | null> => {
    const user = await getCurrentUser();
    if (!user) return null;
    return { id: user.id, role: user.role };
};

/** Fetch all comments for a ticket (visible to everyone) */
export const getTicketComments = async (ticketId: string) => {
    return db.ticketComment.findMany({
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

    return db.ticketComment.create({
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
};

/** Delete a comment — restricted to AGENCY_OWNER and comment's own author */
export const deleteTicketComment = async (commentId: string) => {
    const user = await getCurrentUser();

    if (!user) throw new Error("Not authenticated");
    if (user.role !== "AGENCY_OWNER") throw new Error("Only agency owners can delete comments");

    return db.ticketComment.delete({ where: { id: commentId } });
};

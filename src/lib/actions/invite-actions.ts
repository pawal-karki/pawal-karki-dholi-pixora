"use server";

import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { sendInvitationEmail } from "@/lib/email";

export async function sendInvitationAction(formData: FormData) {
    const email = (formData.get("email") as string).toLowerCase();
    const role = formData.get("role") as Role;
    const agencyId = formData.get("agencyId") as string;

    console.log("SERVER ACTION FormData received:", { email, role, agencyId });

    if (!email || !agencyId || !role) {
        console.error("Missing fields:", { agencyId, email, role });
        throw new Error("Missing required fields: email, agencyId, or role");
    }

    const invitation = await db.invitation.create({
        data: {
            email,
            agencyId,
            role,
        },
    });

    try {
        const agency = await db.agency.findUnique({
            where: { id: agencyId },
        });

        if (agency) {
            try {
                const client = await clerkClient();
                await client.invitations.createInvitation({
                    emailAddress: email,
                    redirectUrl: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
                    publicMetadata: {
                        throughInvitation: true,
                        role,
                        agencyId,
                    },
                });
                return { success: "Invitation sent successfully." };
            } catch (error: any) {
                // If Clerk fails, rollback the database invitation to maintain consistency
                await db.invitation.delete({ where: { id: invitation.id } });

                const errorCode = error.errors?.[0]?.code;
                console.log("Clerk invitation error:", errorCode);

                if (errorCode === "form_identifier_exists") {
                    return { error: "User already attached to an account." };
                }
                if (errorCode === "duplicate_record") {
                    return { error: "Invitation already pending." };
                }
                if (errorCode === "invitations_not_supported") {
                    return { error: "Clerk Invitations not enabled in dashboard." };
                }

                return { error: error.errors?.[0]?.message || "Could not send invitation." };
            }
        }

        return { success: "Invitation created (No Agency found)." };
    } catch (error) {
        console.error("Failed to send invitation:", error);
        return { error: "Failed to send invitation." };
    }
}

"use server";

import { updateAgencyConnectedId } from "@/lib/queries";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-12-15.clover",
});

/**
 * Exchanges a Stripe OAuth authorization code for an access token
 * and saves the connected account ID to the agency.
 */
export async function connectStripeAccount(
    agencyId: string,
    code: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Exchange the authorization code for an access token
        const response = await stripe.oauth.token({
            grant_type: "authorization_code",
            code,
        });

        if (!response.stripe_user_id) {
            return { success: false, error: "No Stripe user ID received" };
        }

        // Save the connected account ID to the database
        await updateAgencyConnectedId(agencyId, response.stripe_user_id);

        return { success: true };
    } catch (error) {
        console.error("Error connecting Stripe account:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to connect Stripe",
        };
    }
}

/**
 * Exchanges a Stripe OAuth authorization code for an access token
 * and saves the connected account ID to the subaccount.
 */
export async function connectStripeSubAccount(
    subAccountId: string,
    code: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Exchange the authorization code for an access token
        const response = await stripe.oauth.token({
            grant_type: "authorization_code",
            code,
        });

        if (!response.stripe_user_id) {
            return { success: false, error: "No Stripe user ID received" };
        }

        // Save the connected account ID to the subaccount
        await db.subAccount.update({
            where: { id: subAccountId },
            data: { connectAccountId: response.stripe_user_id },
        });

        return { success: true };
    } catch (error) {
        console.error("Error connecting Stripe subaccount:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to connect Stripe",
        };
    }
}


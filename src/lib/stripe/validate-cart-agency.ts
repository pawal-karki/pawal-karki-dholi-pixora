import { db } from "@/lib/db";

export async function validateCartAgency(
    prices: any[],
    expectedSubAccountId: string
): Promise<{ valid: boolean; error?: string }> {
    try {
        // Get expected agency from subAccountId
        const subAccount = await db.subAccount.findUnique({
            where: { id: expectedSubAccountId },
            select: { agencyId: true },
        });

        if (!subAccount) {
            return { valid: false, error: "Invalid subaccount" };
        }

        const expectedAgencyId = subAccount.agencyId;

        // Extract price IDs from cart
        const priceIds = prices.map((p) => p.priceId || p.id || p);

        if (priceIds.length === 0) {
            return { valid: true };
        }

        // Fetch all products for these price IDs
        const products = await db.product.findMany({
            where: {
                stripePriceId: { in: priceIds },
            },
            include: {
                subAccount: {
                    select: { agencyId: true },
                },
            },
        });

        // Check if we found all products
        if (products.length !== priceIds.length) {
            // Some products might not be in DB (e.g. custom items or old data), 
            // strictly speaking this might be okay if we only care about agency match for existing ones,
            // but for safety let's just validate the ones we found.
        }

        // Check all products belong to same agency
        const invalidProducts = products.filter(
            (p) => p.subAccount.agencyId !== expectedAgencyId
        );

        if (invalidProducts.length > 0) {
            return {
                valid: false,
                error: `Cart contains products from different agencies. Please clear your cart and try again.`,
            };
        }

        return { valid: true };
    } catch (error) {
        console.error("Cart validation error:", error);
        return { valid: false, error: "Validation failed" };
    }
}

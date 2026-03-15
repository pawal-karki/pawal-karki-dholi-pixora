export async function getAgencySubscriptionHistory(agencyId: string) {
    const subscription = await db.subscription.findUnique({
        where: { agencyId },
        include: { agency: true },
    });

    if (!subscription?.customerId) return [];

    try {
        const invoices = await stripe.invoices.list({
            customer: subscription.customerId,
            limit: 10,
        });

        return invoices.data.map((invoice) => ({
            id: invoice.id,
            amount: (invoice.amount_paid || 0) / 100,
            currency: (invoice.currency || "npr").toUpperCase(),
            description: invoice.lines.data[0]?.description || "Subscription Payment",
            status: invoice.status || "unknown",
            created: new Date((invoice.created || 0) * 1000),
            type: "subscription" as const,
            invoicePdf: invoice.invoice_pdf,
            hostedUrl: invoice.hosted_invoice_url,
        }));
    } catch (error) {
        console.error("Error fetching subscription history:", error);
        return [];
    }
}
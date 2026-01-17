import { NextRequest, NextResponse } from "next/server";
import { createAgencySubscriptionCheckout } from "@/lib/stripe-actions";
import { getAuthDetails } from "@/lib/queries";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getAuthDetails();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { agencyId, priceId, successUrl, cancelUrl } = body ?? {};

    if (!agencyId || !priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user has access to this agency
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      include: { users: { where: { id: user.id } } },
    });

    if (!agency || agency.users.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate priceId exists in our system
    const validPrice = await db.planPrice.findFirst({
      where: { priceId },
    });

    if (!validPrice) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Validate URLs are from our domain
    const allowedHosts = ["localhost", process.env.NEXT_PUBLIC_DOMAIN].filter(Boolean);
    
    for (const url of [successUrl, cancelUrl]) {
      try {
        const parsed = new URL(url);
        if (!allowedHosts.some(host => parsed.hostname.includes(host as string))) {
          return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }
    }

    const result = await createAgencySubscriptionCheckout({
      agencyId,
      priceId,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("[Stripe] Subscription session error:", e);
    return NextResponse.json(
      { error: "Failed to create subscription session" },
      { status: 500 }
    );
  }
}

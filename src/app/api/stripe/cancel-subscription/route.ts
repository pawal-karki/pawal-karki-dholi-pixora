import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { db } from "@/lib/db";
import { getAuthDetails } from "@/lib/queries";
import { stripe } from "@/lib/stripe/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthDetails();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== Role.AGENCY_OWNER) {
      return NextResponse.json(
        { error: "Only agency owners can cancel subscriptions." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { agencyId } = body ?? {};

    if (!agencyId) {
      return NextResponse.json({ error: "Missing agencyId" }, { status: 400 });
    }

    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      include: { users: { where: { id: user.id } } },
    });

    if (!agency || agency.users.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subscription = await db.subscription.findUnique({
      where: { agencyId },
    });

    if (!subscription?.subscritiptionId) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 404 }
      );
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscription.subscritiptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEnd = (updatedSubscription as any).current_period_end;

    await db.subscription.update({
      where: { agencyId },
      data: {
        active: ["active", "trialing"].includes(updatedSubscription.status),
        currentPeriodEndDate: periodEnd
          ? new Date(periodEnd * 1000)
          : subscription.currentPeriodEndDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of current billing period.",
    });
  } catch (error) {
    console.error("[Stripe] Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription." },
      { status: 500 }
    );
  }
}

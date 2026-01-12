import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/stripe/plan-prices
 * Public endpoint - returns configured plan priceIds
 */
export async function GET() {
  try {
    const prices = await db.planPrice.findMany({
      select: { key: true, priceId: true },
    });

    const map: Record<string, string> = {};
    for (const p of prices) {
      map[p.key] = p.priceId;
    }

    return NextResponse.json(map);
  } catch {
    return NextResponse.json(
      { error: "Failed to load prices" },
      { status: 500 }
    );
  }
}

// Note: POST endpoint removed for security
// Plan prices should be configured via database migrations or admin panel

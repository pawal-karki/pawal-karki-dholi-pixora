import { NextRequest, NextResponse } from "next/server";

import { assignSequentialOrder, reorderByIndex } from "@/lib/dnd-reorder";
import { assertFunnelToolsAllowed } from "@/lib/funnel-tools-guard";

type Row = Record<string, unknown> & { order?: number };

/**
 * POST /api/funnel-tools/dnd-reorder
 * Body: { items: Row[], fromIndex: number, toIndex: number, assignOrder?: boolean }
 * Mirrors funnel step drag-and-drop + assignSequentialOrder for persistence payloads.
 */
export async function POST(req: NextRequest) {
  const denied = assertFunnelToolsAllowed(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { items, fromIndex, toIndex, assignOrder = true } = body ?? {};

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items must be an array" }, { status: 400 });
    }
    if (typeof fromIndex !== "number" || typeof toIndex !== "number") {
      return NextResponse.json(
        { error: "fromIndex and toIndex must be numbers" },
        { status: 400 }
      );
    }

    const reordered = reorderByIndex(items as Row[], fromIndex, toIndex);
    const result = assignOrder ? assignSequentialOrder(reordered) : reordered;

    return NextResponse.json({
      items: result,
      fromIndex,
      toIndex,
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

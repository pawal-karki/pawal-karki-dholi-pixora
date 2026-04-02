import { NextRequest, NextResponse } from "next/server";

import { TEMPLATE_GENERATORS } from "@/lib/editor/template-definitions";
import type { DeviceTypes } from "@/lib/types/editor";
import { assertFunnelToolsAllowed } from "@/lib/funnel-tools-guard";

/**
 * GET /api/funnel-tools/templates/:templateId?device=Desktop|Mobile|Tablet
 * Returns a fresh generated element tree (new UUIDs each call).
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ templateId: string }> }
) {
  const denied = assertFunnelToolsAllowed(req);
  if (denied) return denied;

  const { templateId } = await context.params;
  const decodedId = decodeURIComponent(templateId);
  const gen = TEMPLATE_GENERATORS[decodedId];
  if (!gen) {
    return NextResponse.json(
      { error: "Unknown template id", id: decodedId },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(req.url);
  const deviceParam = searchParams.get("device") || "Desktop";
  const device = (["Desktop", "Mobile", "Tablet"].includes(deviceParam)
    ? deviceParam
    : "Desktop") as DeviceTypes;

  const element = gen(device);
  return NextResponse.json({
    id: decodedId,
    device,
    element,
  });
}

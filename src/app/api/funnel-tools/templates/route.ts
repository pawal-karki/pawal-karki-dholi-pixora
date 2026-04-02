import { NextRequest, NextResponse } from "next/server";

import { TEMPLATE_GENERATORS } from "@/lib/editor/template-definitions";
import { assertFunnelToolsAllowed } from "@/lib/funnel-tools-guard";

/** GET /api/funnel-tools/templates — list template ids (editor TEMPLATE_GENERATORS). */
export async function GET(req: NextRequest) {
  const denied = assertFunnelToolsAllowed(req);
  if (denied) return denied;

  const ids = Object.keys(TEMPLATE_GENERATORS).sort();
  return NextResponse.json({
    count: ids.length,
    templates: ids.map((id) => ({ id })),
  });
}

import { NextRequest, NextResponse } from "next/server";

/**
 * When FUNNEL_TOOLS_SECRET is set, require header `x-funnel-tools-secret`.
 * Leave unset for local Postman / Newman without extra headers.
 */
export function assertFunnelToolsAllowed(req: NextRequest): NextResponse | null {
  const secret = process.env.FUNNEL_TOOLS_SECRET?.trim();
  if (!secret) return null;
  if (req.headers.get("x-funnel-tools-secret") !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

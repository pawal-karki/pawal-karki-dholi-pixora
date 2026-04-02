import { NextRequest, NextResponse } from "next/server";

import { buildPublishedFunnelPageUrl, normalizeScheme } from "@/lib/funnel-url";
import { assertFunnelToolsAllowed } from "@/lib/funnel-tools-guard";

/**
 * POST /api/funnel-tools/published-url
 * Body: { subDomainName, pathName, scheme?, domain? }
 * Same URL shape as funnel-steps preview links.
 */
export async function POST(req: NextRequest) {
  const denied = assertFunnelToolsAllowed(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { subDomainName, pathName, scheme, domain } = body ?? {};

    if (!subDomainName || !pathName) {
      return NextResponse.json(
        { error: "subDomainName and pathName are required" },
        { status: 400 }
      );
    }

    const url = buildPublishedFunnelPageUrl({
      subDomainName: String(subDomainName),
      pathName: String(pathName),
      scheme: scheme != null ? String(scheme) : undefined,
      domain: domain != null ? String(domain) : undefined,
    });

    return NextResponse.json({
      url,
      normalizedScheme: normalizeScheme(
        scheme != null ? String(scheme) : undefined
      ),
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

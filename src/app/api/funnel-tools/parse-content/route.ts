import { NextRequest, NextResponse } from "next/server";

import {
  countEditorElements,
  findEditorElementById,
  parseEditorPageContent,
} from "@/lib/funnel-editor-json-tools";
import { assertFunnelToolsAllowed } from "@/lib/funnel-tools-guard";

/**
 * POST /api/funnel-tools/parse-content
 * Body: { content: string | null, findId?: string }
 * Validates / summarises editor JSON (funnel page content column).
 */
export async function POST(req: NextRequest) {
  const denied = assertFunnelToolsAllowed(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { content, findId } = body ?? {};

    const elements = parseEditorPageContent(
      content === null || content === undefined ? null : String(content)
    );
    const root = elements[0];
    const summary = {
      rootId: root?.id ?? null,
      rootType: root?.type ?? null,
      elementCount: countEditorElements(elements),
      bodyChildCount: Array.isArray(root?.content) ? root.content.length : 0,
    };

    let found: unknown = null;
    if (findId && typeof findId === "string") {
      found = findEditorElementById(elements, findId);
    }

    return NextResponse.json({
      summary,
      ...(findId ? { findId, found } : {}),
      elements,
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

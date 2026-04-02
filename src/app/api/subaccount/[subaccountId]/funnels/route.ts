import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { v4 } from "uuid";

import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildPublishedFunnelPageUrl } from "@/lib/funnel-url";
import { getFunnelBaseDomain } from "@/lib/subdomain";
import { upsertFunnel } from "@/queries/funnels";
import { FunnelDetailsValidator } from "@/queries/validators";

async function jsonUserFromBearer(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      ),
    };
  }
  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    return {
      error: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    include: { Permissions: true },
  });
  if (!user) {
    return {
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }
  return { user };
}

function assertSubaccountAccess(
  user: { role: Role; Permissions: { access: boolean; subAccountId: string }[] },
  subaccountId: string
): NextResponse | null {
  if (user.role === Role.SUBACCOUNT_GUEST) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const allowed = user.Permissions?.some(
    (p) => p.access && p.subAccountId === subaccountId
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

type RouteCtx = { params: Promise<{ subaccountId: string }> };

/**
 * GET /api/subaccount/:subaccountId/funnels
 * Bearer JWT — same access rules as subaccount layout (Permissions + not GUEST).
 */
export async function GET(req: NextRequest, context: RouteCtx) {
  const { subaccountId } = await context.params;
  if (!subaccountId) {
    return NextResponse.json({ error: "subaccountId required" }, { status: 400 });
  }

  const auth = await jsonUserFromBearer(req);
  if ("error" in auth) return auth.error;

  const denied = assertSubaccountAccess(auth.user, subaccountId);
  if (denied) return denied;

  const sub = await db.subAccount.findUnique({ where: { id: subaccountId } });
  if (!sub) {
    return NextResponse.json({ error: "Subaccount not found" }, { status: 404 });
  }

  const funnels = await db.funnel.findMany({
    where: { subAccountId: subaccountId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      subDomainName: true,
      favicon: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { funnelPages: true } },
    },
  });

  const domain = getFunnelBaseDomain();

  const enriched = funnels.map((f) => ({
    ...f,
    publishedBaseUrl:
      f.subDomainName != null && f.subDomainName.length > 0
        ? buildPublishedFunnelPageUrl({
            subDomainName: f.subDomainName,
            pathName: "",
            scheme: process.env.NEXT_PUBLIC_SCHEME,
            domain,
          }).replace(/\/$/, "")
        : null,
  }));

  return NextResponse.json({ funnels: enriched }, { status: 200 });
}

/**
 * POST /api/subaccount/:subaccountId/funnels
 * Body: { name, subDomainName, description?, favicon? } — same shape as dashboard **FunnelDetails** (Zod-validated).
 */
export async function POST(req: NextRequest, context: RouteCtx) {
  const { subaccountId } = await context.params;
  if (!subaccountId) {
    return NextResponse.json({ error: "subaccountId required" }, { status: 400 });
  }

  const auth = await jsonUserFromBearer(req);
  if ("error" in auth) return auth.error;

  const denied = assertSubaccountAccess(auth.user, subaccountId);
  if (denied) return denied;

  const sub = await db.subAccount.findUnique({ where: { id: subaccountId } });
  if (!sub) {
    return NextResponse.json({ error: "Subaccount not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = FunnelDetailsValidator.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.entries(first)
      .map(([k, v]) => (v?.length ? `${k}: ${v[0]}` : ""))
      .filter(Boolean)
      .join("; ");
    return NextResponse.json(
      { error: msg || "Validation failed", details: first },
      { status: 400 }
    );
  }

  const values = parsed.data;
  const funnelId = v4();

  try {
    const funnel = await upsertFunnel(
      subaccountId,
      {
        name: values.name,
        description: values.description ?? "",
        subDomainName: values.subDomainName,
        favicon: values.favicon ?? "",
        liveProducts: "[]",
      },
      funnelId
    );

    revalidatePath(`/subaccount/${subaccountId}/funnels`);

    const domain = getFunnelBaseDomain();
    const publishedBaseUrl = buildPublishedFunnelPageUrl({
      subDomainName: funnel.subDomainName ?? values.subDomainName,
      pathName: "",
      scheme: process.env.NEXT_PUBLIC_SCHEME,
      domain,
    }).replace(/\/$/, "");

    console.log(`[subdomain] API: funnel created — ${publishedBaseUrl}`);

    return NextResponse.json(
      {
        funnel: {
          id: funnel.id,
          name: funnel.name,
          description: funnel.description,
          subDomainName: funnel.subDomainName,
          favicon: funnel.favicon,
          published: funnel.published,
          createdAt: funnel.createdAt,
          updatedAt: funnel.updatedAt,
          publishedBaseUrl,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create funnel";
    if (message.includes("already taken")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    console.error("POST /api/subaccount/.../funnels:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDefaultAgencySidebarOptions } from "@/lib/agency-default-sidebar";
import { Role } from "@prisma/client";

function requireBearer(req: NextRequest): { token: string } | NextResponse {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authorization token required" }, { status: 401 });
  }
  return { token: authHeader.slice(7) };
}

function parseWhiteLabel(v: unknown): boolean {
  if (v === true || v === "true" || v === "on" || v === "1") return true;
  if (v === false || v === "false" || v === "off" || v === "0") return false;
  return true;
}

function readLogoField(v: FormDataEntryValue | null): string | NextResponse {
  if (v == null) return "";
  if (typeof v === "object" && "arrayBuffer" in v) {
    return NextResponse.json(
      {
        error:
          "agencyLogo must be a text URL. Upload in the app first, or use a placeholder URL in the form field.",
      },
      { status: 400 }
    );
  }
  return String(v).trim();
}

/**
 * POST /api/agency
 * Create an agency for the JWT user (same flow as agency settings form).
 * Content-Type: multipart/form-data or application/x-www-form-urlencoded or application/json
 */
export async function POST(req: NextRequest) {
  const bearer = requireBearer(req);
  if (bearer instanceof NextResponse) return bearer;

  const payload = verifyToken(bearer.token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.email.toLowerCase() !== payload.email.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.agencyId) {
    return NextResponse.json(
      { error: "User already belongs to an agency", agencyId: user.agencyId },
      { status: 409 }
    );
  }

  const contentType = req.headers.get("content-type") || "";

  let name: string;
  let companyEmail: string;
  let companyPhone: string;
  let address: string;
  let city: string;
  let state: string;
  let zipCode: string;
  let country: string;
  let agencyLogo: string | NextResponse;
  let whiteLabel: boolean;
  let goal: number;
  let agencyId: string;

  try {
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as Record<string, unknown>;
      name = String(body.name ?? "").trim();
      companyEmail = String(body.companyEmail ?? "").trim().toLowerCase();
      companyPhone = String(body.companyPhone ?? "").trim();
      address = String(body.address ?? "").trim();
      city = String(body.city ?? "").trim();
      state = String(body.state ?? "").trim();
      zipCode = String(body.zipCode ?? "").trim();
      country = String(body.country ?? "").trim();
      agencyLogo = String(body.agencyLogo ?? "").trim();
      whiteLabel = parseWhiteLabel(body.whiteLabel);
      goal = Number(body.goal);
      agencyId = String(body.id ?? "").trim() || randomUUID();
    } else {
      const fd = await req.formData();
      name = String(fd.get("name") ?? "").trim();
      companyEmail = String(fd.get("companyEmail") ?? "").trim().toLowerCase();
      companyPhone = String(fd.get("companyPhone") ?? "").trim();
      address = String(fd.get("address") ?? "").trim();
      city = String(fd.get("city") ?? "").trim();
      state = String(fd.get("state") ?? "").trim();
      zipCode = String(fd.get("zipCode") ?? "").trim();
      country = String(fd.get("country") ?? "").trim();
      const logo = readLogoField(fd.get("agencyLogo"));
      if (logo instanceof NextResponse) return logo;
      agencyLogo = logo;
      whiteLabel = parseWhiteLabel(fd.get("whiteLabel"));
      const goalRaw = fd.get("goal");
      goal = goalRaw != null && String(goalRaw).trim() !== "" ? Number(goalRaw) : 5;
      const idRaw = fd.get("id");
      agencyId = idRaw != null && String(idRaw).trim() !== "" ? String(idRaw).trim() : randomUUID();
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (agencyLogo instanceof NextResponse) return agencyLogo;

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "name is required (min 2 chars)" }, { status: 400 });
  }
  if (!companyEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
    return NextResponse.json({ error: "Valid companyEmail is required" }, { status: 400 });
  }
  if (!companyPhone || companyPhone.length < 10) {
    return NextResponse.json({ error: "companyPhone is required (min 10 chars)" }, { status: 400 });
  }
  if (!address || address.length < 10) {
    return NextResponse.json({ error: "address is required (min 10 chars)" }, { status: 400 });
  }
  if (!city || city.length < 2) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }
  if (!state || state.length < 2) {
    return NextResponse.json({ error: "state is required" }, { status: 400 });
  }
  if (!zipCode || zipCode.length < 5) {
    return NextResponse.json({ error: "zipCode is required (min 5 chars)" }, { status: 400 });
  }
  if (!country || country.length < 2) {
    return NextResponse.json({ error: "country is required" }, { status: 400 });
  }
  if (!agencyLogo) {
    return NextResponse.json(
      { error: "agencyLogo is required (URL string, e.g. https://api.dicebear.com/7.x/initials/svg?seed=Agency)" },
      { status: 400 }
    );
  }
  if (Number.isNaN(goal) || goal < 0) {
    goal = 5;
  }

  const existingId = await db.agency.findUnique({ where: { id: agencyId } });
  if (existingId) {
    return NextResponse.json({ error: "Agency id already exists; omit id to auto-generate" }, { status: 400 });
  }

  try {
    const agency = await db.agency.create({
      data: {
        id: agencyId,
        name,
        agencyLogo,
        companyEmail,
        companyPhone,
        whiteLabel,
        address,
        city,
        state,
        zipCode,
        country,
        goal,
        connectAccountId: "",
        customerId: "",
        users: { connect: { id: user.id } },
        SidebarOptions: {
          create: getDefaultAgencySidebarOptions(agencyId),
        },
      },
    });

    await db.user.update({
      where: { id: user.id },
      data: { agencyId: agency.id, role: Role.AGENCY_OWNER },
    });

    return NextResponse.json(
      {
        message: "Agency created",
        agency: {
          id: agency.id,
          name: agency.name,
          companyEmail: agency.companyEmail,
          companyPhone: agency.companyPhone,
          address: agency.address,
          city: agency.city,
          state: agency.state,
          zipCode: agency.zipCode,
          country: agency.country,
          whiteLabel: agency.whiteLabel,
          goal: agency.goal,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/agency]", e);
    return NextResponse.json({ error: "Failed to create agency" }, { status: 500 });
  }
}

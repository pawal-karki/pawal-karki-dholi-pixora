import { NextRequest, NextResponse } from "next/server";
import { canCreateSubAccount, canInviteTeamMember } from "@/lib/plan-limits";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get("agencyId");
    const type = searchParams.get("type"); // 'subaccount' or 'team'

    if (!agencyId) {
      return NextResponse.json(
        { error: "Agency ID is required" },
        { status: 400 }
      );
    }

    if (!type || !["subaccount", "team"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'subaccount' or 'team'" },
        { status: 400 }
      );
    }

    let result;
    if (type === "subaccount") {
      result = await canCreateSubAccount(agencyId);
    } else {
      result = await canInviteTeamMember(agencyId);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Plan limits error:", error);
    return NextResponse.json(
      { error: "Failed to check plan limits" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const subAccountId = searchParams.get("subAccountId");

        if (!subAccountId) {
            return NextResponse.json(
                { error: "SubAccount ID is required" },
                { status: 400 }
            );
        }

        const media = await db.media.findMany({
            where: { subAccountId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ media });
    } catch (error) {
        console.error("Error fetching media:", error);
        return NextResponse.json(
            { error: "Failed to fetch media" },
            { status: 500 }
        );
    }
}

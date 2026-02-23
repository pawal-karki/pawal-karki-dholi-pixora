import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');

        let media = [];
        if (projectId) {
            const funnel = await db.funnel.findUnique({
                where: { id: projectId }
            });
            if (funnel) {
                media = await db.media.findMany({
                    where: { subAccountId: funnel.subAccountId },
                    orderBy: { createdAt: "desc" }
                });
            }
        } else {
            return new NextResponse("Project ID required", { status: 400 });
        }

        // Return array of strings matching GrapesJS Asset Manager simple format
        return NextResponse.json({ data: media.map(m => m.link) });
    } catch (error) {
        console.error("[ASSETS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

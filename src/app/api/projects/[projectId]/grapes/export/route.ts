import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const body = await req.json();

        const project = await db.funnel.update({
            where: { id: projectId },
            data: {
                grapesExport: JSON.stringify(body),
            } as any,
        });
        return NextResponse.json({ success: true, project });
    } catch (error) {
        console.error("[PROJECT_GRAPES_EXPORT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

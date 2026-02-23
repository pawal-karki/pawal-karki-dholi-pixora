import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const body = await req.json();
        const { grapesProjectJson, editorVersion } = body;

        const project = await db.funnel.update({
            where: { id: projectId },
            data: {
                grapesProjectJson: grapesProjectJson,
                editorVersion: editorVersion,
            } as any,
        });
        return NextResponse.json(project);
    } catch (error) {
        console.error("[PROJECT_GRAPES_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

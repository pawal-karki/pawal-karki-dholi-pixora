import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const project = await db.funnel.findUnique({
            where: { id: projectId },
        });
        if (!project) return new NextResponse("Not Found", { status: 404 });
        return NextResponse.json(project);
    } catch (error) {
        console.error("[PROJECT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

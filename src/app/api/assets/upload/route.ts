import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
    try {
        const data = await req.formData();
        let actualFile: File | null = null;

        for (const [key, value] of Array.from(data.entries())) {
            if (typeof value === 'object' && value !== null && 'arrayBuffer' in value) {
                actualFile = value as unknown as File;
                break;
            }
        }

        if (!actualFile) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await actualFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadsDir = join(process.cwd(), 'public/uploads');
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (e) { }

        const filename = `${Date.now()}-${actualFile.name.replace(/\s/g, '_')}`;
        const path = join(uploadsDir, filename);
        await writeFile(path, buffer);

        const url = `/uploads/${filename}`;

        const projectId = data.get('projectId') as string;
        if (projectId) {
            const funnel = await db.funnel.findUnique({ where: { id: projectId } });
            if (funnel) {
                // Save to DB so it appears in the media library later
                await db.media.create({
                    data: {
                        name: actualFile.name,
                        link: url,
                        subAccountId: funnel.subAccountId,
                    }
                });
            }
        }

        // GrapesJS Asset Manager expects { data: [ 'url1' ] }
        return NextResponse.json({ data: [url] });
    } catch (error) {
        console.error("[ASSETS_UPLOAD_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

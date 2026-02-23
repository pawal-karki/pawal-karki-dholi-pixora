import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import BetaEditorClient from "./_components/BetaEditorClient";

export default async function BetaEditorPage(
    props: { params: Promise<{ projectId: string }> }
) {
    // Check feature flag
    if (process.env.BETA_EDITOR_ENABLED !== "true") {
        // Hidden if not enabled
        notFound();
    }

    const { projectId } = await props.params;

    // Validate the project exists
    const project = await db.funnel.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        return notFound();
    }

    return (
        <div className="w-full h-screen overflow-hidden">
            <BetaEditorClient projectId={projectId} />
        </div>
    );
}

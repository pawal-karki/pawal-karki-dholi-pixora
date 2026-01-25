import React from "react";
import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/utils";
import { getFunnelPageDetails } from "@/lib/queries";

import EditorProvider from "@/providers/editor/editor-provider";
import FunnelEditorNavigation from "@/components/modules/editor/FunnelEditorNavigation";
import FunnelEditor from "@/components/modules/editor/FunnelEditor";
import FunnelEditorLeftSidebar from "@/components/modules/editor/FunnelEditorLeftSidebar";
import FunnelEditorRightSidebar from "@/components/modules/editor/FunnelEditorRightSidebar";

type Props = {
    params: Promise<{
        subaccountId: string;
        funnelId: string;
        funnelPageId: string;
    }>
};

const FunnelIdEditorPage = async ({
    params,
}: Props) => {
    const { funnelId, funnelPageId, subaccountId } = await params;

    if (!subaccountId) redirect("/subaccount/unauthorized");
    if (!funnelId || !funnelPageId) {
        redirect(`/subaccount/${subaccountId}/funnels`);
    }

    const funnelPageDetails = await getFunnelPageDetails(funnelPageId);

    if (!funnelPageDetails) {
        redirect(`/subaccount/${subaccountId}/funnels/${funnelId}`);
    }

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
            <EditorProvider
                subAccountId={subaccountId}
                funnelId={funnelId}
                pageDetails={funnelPageDetails}
            >
                <div className="flex h-full w-full flex-col">
                    <FunnelEditorNavigation
                        funnelId={funnelId}
                        funnelPageDetails={funnelPageDetails}
                        subAccountId={subaccountId}
                    />
                    <FunnelEditorLeftSidebar />
                    <FunnelEditorRightSidebar subAccountId={subaccountId} />
                    <div className="relative flex-1 overflow-auto bg-muted/40 md:pl-80 md:pr-80">
                        <div className="relative flex min-h-full w-full items-start justify-center px-4 py-6">
                            <FunnelEditor
                                funnelPageId={funnelPageId}
                                funnelPageDetails={funnelPageDetails}
                                className="border border-border/60 shadow-lg rounded-2xl"
                            />
                        </div>
                    </div>
                </div>
            </EditorProvider>
        </div>
    );
};

export default FunnelIdEditorPage;

export const metadata = constructMetadata({
    title: "Editor - Pixora",
});

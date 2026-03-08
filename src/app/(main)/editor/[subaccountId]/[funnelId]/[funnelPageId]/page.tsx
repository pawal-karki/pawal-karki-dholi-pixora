import React from "react";
import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/utils";
import { getFunnelPageDetails, getSubAccountDetails } from "@/lib/queries";
import {
    getFirstCreatedSubAccountId,
    isSubscriptionRequiredForSubaccountAccess,
} from "@/lib/plan-limits";

import EditorProvider from "@/providers/editor/editor-provider";
import FunnelEditorNavigation from "@/components/modules/editor/FunnelEditorNavigation";
import FunnelEditorLeftSidebar from "@/components/modules/editor/FunnelEditorLeftSidebar";
import FunnelEditorRightSidebar from "@/components/modules/editor/FunnelEditorRightSidebar";
import FunnelEditor from "@/components/modules/editor/FunnelEditor";

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

    const subAccountDetails = await getSubAccountDetails(subaccountId);
    if (!subAccountDetails) {
        redirect("/subaccount/unauthorized");
    }

    const subscriptionRequired = await isSubscriptionRequiredForSubaccountAccess(
        subAccountDetails.agencyId,
        subaccountId
    );
    if (subscriptionRequired) {
        const firstSubAccountId = await getFirstCreatedSubAccountId(
            subAccountDetails.agencyId
        );
        if (firstSubAccountId && firstSubAccountId !== subaccountId) {
            redirect(`/subaccount/${firstSubAccountId}?plan_downgraded=true`);
        }
        redirect(`/agency/${subAccountDetails.agencyId}/billing?subscription_required=true`);
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
                <FunnelEditorNavigation
                    funnelId={funnelId}
                    funnelPageDetails={funnelPageDetails}
                    subAccountId={subaccountId}
                />
                <FunnelEditorLeftSidebar />
                <FunnelEditor
                    funnelPageId={funnelPageId}
                    funnelPageDetails={funnelPageDetails}
                />
                <FunnelEditorRightSidebar
                    subAccountId={subaccountId}
                />
            </EditorProvider>
        </div>
    );
};

export default FunnelIdEditorPage;

export const metadata = constructMetadata({
    title: "Editor - Pixora",
});

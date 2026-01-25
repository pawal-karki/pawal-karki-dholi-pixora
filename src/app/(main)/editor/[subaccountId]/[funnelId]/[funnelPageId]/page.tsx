import React from "react";
import { redirect } from "next/navigation";
import { constructMetadata } from "@/lib/utils";
import EasyblocksEditorClient from "@/components/easyblocks/EasyblocksEditorClient";

type Props = {
    params: Promise<{
        subaccountId: string;
        funnelId: string;
        funnelPageId: string;
    }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FunnelIdEditorPage = async ({
    params,
    searchParams,
}: Props) => {
    const { funnelId, funnelPageId, subaccountId } = await params;
    const resolvedSearchParams = await searchParams;

    if (!subaccountId) redirect("/subaccount/unauthorized");
    if (!funnelId || !funnelPageId) {
        redirect(`/subaccount/${subaccountId}/funnels`);
    }

    const paramsBuilder = new URLSearchParams();
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
        if (typeof value === "string") {
            paramsBuilder.set(key, value);
        } else if (Array.isArray(value)) {
            value.forEach((entry) => paramsBuilder.append(key, entry));
        }
    }

    let shouldRedirect = false;

    if (!paramsBuilder.get("rootComponent") && !paramsBuilder.get("rootTemplate")) {
        paramsBuilder.set("rootComponent", "Page");
        shouldRedirect = true;
    }
    if (!paramsBuilder.get("readOnly")) {
        paramsBuilder.set("readOnly", "false");
        shouldRedirect = true;
    }
    if (!paramsBuilder.get("locale")) {
        paramsBuilder.set("locale", "en-US");
        shouldRedirect = true;
    }

    const redirectUrl = `/editor/${subaccountId}/${funnelId}/${funnelPageId}?${paramsBuilder.toString()}`;
    if (shouldRedirect) {
        redirect(redirectUrl);
    }

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
            <EasyblocksEditorClient />
        </div>
    );
};

export default FunnelIdEditorPage;

export const metadata = constructMetadata({
    title: "Editor - Pixora",
});

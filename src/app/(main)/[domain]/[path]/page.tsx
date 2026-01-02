import React from "react";
import { notFound } from "next/navigation";

import { getDomainContent, updateFunnelPageVisits } from "@/lib/queries";
import EditorProvider from "@/providers/editor/editor-provider";
import FunnelEditor from "@/components/modules/editor/FunnelEditor";

interface DomainPathPageProps {
    params: Promise<{
        domain: string;
        path: string;
    }>;
}

const DomainPathPage: React.FC<DomainPathPageProps> = async ({ params }) => {
    const { domain, path } = await params;

    if (!domain || !path) notFound();

    // Middleware might leave a trailing dot, so we remove it if present.
    const domainName = domain.endsWith('.') ? domain.slice(0, -1) : domain;

    const domainData = await getDomainContent(domainName);

    if (!domainData) notFound();

    // Find the page matching the path
    const pageData = domainData.funnelPages.find((page) => page.pathName === path);

    if (!pageData) notFound();

    await updateFunnelPageVisits(pageData.id);

    return (
        <EditorProvider
            subAccountId={domainData.subAccountId}
            pageDetails={pageData}
            funnelId={domainData.id}
        >
            <FunnelEditor
                funnelPageId={pageData.id}
                funnelPageDetails={pageData}
                liveMode
            />
        </EditorProvider>
    );
};

export default DomainPathPage;

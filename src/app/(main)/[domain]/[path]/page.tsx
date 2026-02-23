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

export const dynamic = "force-dynamic";

const DomainPathPage: React.FC<DomainPathPageProps> = async ({ params }) => {
    const { domain, path } = await params;

    if (!domain || !path) notFound();

    // Middleware might leave a trailing dot, so we remove it if present.
    const domainName = domain.endsWith('.') ? domain.slice(0, -1) : domain;

    const domainData = await getDomainContent(domainName);

    if (!domainData) notFound();

    // Check if beta editor is enabled, and try to render grapesjs export
    if (process.env.BETA_EDITOR_ENABLED === "true" && domainData.grapesExport) {
        try {
            const exportedPages = JSON.parse(domainData.grapesExport);
            if (Array.isArray(exportedPages)) {
                // Determine if there is a matching page (e.g path === "about")
                // GrapesJS pages might have path or name, we'll match by name standardized to kebab-case
                const matchingPage = exportedPages.find((p: any) => p.name?.toLowerCase().replace(/\s+/g, '-') === path.toLowerCase());
                if (matchingPage) {
                    return (
                        <>
                            <style dangerouslySetInnerHTML={{ __html: matchingPage.css }} />
                            <div dangerouslySetInnerHTML={{ __html: matchingPage.html }} />
                        </>
                    );
                }
            }
        } catch (err) {
            console.error("Error parsing grapesExport:", err);
        }
    }

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

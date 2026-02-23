import React from "react";
import { notFound } from "next/navigation";

import { getDomainContent, updateFunnelPageVisits } from "@/lib/queries";
import EditorProvider from "@/providers/editor/editor-provider";
import FunnelEditor from "@/components/modules/editor/FunnelEditor";

interface DomainPageProps {
  params: Promise<{
    domain: string;
  }>;
}

export const dynamic = "force-dynamic";

const DomainPage: React.FC<DomainPageProps> = async ({ params }) => {
  try {
    const { domain } = await params;

    if (!domain) {
      notFound();
      return;
    }

    // Middleware might leave a trailing dot, so we remove it if present.
    const domainName = domain.endsWith('.') ? domain.slice(0, -1) : domain;

    // Clean the domain name (remove any invalid characters)
    const cleanDomainName = domainName.trim().toLowerCase();

    if (!cleanDomainName) {
      notFound();
      return;
    }

    const domainData = await getDomainContent(cleanDomainName);

    if (!domainData) {
      notFound();
      return;
    }

    // Check if beta editor is enabled, and try to render grapesjs export
    if (process.env.BETA_EDITOR_ENABLED === "true" && domainData.grapesExport) {
      try {
        const exportedPages = JSON.parse(domainData.grapesExport);
        if (Array.isArray(exportedPages) && exportedPages.length > 0) {
          // Find "Home" page or default to the first page
          const homePageParams = exportedPages.find((p: any) => p.name?.toLowerCase() === "home") || exportedPages[0];
          if (homePageParams) {
            return (
              <>
                <style dangerouslySetInnerHTML={{ __html: homePageParams.css }} />
                <div dangerouslySetInnerHTML={{ __html: homePageParams.html }} />
              </>
            );
          }
        }
      } catch (err) {
        console.error("Error parsing grapesExport:", err);
        // Fallback to legacy editor
      }
    }

    // For the root page, we find the page with no pathName (empty string or null)
    const pageData = domainData.funnelPages.find((page) => !page.pathName || page.pathName === "");

    if (!pageData) {
      notFound();
      return;
    }

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
  } catch (error) {
    console.error("Error loading domain page:", error);
    notFound();
  }
};

export default DomainPage;

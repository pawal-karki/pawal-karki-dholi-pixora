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

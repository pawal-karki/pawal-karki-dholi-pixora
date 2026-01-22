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
  const { domain } = await params;

  if (!domain) notFound();

  // Middleware might leave a trailing dot, so we remove it if present.
  const domainName = domain.endsWith('.') ? domain.slice(0, -1) : domain;

  const domainData = await getDomainContent(domainName);

  if (!domainData) notFound();

  // For the root page, we find the page with no pathName (empty string or null)
  // Actually, typical implementation stores pathName as empty string for home?
  // Or maybe '/'?
  // The reference code used `!page.pathName`.
  const pageData = domainData.funnelPages.find((page) => !page.pathName || page.pathName === "");

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

export default DomainPage;

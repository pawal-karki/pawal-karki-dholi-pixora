"use client";

import React, { useEffect, useState, use } from "react";
import { getMedia } from "@/lib/queries";
import { type GetMediaFiles } from "@/lib/types";
import Media from "@/components/modules/media/Media";

interface MediaPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const MediaPage: React.FC<MediaPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const subaccountId = resolvedParams.subaccountId;
  const [data, setData] = useState<GetMediaFiles | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!subaccountId) return;
      const response = await getMedia(subaccountId);
      setData(response);
    };

    fetchMedia();
  }, [subaccountId]);

  if (!subaccountId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Invalid subaccount</p>
      </div>
    );
  }

  return (
    <Media
      data={data}
      subAccountId={subaccountId}
      headerClassName="p-6 md:flex-row md:items-center md:justify-between"
    />
  );
};

export default MediaPage;

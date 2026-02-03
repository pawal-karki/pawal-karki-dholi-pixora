'use client';

import React from "react";

import { getMedia } from "@/lib/queries";

import { useModal } from "@/hooks/use-modal";
import Media from "@/components/modules/media/Media";
import { type GetMediaFiles } from "@/lib/types";

interface MediaTabProps {
  subAccountId: string;
}

const MediaTab: React.FC<MediaTabProps> = ({ subAccountId }) => {
  const [data, setData] = React.useState<GetMediaFiles | null>(null);
  const { data: modalData } = useModal(); // only for updating media data

  React.useEffect(() => {
    const fetchMedia = async () => {
      const response = await getMedia(subAccountId);

      setData(response);
    };

    fetchMedia();
  }, [subAccountId, modalData]);

  return (
    <div className="min-h-[900px] overflow-auto p-4">
      <Media
        data={data}
        subAccountId={subAccountId}
        headerClassName="flex flex-col gap-2 text-xl"
        editorMode={true}
      />
    </div>
  );
};

export default MediaTab;

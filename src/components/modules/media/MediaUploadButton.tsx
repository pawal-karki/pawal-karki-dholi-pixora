"use client";

import React from "react";
import { Upload } from "lucide-react";

import { useModal } from "@/hooks/use-modal";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/global/custom-modal";
import UploadMediaForm from "@/components/forms/upload-media";

interface MediaUploadButtonProps {
  subAccountId: string;
}

const MediaUploadButton: React.FC<MediaUploadButtonProps> = ({
  subAccountId,
}) => {
  const { isOpen, setOpen, setClose } = useModal();

  return (
    <Button
      onClick={() =>
        setOpen(
          <CustomModal
            title="Upload Media"
            subTitle="Upload a file to your media bucket here."
          >
            <UploadMediaForm subAccountId={subAccountId} />
          </CustomModal>
        )
      }
      className="inline-flex items-center gap-2"
    >
      <Upload className="w-4 h-4" />
      Upload media
    </Button>
  );
};

export default MediaUploadButton;

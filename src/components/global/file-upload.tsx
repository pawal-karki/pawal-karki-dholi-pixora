"use client";

import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { UploadDropzone } from "@/lib/uploadthing";

type Props = {
  apiEndpoint: "agencyLogo" | "avatar" | "subaccountLogo";
  onChange: (url?: string) => void;
  value?: string;
};

const FileUpload = ({ apiEndpoint, onChange, value }: Props) => {
  const type = value?.split(".").pop()?.toLowerCase();

  if (value) {
    return (
      <div className="flex flex-col justify-center items-center">
        {type === "pdf" ? (
          <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
            <FileIcon />
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-sm text-emerald-500 dark:text-emerald-400 hover:underline"
            >
              View PDF
            </a>
          </div>
        ) : type === "svg" ? (
          // SVG files - use img tag for better compatibility
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="uploaded image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          // Regular images - use Next.js Image
          <div className="relative w-40 h-40">
            <Image
              src={value}
              alt="uploaded image"
              className="object-contain"
              fill
              unoptimized
            />
          </div>
        )}
        <Button onClick={() => onChange("")} variant="ghost" type="button">
          <X className="h-4 w-4" />
          Remove Logo
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-muted/30 uploadthing-wrapper">
      <UploadDropzone
        endpoint={apiEndpoint}
        onClientUploadComplete={(res) => {
          onChange(res?.[0].url);
        }}
        onUploadError={(error: Error) => {
          console.log(error);
        }}
      />
    </div>
  );
};

export default FileUpload;

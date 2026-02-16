"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X, FileIcon, Upload, CheckCircle } from "lucide-react";
import Image from "next/image";

import { createMedia, saveActivityLogsNotification } from "@/lib/queries";
import { useModal } from "@/hooks/use-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadDropzone } from "@/lib/uploadthing";

interface UploadMediaFormProps {
  subAccountId: string;
  onSuccess?: () => void;
}

const UploadMediaForm: React.FC<UploadMediaFormProps> = ({ subAccountId, onSuccess }) => {
  const router = useRouter();
  const { setClose } = useModal();

  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!name.trim()) {
      toast.error("Missing file name", {
        description: "Please enter a name for your media file",
      });
      return;
    }

    if (!link) {
      toast.error("Missing media file", {
        description: "Please upload a media file first",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createMedia(subAccountId, {
        name: name.trim(),
        link: link,
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Uploaded a media file | ${response.name}`,
        subaccountId: response.subAccountId,
      });

      setClose();
      toast.success("Success", {
        description: "Media file uploaded successfully",
      });

      // Call success callback to refresh parent's media list
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Create media error:", error);
      toast.error("Failed", {
        description: "Could not save media to database",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
    setLink("");
  };

  const getFileType = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) return "image";
    return "other";
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle>Media Information</CardTitle>
        <CardDescription>
          Please enter the details for your file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="file-name">File name</Label>
            <Input
              id="file-name"
              placeholder="Enter a name for your file"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Media File */}
          <div className="space-y-2">
            <Label>Media file</Label>

            {link ? (
              // Show uploaded file preview
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/30">
                {getFileType(link) === "image" ? (
                  <div className="relative w-40 h-40 mb-2">
                    <Image
                      src={link}
                      alt="Uploaded file"
                      fill
                      className="object-contain rounded-md"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-md mb-2">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">File uploaded</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Upload complete</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove File
                </Button>
              </div>
            ) : (
              // Show upload dropzone
              <div className="w-full">
                <UploadDropzone
                  endpoint="media"
                  onClientUploadComplete={(res) => {
                    console.log("Upload complete:", res);
                    if (res && res.length > 0 && res[0].url) {
                      setLink(res[0].url);
                      toast.success("File uploaded", {
                        description: "Your file has been uploaded successfully",
                      });
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error("Upload error:", error);
                    setUploadError(error.message);
                    toast.error("Upload failed", {
                      description: error.message,
                    });
                  }}
                  onUploadBegin={() => {
                    setUploadError(null);
                  }}
                />
                {uploadError && (
                  <p className="text-sm text-destructive mt-2">{uploadError}</p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !link || !name.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Save Media
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadMediaForm;

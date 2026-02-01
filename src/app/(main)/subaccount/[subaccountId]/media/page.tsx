"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  FolderOpen,
  Search,
  Grid3X3,
  List,
  ImageIcon,
  FileText,
  Video,
  Music,
  MoreHorizontal,
  Download,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { type Media } from "@prisma/client";

import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import CustomModal from "@/components/global/custom-modal";
import UploadMediaForm from "@/components/forms/upload-media";

import { deleteMedia } from "@/queries/media";
import { saveActivityLogsNotification } from "@/queries/notifications";

interface MediaPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const getFileType = (url: string): "image" | "video" | "audio" | "document" => {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "audio";
  return "document";
};

const getFileIcon = (type: "image" | "video" | "audio" | "document") => {
  switch (type) {
    case "image": return ImageIcon;
    case "video": return Video;
    case "audio": return Music;
    default: return FileText;
  }
};

const MediaPage: React.FC<MediaPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const subaccountId = resolvedParams.subaccountId;

  const router = useRouter();
  const { setOpen, setClose } = useModal();

  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch media function - can be called to refresh
  const fetchMedia = async () => {
    if (!subaccountId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/media?subAccountId=${subaccountId}`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
      toast.error("Failed to load media files");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch media on mount
  useEffect(() => {
    fetchMedia();
  }, [subaccountId]);

  // Filter media based on search
  const filteredMedia = media.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const handleDelete = async (file: Media) => {
    setDeletingId(file.id);
    try {
      const response = await deleteMedia(file.id);

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a media file | ${response?.name}`,
        subAccountId: file.subAccountId,
      });

      setMedia((prev) => prev.filter((m) => m.id !== file.id));
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  const openUploadModal = () => {
    if (!subaccountId) return;

    setOpen(
      <CustomModal
        title="Upload Media"
        subTitle="Upload files to your media bucket for use in funnels and campaigns."
      >
        <UploadMediaForm subAccountId={subaccountId} onSuccess={fetchMedia} />
      </CustomModal>
    );
  };

  // Refresh when modal closes (after upload)
  useEffect(() => {
    const handleRefresh = () => {
      if (!subaccountId) return;

      fetch(`/api/media?subAccountId=${subaccountId}`)
        .then((res) => res.json())
        .then((data) => setMedia(data.media || []))
        .catch(console.error);
    };

    // Listen for route changes to refresh
    window.addEventListener("focus", handleRefresh);
    return () => window.removeEventListener("focus", handleRefresh);
  }, [subaccountId]);

  if (!subaccountId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Invalid subaccount</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Bucket</h1>
          <p className="text-muted-foreground mt-1">
            Manage your media files for funnels and campaigns
          </p>
        </div>
        <Button onClick={openUploadModal} className="w-fit">
          <Upload className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      <Separator />

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {filteredMedia.length} {filteredMedia.length === 1 ? "file" : "files"}
          </Badge>
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={cn(
          viewMode === "grid"
            ? "grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "flex flex-col gap-2"
        )}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className={cn(
              "overflow-hidden",
              viewMode === "list" && "flex items-center"
            )}>
              <Skeleton className={cn(
                viewMode === "grid" ? "h-40 w-full" : "h-16 w-16 rounded-none"
              )} />
              <div className={cn(
                "p-3 space-y-2",
                viewMode === "list" && "flex-1"
              )}>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {searchQuery ? "No files found" : "No media files yet"}
            </h3>
            <p className="text-muted-foreground text-sm text-center mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Upload your first file to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={openUploadModal}>
                <Plus className="w-4 h-4 mr-2" />
                Upload your first file
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredMedia.map((file) => {
            const fileType = getFileType(file.link);
            const FileIcon = getFileIcon(fileType);

            return (
              <Card
                key={file.id}
                className={cn(
                  "overflow-hidden group transition-all hover:shadow-lg hover:border-primary/20",
                  deletingId === file.id && "opacity-50 pointer-events-none"
                )}
              >
                <div className="relative h-40 bg-muted">
                  {fileType === "image" ? (
                    <Image
                      src={file.link}
                      alt={file.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileIcon className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9"
                      asChild
                    >
                      <a href={file.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9"
                      onClick={() => handleCopyLink(file.link)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9"
                      asChild
                    >
                      <a href={file.link} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  {/* Type badge */}
                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 text-xs capitalize"
                  >
                    {fileType}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-medium text-sm truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(file.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopyLink(file.link)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={file.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in new tab
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={file.link} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete file?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{file.name}&quot;. Any funnels or pages
                            using this file will no longer display it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(file)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredMedia.map((file) => {
            const fileType = getFileType(file.link);
            const FileIcon = getFileIcon(fileType);

            return (
              <Card
                key={file.id}
                className={cn(
                  "overflow-hidden hover:shadow-md transition-shadow",
                  deletingId === file.id && "opacity-50 pointer-events-none"
                )}
              >
                <div className="flex items-center p-3 gap-4">
                  {/* Thumbnail */}
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {fileType === "image" ? (
                      <Image
                        src={file.link}
                        alt={file.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileIcon className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs capitalize">
                        {fileType}
                      </Badge>
                      <span>•</span>
                      <span>{format(new Date(file.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyLink(file.link)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a href={file.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete file?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{file.name}&quot;. Any funnels or pages
                            using this file will no longer display it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(file)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaPage;

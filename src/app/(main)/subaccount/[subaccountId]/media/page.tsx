import React from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Copy, ExternalLink } from "lucide-react";
import { format } from "date-fns";

import { getSubAccountDetails } from "@/lib/queries";
import { db } from "@/lib/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaPageProps {
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const MediaPage: React.FC<MediaPageProps> = async ({ params }) => {
  const { subaccountId } = await params;

  if (!subaccountId) redirect("/subaccount/unauthorized");

  const subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  // Get media files for this subaccount
  const media = await db.media.findMany({
    where: { subAccountId: subaccountId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your media files for funnels and campaigns
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload Media
        </Button>
      </div>
      <Separator />

      {media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No media files yet</p>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Upload your first file
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((file) => (
            <Card key={file.id} className="overflow-hidden group">
              <div className="relative h-40 bg-muted">
                {file.type?.startsWith("image") ? (
                  <Image
                    src={file.link}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-4xl">📄</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" asChild>
                    <a href={file.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => navigator.clipboard.writeText(file.link)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(file.createdAt), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaPage;


import React from "react";
import { redirect } from "next/navigation";
import { Plus, Settings } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PipelinePageProps {
  params: Promise<{
    subaccountId: string | undefined;
    pipelineId: string | undefined;
  }>;
}

const PipelinePage: React.FC<PipelinePageProps> = async ({ params }) => {
  const { subaccountId, pipelineId } = await params;

  if (!subaccountId || !pipelineId) redirect("/subaccount/unauthorized");

  const subAccountDetails = await getSubAccountDetails(subaccountId);

  if (!subAccountDetails) redirect("/subaccount/unauthorized");

  // Get pipeline with lanes and tickets
  const pipeline = await db.pipeline.findUnique({
    where: { id: pipelineId },
    include: {
      lanes: {
        include: {
          tickets: {
            include: {
              tags: true,
              assigned: true,
              customer: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!pipeline) redirect(`/subaccount/${subaccountId}/pipelines`);

  // Get all pipelines for tabs
  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{pipeline.name}</h1>
          <p className="text-muted-foreground">
            Manage your leads and deals through this pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Lane
          </Button>
        </div>
      </div>
      <Separator />

      {/* Pipeline Tabs */}
      <Tabs defaultValue={pipelineId} className="w-full">
        <TabsList>
          {pipelines.map((p) => (
            <TabsTrigger key={p.id} value={p.id} asChild>
              <a href={`/subaccount/${subaccountId}/pipelines/${p.id}`}>
                {p.name}
              </a>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipeline.lanes.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No lanes in this pipeline</p>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create your first lane
              </Button>
            </CardContent>
          </Card>
        ) : (
          pipeline.lanes.map((lane) => (
            <div
              key={lane.id}
              className="flex-shrink-0 w-[300px] bg-muted/50 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{lane.name}</h3>
                <Badge variant="secondary">{lane.tickets.length}</Badge>
              </div>
              <div className="flex flex-col gap-2">
                {lane.tickets.map((ticket) => (
                  <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{ticket.name}</CardTitle>
                      {ticket.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {ticket.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {(ticket.tags.length > 0 || ticket.value) && (
                      <CardContent className="p-3 pt-0">
                        <div className="flex flex-wrap gap-1">
                          {ticket.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              style={{ backgroundColor: tag.color }}
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                        {ticket.value && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ${ticket.value.toLocaleString()}
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
                <Button variant="ghost" className="w-full mt-2" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ticket
                </Button>
              </div>
            </div>
          ))
        )}
        {pipeline.lanes.length > 0 && (
          <div className="flex-shrink-0 w-[300px] flex items-start">
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Lane
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelinePage;


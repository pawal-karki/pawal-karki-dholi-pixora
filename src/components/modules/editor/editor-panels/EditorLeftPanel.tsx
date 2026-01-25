"use client";

import React from "react";
import { PlusCircle, SquareStack } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import ComponentsTab from "../editor-tabs/components-tab/ComponentsTab";
import LayersTab from "../editor-tabs/LayersTab";

import { cn } from "@/lib/utils";

type TabsName = "Components" | "Layers";

interface EditorLeftPanelProps {
  className?: string;
}

const EditorLeftPanel: React.FC<EditorLeftPanelProps> = ({ className }) => {
  const [activeTab, setActiveTab] = React.useState<TabsName>("Components");

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex h-full w-full flex-col bg-background", className)}>
        <div className="border-b bg-muted/20 px-4 py-3">
          <Tabs
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabsName)}
          >
            <TabsList className="grid w-full grid-cols-2 h-10 p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="Components"
                    className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Components
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Drag & drop components</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="Layers"
                    className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <SquareStack className="w-4 h-4 mr-2" />
                    Layers
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View page structure</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {activeTab === "Components" && <ComponentsTab />}
              {activeTab === "Layers" && <LayersTab />}
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EditorLeftPanel;

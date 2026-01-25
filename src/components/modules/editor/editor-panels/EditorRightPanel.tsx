"use client";

import React from "react";
import { Database, Palette, Settings } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import SettingsTab from "../editor-tabs/SettingsTab";
import MediaTab from "../editor-tabs/MediaTab";
import StylesTab from "../editor-tabs/StylesTab";

import { cn } from "@/lib/utils";

type TabsName = "Settings" | "Styles" | "Media";

interface EditorRightPanelProps {
  subAccountId: string;
  className?: string;
}

const EditorRightPanel: React.FC<EditorRightPanelProps> = ({
  subAccountId,
  className,
}) => {
  const [activeTab, setActiveTab] = React.useState<TabsName>("Settings");

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex h-full w-full flex-col bg-background", className)}>
        <div className="border-b bg-muted/20 px-4 py-3">
          <Tabs
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabsName)}
          >
            <TabsList className="grid w-full grid-cols-3 h-10 p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="Settings"
                    className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Element properties</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="Styles"
                    className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Styles
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Global styles</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="Media"
                    className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Media
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Media library</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {activeTab === "Settings" && <SettingsTab />}
              {activeTab === "Styles" && <StylesTab />}
              {activeTab === "Media" && <MediaTab subAccountId={subAccountId} />}
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EditorRightPanel;

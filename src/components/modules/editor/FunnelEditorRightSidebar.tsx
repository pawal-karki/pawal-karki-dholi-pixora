"use client";

import React from "react";
import { Database, Settings } from "lucide-react";

import { useEditor } from "@/hooks/use-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import SettingsTab from "./editor-tabs/SettingsTab";
import MediaTab from "./editor-tabs/MediaTab";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FunnelEditorRightSidebarProps {
    subAccountId: string;
}

type TabsName = "Settings" | "Media";

const FunnelEditorRightSidebar: React.FC<FunnelEditorRightSidebarProps> = ({
    subAccountId,
}) => {
    const { editor } = useEditor();
    const [activeTab, setActiveTab] = React.useState<TabsName>("Settings");

    return (
        <TooltipProvider delayDuration={300}>
            <div
                className={cn(
                    "fixed right-0 top-[101px] bottom-0 w-80 bg-background border-l z-[40] transition-all duration-300",
                    {
                        "translate-x-full": editor.editor.previewMode,
                    }
                )}
            >
                <Tabs
                    className="w-full h-full flex flex-col"
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as TabsName)}
                >
                    <div className="border-b bg-muted/10 px-4 py-3">
                        <TabsList className="grid w-full grid-cols-2 h-10 p-1">
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
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <TabsContent value="Settings" className="m-0 p-4 mt-0">
                                <SettingsTab />
                            </TabsContent>
                            <TabsContent value="Media" className="m-0 p-4 mt-0">
                                <MediaTab subAccountId={subAccountId} />
                            </TabsContent>
                        </ScrollArea>
                    </div>
                </Tabs>
            </div>
        </TooltipProvider >
    );
};

export default FunnelEditorRightSidebar;

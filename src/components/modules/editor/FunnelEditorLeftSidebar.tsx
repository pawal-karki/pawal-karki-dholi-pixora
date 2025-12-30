"use client";

import React from "react";
import { PlusCircle, SquareStack } from "lucide-react";

import { useEditor } from "@/hooks/use-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import ComponentsTab from "./editor-tabs/components-tab/ComponentsTab";
import LayersTab from "./editor-tabs/LayersTab";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

type TabsName = "Components" | "Layers";

const FunnelEditorLeftSidebar: React.FC = () => {
    const { editor } = useEditor();
    const [activeTab, setActiveTab] = React.useState<TabsName>("Components");

    return (
        <TooltipProvider delayDuration={300}>
            <div
                className={cn(
                    "fixed left-0 top-[101px] bottom-0 w-80 bg-background border-r z-[40] transition-all duration-300",
                    {
                        "-translate-x-full": editor.editor.previewMode,
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
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <TabsContent value="Components" className="m-0 p-4 mt-0">
                                <ComponentsTab />
                            </TabsContent>
                            <TabsContent value="Layers" className="m-0 p-4 mt-0">
                                <LayersTab />
                            </TabsContent>
                        </ScrollArea>
                    </div>
                </Tabs>
            </div>
        </TooltipProvider>
    );
};

export default FunnelEditorLeftSidebar;

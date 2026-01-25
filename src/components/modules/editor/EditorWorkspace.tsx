"use client";

import React from "react";
import {
  Database,
  Layers,
  Palette,
  PlusCircle,
  Settings,
} from "lucide-react";
import { type FunnelPage } from "@prisma/client";

import { useEditor } from "@/hooks/use-editor";
import FunnelEditorNavigation from "./FunnelEditorNavigation";
import FunnelEditor from "./FunnelEditor";
import EditorLeftPanel from "./editor-panels/EditorLeftPanel";
import EditorRightPanel from "./editor-panels/EditorRightPanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ComponentsTab from "./editor-tabs/components-tab/ComponentsTab";
import LayersTab from "./editor-tabs/LayersTab";
import SettingsTab from "./editor-tabs/SettingsTab";
import StylesTab from "./editor-tabs/StylesTab";
import MediaTab from "./editor-tabs/MediaTab";

import { cn } from "@/lib/utils";

type MobileTab = "components" | "layers" | "settings" | "styles" | "media";

interface EditorWorkspaceProps {
  funnelId: string;
  funnelPageId: string;
  funnelPageDetails: FunnelPage;
  subAccountId: string;
}

const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  funnelId,
  funnelPageId,
  funnelPageDetails,
  subAccountId,
}) => {
  const { editor } = useEditor();
  const [mobilePanelOpen, setMobilePanelOpen] = React.useState(false);
  const [mobileTab, setMobileTab] = React.useState<MobileTab>("components");

  const hidePanels = editor.editor.previewMode || editor.editor.liveMode;

  React.useEffect(() => {
    if (hidePanels) {
      setMobilePanelOpen(false);
    }
  }, [hidePanels]);

  const openMobilePanel = (tab: MobileTab) => {
    setMobileTab(tab);
    setMobilePanelOpen(true);
  };

  const canvas = (
    <div className="relative flex h-full w-full min-w-0 items-center justify-center overflow-auto bg-muted/40">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] opacity-40 [background-size:24px_24px]" />
      <div className={cn("relative flex h-full w-full min-w-0 items-start justify-center p-4 md:p-6", {
        "p-0": hidePanels,
      })}>
        <FunnelEditor
          funnelPageId={funnelPageId}
          funnelPageDetails={funnelPageDetails}
          className={cn(
            "border border-border/60 shadow-lg rounded-2xl",
            {
              "border-0 shadow-none rounded-none": hidePanels,
            }
          )}
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <FunnelEditorNavigation
        funnelId={funnelId}
        funnelPageDetails={funnelPageDetails}
        subAccountId={subAccountId}
        onOpenLeftPanel={() => openMobilePanel("components")}
        onOpenRightPanel={() => openMobilePanel("settings")}
      />

      <div className="flex-1 min-h-0">
        {hidePanels ? (
          canvas
        ) : (
          <div className="hidden md:flex h-full">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel
                defaultSize={20}
                minSize={16}
                maxSize={28}
                className="border-r"
              >
                <EditorLeftPanel />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={60} minSize={40} className="min-w-0">
                {canvas}
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={20}
                minSize={16}
                maxSize={28}
                className="border-l"
              >
                <EditorRightPanel subAccountId={subAccountId} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        )}

        {!hidePanels && <div className="md:hidden h-full">{canvas}</div>}
      </div>

      {!hidePanels && (
        <div className="md:hidden fixed bottom-4 left-1/2 z-[60] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/90 px-3 py-2 shadow-lg backdrop-blur">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => openMobilePanel("components")}
              aria-label="Components"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => openMobilePanel("layers")}
              aria-label="Layers"
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => openMobilePanel("settings")}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => openMobilePanel("styles")}
              aria-label="Styles"
            >
              <Palette className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => openMobilePanel("media")}
              aria-label="Media"
            >
              <Database className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Sheet open={mobilePanelOpen} onOpenChange={setMobilePanelOpen}>
        <SheetContent side="bottom" className="h-[75vh] p-0">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle className="text-base font-semibold">Editor Panels</SheetTitle>
          </SheetHeader>
          <Tabs
            value={mobileTab}
            onValueChange={(value) => setMobileTab(value as MobileTab)}
            className="h-[calc(75vh-60px)]"
          >
            <TabsList className="grid grid-cols-5 gap-2 px-4 py-3">
              <TabsTrigger value="components" className="text-xs">
                Components
              </TabsTrigger>
              <TabsTrigger value="layers" className="text-xs">
                Layers
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                Settings
              </TabsTrigger>
              <TabsTrigger value="styles" className="text-xs">
                Styles
              </TabsTrigger>
              <TabsTrigger value="media" className="text-xs">
                Media
              </TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[calc(75vh-120px)] px-4 pb-6">
              <TabsContent value="components" className="m-0 pt-4">
                <ComponentsTab />
              </TabsContent>
              <TabsContent value="layers" className="m-0 pt-4">
                <LayersTab />
              </TabsContent>
              <TabsContent value="settings" className="m-0 pt-4">
                <SettingsTab />
              </TabsContent>
              <TabsContent value="styles" className="m-0 pt-4">
                <StylesTab />
              </TabsContent>
              <TabsContent value="media" className="m-0 pt-4">
                <MediaTab subAccountId={subAccountId} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EditorWorkspace;

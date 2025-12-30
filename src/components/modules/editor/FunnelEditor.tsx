"use client";

import React from "react";
import { EyeOff } from "lucide-react";
import { type FunnelPage } from "@prisma/client";

import EditorRecursive from "./editor-elements/EditorRecursive";

import { useEditor } from "@/hooks/use-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FunnelEditorProps {
  funnelPageId: string;
  liveMode?: boolean;
  funnelPageDetails: FunnelPage;
}

const FunnelEditor: React.FC<FunnelEditorProps> = ({
  funnelPageId,
  liveMode,
  funnelPageDetails,
}) => {
  const { editor, dispatch } = useEditor();

  React.useEffect(() => {
    if (liveMode) {
      dispatch({
        type: "TOGGLE_LIVE_MODE",
        payload: { value: true },
      });
    }
  }, [liveMode]);

  React.useEffect(() => {
    if (!funnelPageDetails) return undefined;

    dispatch({
      type: "LOAD_DATA",
      payload: {
        elements: funnelPageDetails.content
          ? JSON.parse(funnelPageDetails.content)
          : "",
        withLive: !!liveMode,
      },
    });
  }, [funnelPageId]);

  const handleClickElement = () => {
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {},
    });
  };

  const handlePreview = () => {
    dispatch({ type: "TOGGLE_LIVE_MODE" });
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
  };

  const { globalStyles } = editor.editor;

  const cssVars = {
    "--primary": globalStyles?.colors?.primary || "#000000",
    "--secondary": globalStyles?.colors?.secondary || "#ffffff",
    "--background": globalStyles?.colors?.background || "#ffffff",
    "--text": globalStyles?.colors?.text || "#000000",
  } as React.CSSProperties;

  return (
    <div
      style={cssVars}
      className={cn(
        "h-screen overflow-y-hidden overflow-x-hidden ml-[320px] mr-[320px] z-[999999] bg-white scrollbar scrollbar-thumb-muted-foreground/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-medium transition-all duration-300",
        {
          "ml-0 mr-0 p-0": editor.editor.previewMode || editor.editor.liveMode,
          "!w-[850px] mx-auto": editor.editor.device === "Tablet" && !editor.editor.previewMode,
          "!w-[420px] mx-auto": editor.editor.device === "Mobile" && !editor.editor.previewMode,
          "pb-[100px] use-automation-zoom-in": !editor.editor.previewMode && !editor.editor.liveMode,
        }
      )}
      onClick={handleClickElement}
    >
      {editor.editor.previewMode && editor.editor.liveMode && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-[100]"
          onClick={handlePreview}
          title="Back to editor"
        >
          <EyeOff aria-label="Back to editor" className="w-4 h-4" />
        </Button>
      )}

      {Array.isArray(editor.editor.elements) &&
        editor.editor.elements.map((element) => (
          <EditorRecursive key={element.id} element={element} />
        ))}
    </div>
  );
};

export default FunnelEditor;

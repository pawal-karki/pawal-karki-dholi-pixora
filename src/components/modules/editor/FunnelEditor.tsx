"use client";

import React from "react";
import { EyeOff } from "lucide-react";
import { type FunnelPage } from "@prisma/client";

import EditorRecursive from "./editor-elements/EditorRecursive";

import { useEditor } from "@/hooks/use-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeEditorElements } from "@/lib/editor/normalize-elements";

interface FunnelEditorProps {
  funnelPageId: string;
  liveMode?: boolean;
  funnelPageDetails: FunnelPage;
  className?: string;
}

const FunnelEditor: React.FC<FunnelEditorProps> = ({
  funnelPageId,
  liveMode,
  funnelPageDetails,
  className,
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

    const parsedElements = funnelPageDetails.content
      ? JSON.parse(funnelPageDetails.content)
      : "";

    const normalizedElements = Array.isArray(parsedElements)
      ? normalizeEditorElements(parsedElements)
      : parsedElements;

    dispatch({
      type: "LOAD_DATA",
      payload: {
        elements: normalizedElements,
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
  const isEditor = !editor.editor.previewMode && !editor.editor.liveMode;

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
        isEditor
          ? "relative min-h-full w-full bg-white transition-all duration-300"
          : "w-full",
        {
          "max-w-[850px] w-full mx-auto":
            isEditor && editor.editor.device === "Tablet",
          "max-w-[420px] w-full mx-auto":
            isEditor && editor.editor.device === "Mobile",
          "pb-16 use-automation-zoom-in": isEditor,
        },
        isEditor && className
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

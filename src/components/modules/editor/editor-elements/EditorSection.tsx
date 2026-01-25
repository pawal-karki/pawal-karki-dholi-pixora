"use client";

import React from "react";

import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";
import EditorRecursive from "./EditorRecursive";

import { cn } from "@/lib/utils";
import { type EditorElement } from "@/lib/types/editor";
import { Trash } from "lucide-react";
import type { EditorBtns } from "@/lib/types/editor";
import { addVerifyElement } from "@/lib/editor/add-verify-element";
import { getDraggedElementId, setDraggedElement } from "@/lib/editor/dnd";

interface EditorSectionProps {
  element: EditorElement;
}

const EditorSection: React.FC<EditorSectionProps> = ({ element }) => {
  const { content, type } = element;
  const { editor: editorState, dispatch } = useEditor();
  const { editor } = editorState;
  const isEditor = !editor.liveMode && !editor.previewMode;

  const appliedStyles: React.CSSProperties = {
    ...(element.styles || {}),
  };

  if (type === "section" && appliedStyles.width === undefined) {
    appliedStyles.width = "100%";
  }

  const handleOnDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (editor.liveMode || editor.previewMode) {
      return;
    }

    const draggedElementId = getDraggedElementId(event);
    if (draggedElementId) {
      if (draggedElementId !== element.id) {
        dispatch({
          type: "MOVE_ELEMENT",
          payload: {
            elementId: draggedElementId,
            targetContainerId: element.id,
          },
        });
      }
      return;
    }

    const componentType = event.dataTransfer.getData(
      "componentType"
    ) as EditorBtns;

    if (!componentType) {
      return;
    }

    addVerifyElement(componentType, element.id, dispatch, editor.device);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDragStart = (event: React.DragEvent) => {
    if (editor.liveMode || editor.previewMode) {
      event.preventDefault();
      return;
    }

    event.stopPropagation();
    setDraggedElement(event, element.id);
  };

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  return (
    <section
      style={appliedStyles}
      draggable={!editor.liveMode && !editor.previewMode}
      className={cn(isEditor && "relative p-4 transition-all", {
        "h-fit": isEditor && type === "container",
        "h-full": isEditor && type === "__body",
        "m-4": isEditor && type === "container",
        "border-blue-500": isEditor && editor.selectedElement.id === element.id,
        "border-solid": isEditor && editor.selectedElement.id === element.id,
        "border-dashed border": isEditor,
      })}
      id="innerContainer"
      onDragOver={handleDragOver}
      onDrop={handleOnDrop}
      onDragStart={handleDragStart}
      onClick={handleOnClickBody}
    >
      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg bg-emerald-500 text-white">
          {editor.selectedElement.name}
        </Badge>
      )}

      {Array.isArray(content) &&
        content.map((childElement) => (
          <EditorRecursive key={childElement.id} element={childElement} />
        ))}

      {editor.selectedElement.id === element.id &&
        !editor.liveMode &&
        editor.selectedElement.type !== "__body" && (
          <div className="absolute bg-emerald-500 px-2.5 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
            <Trash
              className="cursor-pointer w-4 h-4"
              onClick={handleDeleteElement}
            />
          </div>
        )}
    </section>
  );
};

export default EditorSection;

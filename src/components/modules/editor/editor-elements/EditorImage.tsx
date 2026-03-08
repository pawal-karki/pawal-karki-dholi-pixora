/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Image from "next/image";
import { Trash } from "lucide-react";

import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";

import { type EditorElement } from "@/lib/types/editor";
import { cn } from "@/lib/utils";

interface EditorImageProps {
  element: EditorElement;
}

const EditorImage: React.FC<EditorImageProps> = ({ element }) => {
  const { dispatch, editor: editorState } = useEditor();
  const { editor } = editorState;

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();

    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: element },
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (editor.liveMode) return;
    e.dataTransfer.setData("elementId", element.id);
    e.dataTransfer.setData("componentType", element.type || "");
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };

  return (
    <div
      style={element.styles}
      draggable={!editor.liveMode}
      onDragStart={handleDragStart}
      onClick={handleOnClickBody}
      className={cn(
        "relative p-0.5 min-w-12 min-h-7 flex items-center justify-center",
        element.className,
        {
          "border-blue-500 border-solid":
            editor.selectedElement.id === element.id,
          "border-dashed border": !editor.liveMode,
        },
      )}
    >
      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <Badge className="absolute -top-6 -left-0.5 rounded-none rounded-t-md bg-emerald-500 text-white">
          {editor.selectedElement.name}
        </Badge>
      )}
      {!Array.isArray(element.content) && element.content.src && (
        <img
          src={element.content.src}
          alt={element.content.alt as string}
          style={element.styles}
        />
      )}
      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <div className="absolute bg-emerald-500 px-2.5 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
          <Trash
            className="cursor-pointer"
            size={16}
            onClick={handleDeleteElement}
          />
        </div>
      )}
    </div>
  );
};

export default EditorImage;

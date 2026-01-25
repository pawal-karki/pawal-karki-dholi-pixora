/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Trash } from "lucide-react";

import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";

import { type EditorElement } from "@/lib/types/editor";
import { cn } from "@/lib/utils";
import { setDraggedElement } from "@/lib/editor/dnd";

interface EditorImageProps {
  element: EditorElement;
}

const EditorImage: React.FC<EditorImageProps> = ({ element }) => {
  const { dispatch, editor: editorState } = useEditor();
  const { editor } = editorState;
  const isEditor = !editor.liveMode && !editor.previewMode;

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

  const handleDragStart = (event: React.DragEvent) => {
    if (editor.liveMode || editor.previewMode) {
      event.preventDefault();
      return;
    }

    event.stopPropagation();
    setDraggedElement(event, element.id);
  };

  return (
    <div
      style={element.styles}
      draggable={!editor.liveMode && !editor.previewMode}
      onClick={handleOnClickBody}
      onDragStart={handleDragStart}
      className={cn(
        isEditor && "relative flex items-center justify-center",
        {
          "border-blue-500 border-solid":
            isEditor && editor.selectedElement.id === element.id,
          "border-dashed border": isEditor,
        }
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
          draggable={false}
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

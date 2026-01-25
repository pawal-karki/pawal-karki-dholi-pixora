import React from "react";
import { Trash } from "lucide-react";

import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";
import EditorRecursive from "./EditorRecursive";

import { cn } from "@/lib/utils";
import type { EditorBtns, EditorElement } from "@/lib/types/editor";
import { addVerifyElement } from "@/lib/editor/add-verify-element";
import { getDraggedElementId, setDraggedElement } from "@/lib/editor/dnd";

interface EditorContainerProps {
  element: EditorElement;
}

const EditorContainer: React.FC<EditorContainerProps> = ({ element }) => {
  const { content, id, styles, type } = element;
  const { dispatch, editor: editorState } = useEditor();
  const { editor } = editorState;
  const isEditor = !editor.liveMode && !editor.previewMode;

  const appliedStyles: React.CSSProperties = {
    ...(styles || {}),
  };

  if ((type === "container" || type === "2Col" || type === "3Col" || type === "__body") &&
    appliedStyles.width === undefined) {
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
      if (draggedElementId !== id) {
        dispatch({
          type: "MOVE_ELEMENT",
          payload: {
            elementId: draggedElementId,
            targetContainerId: id,
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

    addVerifyElement(componentType, id, dispatch, editor.device)
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDragStart = (event: React.DragEvent) => {
    if (editor.liveMode || editor.previewMode || type === "__body") {
      event.preventDefault();
      return;
    }

    event.stopPropagation();
    setDraggedElement(event, id);
  };

  const handleOnClickBody = (event: React.MouseEvent) => {
    event.stopPropagation();

    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  const handleDeleteElement = (event: React.MouseEvent) => {
    event.stopPropagation();

    dispatch({
      type: "DELETE_ELEMENT",
      payload: {
        elementDetails: element,
      },
    });
  };

  return (
    <div
      style={appliedStyles}
      draggable={!editor.liveMode && !editor.previewMode && type !== "__body"}
      className={cn(
        isEditor &&
        "relative p-4 transition-all group scrollbar scrollbar-thumb-muted-foreground/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-medium",
        {
          "h-fit": isEditor && type === "container",
          "min-h-full w-full overflow-x-hidden":
            isEditor && type === "__body",
          "!border-blue-500":
            isEditor &&
            editor.selectedElement.id === id &&
            editor.selectedElement.type !== "__body",
          "!border-yellow-400 border-4":
            isEditor &&
            editor.selectedElement.id === id &&
            editor.selectedElement.type === "__body",
          "!border-solid": isEditor && editor.selectedElement.id === id,
          "!border-dashed !border": isEditor,
        }
      )}
      onDragOver={handleDragOver}
      onDrop={handleOnDrop}
      onDragStart={handleDragStart}
      onClick={handleOnClickBody}
    >
      <Badge
        className={cn(
          "absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg bg-emerald-500 text-white hidden",
          {
            block: editor.selectedElement.id === element.id && !editor.liveMode,
          }
        )}
      >
        {element.name}
      </Badge>

      {Array.isArray(content) &&
        content.map((child) => (
          <EditorRecursive key={child.id} element={child} />
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
    </div>
  );
};

export default EditorContainer;

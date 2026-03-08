import React, { useRef, useState, useCallback } from "react";
import { Trash } from "lucide-react";

import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";
import EditorRecursive from "./EditorRecursive";

import { cn } from "@/lib/utils";
import type { EditorBtns, EditorElement } from "@/lib/types/editor";
import { addVerifyElement } from "@/lib/editor/add-verify-element";

interface EditorContainerProps {
  element: EditorElement;
}

const EditorContainer: React.FC<EditorContainerProps> = ({ element }) => {
  const { content, id, styles, type, name } = element;
  const { dispatch, editor: editorState } = useEditor();
  const { editor } = editorState;

  const containerRef = useRef<HTMLDivElement | HTMLButtonElement>(null);
  const [dropLine, setDropLine] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const dropIndexRef = useRef(0);

  const computeDrop = useCallback(
    (e: React.DragEvent) => {
      if (!containerRef.current || !Array.isArray(content))
        return { index: content?.length ?? 0, line: null };

      const containerRect = containerRef.current.getBoundingClientRect();
      const children = Array.from(containerRef.current.children).filter(
        (el) =>
          !(el as HTMLElement).dataset.editorUi &&
          !el.classList.contains("drop-line-indicator"),
      );

      const isHoriz =
        styles.display === "flex" &&
        styles.flexDirection !== "column" &&
        styles.flexDirection !== "column-reverse";

      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        const mid = isHoriz
          ? rect.left + rect.width / 2
          : rect.top + rect.height / 2;
        const cursor = isHoriz ? e.clientX : e.clientY;

        if (cursor < mid) {
          const line = isHoriz
            ? {
                top: rect.top - containerRect.top,
                left: rect.left - containerRect.left - 1,
                width: 2,
                height: rect.height,
              }
            : {
                top: rect.top - containerRect.top - 1,
                left: rect.left - containerRect.left,
                width: rect.width,
                height: 2,
              };
          return { index: i, line };
        }
      }

      if (children.length > 0) {
        const last = children[children.length - 1].getBoundingClientRect();
        const line = isHoriz
          ? {
              top: last.top - containerRect.top,
              left: last.right - containerRect.left + 1,
              width: 2,
              height: last.height,
            }
          : {
              top: last.bottom - containerRect.top + 1,
              left: last.left - containerRect.left,
              width: last.width,
              height: 2,
            };
        return { index: children.length, line };
      }

      return { index: 0, line: null };
    },
    [content, styles.display, styles.flexDirection],
  );

  const isLayoutDrag = (event: React.DragEvent) =>
    event.dataTransfer.types.includes("layout-component");

  const handleOnDrop = (event: React.DragEvent) => {
    if (isLayoutDrag(event) && type !== "__body") return;
    event.stopPropagation();
    event.preventDefault();
    setDropLine(null);

    const movedElementId = event.dataTransfer.getData("elementId");
    if (movedElementId && movedElementId !== id) {
      dispatch({
        type: "MOVE_ELEMENT",
        payload: {
          elementId: movedElementId,
          newContainerId: id,
          index: dropIndexRef.current,
        },
      });
      return;
    }

    const componentType = event.dataTransfer.getData(
      "componentType",
    ) as EditorBtns;
    const imageUrl = event.dataTransfer.getData("imageUrl");
    const imageName = event.dataTransfer.getData("imageName");
    const iconName = event.dataTransfer.getData("iconName");
    const extraData =
      imageUrl || iconName ? { imageUrl, imageName, iconName } : undefined;
    addVerifyElement(componentType, id, dispatch, editor.device, extraData);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (isLayoutDrag(event) && type !== "__body") {
      setDropLine(null);
      return;
    }
    event.stopPropagation();
    if (!editor.liveMode) {
      const { index, line } = computeDrop(event);
      dropIndexRef.current = index;
      setDropLine(line);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.relatedTarget as Node)
    ) {
      setDropLine(null);
    }
  };

  const isMobileMenuTrigger = name === "Mobile Menu Trigger";

  const handleOnClickBody = (event: React.MouseEvent) => {
    if (isMobileMenuTrigger) {
      event.stopPropagation();
      dispatch({ type: "TOGGLE_MOBILE_NAV" });
      return;
    }
    event.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: { elementDetails: element },
    });
  };

  const handleDeleteElement = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: element },
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (editor.liveMode || type === "__body") return;
    e.dataTransfer.setData("elementId", element.id);
    e.dataTransfer.setData("componentType", element.type || "");
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };

  const containerClassName = cn(
    "relative p-4 transition-all group scrollbar scrollbar-thumb-muted-foreground/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-medium",
    isMobileMenuTrigger &&
      "appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
    element.className,
    {
      "max-w-full w-full": type === "container" || type === "2Col",
      "h-fit": type === "container",
      "h-full w-full overflow-y-auto overflow-x-hidden": type === "__body",
      "flex flex-col md:!flex-row": type === "2Col",
      "!border-blue-500":
        editor.selectedElement.id === id &&
        !editor.liveMode &&
        editor.selectedElement.type !== "__body",
      "!border-yellow-400 border-4":
        editor.selectedElement.id === id &&
        !editor.liveMode &&
        editor.selectedElement.type === "__body",
      "!mb-[200px]":
        !editor.liveMode && !editor.previewMode && type === "__body",
      "!border-solid":
        editor.selectedElement.id === id && !editor.liveMode,
      "!border-dashed !border": !editor.liveMode,
    },
  );

  const containerContent = (
    <>
      <Badge
        data-editor-ui="true"
        className={cn(
          "absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg bg-emerald-500 text-white hidden",
          {
            block:
              editor.selectedElement.id === element.id && !editor.liveMode,
          },
        )}
      >
        {element.name}
      </Badge>

      {Array.isArray(content) &&
        content.map((child) => (
          <EditorRecursive key={child.id} element={child} />
        ))}

      {dropLine && (
        <div
          data-editor-ui="true"
          className="drop-line-indicator absolute bg-blue-500 rounded-full pointer-events-none z-50"
          style={{
            top: dropLine.top,
            left: dropLine.left,
            width: dropLine.width,
            height: dropLine.height,
          }}
        />
      )}

      {editor.selectedElement.id === element.id &&
        !editor.liveMode &&
        editor.selectedElement.type !== "__body" && (
          <div
            data-editor-ui="true"
            className="absolute bg-emerald-500 px-2.5 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white"
          >
            <Trash
              className="cursor-pointer w-4 h-4"
              onClick={handleDeleteElement}
            />
          </div>
        )}
    </>
  );

  if (isMobileMenuTrigger) {
    return (
      <button
        ref={containerRef as React.RefObject<HTMLButtonElement>}
        type="button"
        aria-label="Open navigation menu"
        style={styles}
        draggable={!editor.liveMode && type !== "__body"}
        onDragStart={handleDragStart}
        className={containerClassName}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleOnDrop}
        onClick={handleOnClickBody}
      >
        {containerContent}
      </button>
    );
  }

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      style={styles}
      draggable={!editor.liveMode && type !== "__body"}
      onDragStart={handleDragStart}
      className={containerClassName}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleOnDrop}
      onClick={handleOnClickBody}
    >
      {containerContent}
    </div>
  );
};

export default EditorContainer;

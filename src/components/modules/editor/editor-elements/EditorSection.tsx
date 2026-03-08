"use client";

import React, { useRef, useState, useCallback } from "react";

import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";
import EditorRecursive from "./EditorRecursive";

import { cn } from "@/lib/utils";
import { type EditorBtns, type EditorElement } from "@/lib/types/editor";
import { Trash } from "lucide-react";
import { addVerifyElement } from "@/lib/editor/add-verify-element";

interface EditorSectionProps {
  element: EditorElement;
}

const EditorSection: React.FC<EditorSectionProps> = ({ element }) => {
  const { content, type } = element;
  const { editor: editorState, dispatch } = useEditor();
  const { editor } = editorState;
  const sectionRef = useRef<HTMLElement>(null);
  const [dropLine, setDropLine] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const dropIndexRef = useRef(0);

  const computeDrop = useCallback(
    (e: React.DragEvent) => {
      if (!sectionRef.current || !Array.isArray(content))
        return { index: content?.length ?? 0, line: null };

      const containerRect = sectionRef.current.getBoundingClientRect();
      const children = Array.from(sectionRef.current.children).filter(
        (el) =>
          !(el as HTMLElement).dataset.editorUi &&
          !el.classList.contains("drop-line-indicator"),
      );

      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
          return {
            index: i,
            line: {
              top: rect.top - containerRect.top - 1,
              left: rect.left - containerRect.left,
              width: rect.width,
              height: 2,
            },
          };
        }
      }

      if (children.length > 0) {
        const last = children[children.length - 1].getBoundingClientRect();
        return {
          index: children.length,
          line: {
            top: last.bottom - containerRect.top + 1,
            left: last.left - containerRect.left,
            width: last.width,
            height: 2,
          },
        };
      }

      return { index: 0, line: null };
    },
    [content],
  );

  const isLayoutDrag = (event: React.DragEvent) =>
    event.dataTransfer.types.includes("layout-component");

  const handleOnDrop = (event: React.DragEvent) => {
    if (isLayoutDrag(event)) return;
    event.preventDefault();
    event.stopPropagation();
    setDropLine(null);

    const movedElementId = event.dataTransfer.getData("elementId");
    if (movedElementId && movedElementId !== element.id) {
      dispatch({
        type: "MOVE_ELEMENT",
        payload: {
          elementId: movedElementId,
          newContainerId: element.id,
          index: dropIndexRef.current,
        },
      });
      return;
    }

    const componentType = event.dataTransfer.getData(
      "componentType",
    ) as EditorBtns;
    if (!componentType) return;

    const imageUrl = event.dataTransfer.getData("imageUrl");
    const imageName = event.dataTransfer.getData("imageName");
    const iconName = event.dataTransfer.getData("iconName");
    const extraData =
      imageUrl || iconName ? { imageUrl, imageName, iconName } : undefined;

    addVerifyElement(
      componentType,
      element.id,
      dispatch,
      editor.device,
      extraData,
    );
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (isLayoutDrag(event)) {
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
      sectionRef.current &&
      !sectionRef.current.contains(event.relatedTarget as Node)
    ) {
      setDropLine(null);
    }
  };

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: element },
    });
  };

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: { elementDetails: element },
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (editor.liveMode) return;
    e.dataTransfer.setData("elementId", element.id);
    e.dataTransfer.setData("componentType", element.type || "");
    e.dataTransfer.setData("layout-component", "true");
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };

  return (
    <section
      ref={sectionRef}
      style={element.styles}
      draggable={!editor.liveMode}
      onDragStart={handleDragStart}
      className={cn("relative p-4 transition-all", element.className, {
        "h-fit": type === "container",
        "h-full": type === "__body",
        "m-4": type === "container",
        "border-blue-500":
          editor.selectedElement.id === element.id && !editor.liveMode,
        "border-solid":
          editor.selectedElement.id === element.id && !editor.liveMode,
        "border-dashed border": !editor.liveMode,
      })}
      id="innerContainer"
      onClick={handleOnClickBody}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleOnDrop}
    >
      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <Badge
          data-editor-ui="true"
          className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg bg-emerald-500 text-white"
        >
          {editor.selectedElement.name}
        </Badge>
      )}

      {Array.isArray(content) &&
        content.map((childElement) => (
          <EditorRecursive key={childElement.id} element={childElement} />
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
    </section>
  );
};

export default EditorSection;

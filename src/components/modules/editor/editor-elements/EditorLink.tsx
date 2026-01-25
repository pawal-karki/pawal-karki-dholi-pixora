"use client";

import React from "react";
import Link from "next/link";
import { Trash, Link2 } from "lucide-react";
import LinkPicker from "./LinkPicker";

import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";

import { type EditorElement } from "@/lib/types/editor";
import { formatTextOnKeyboard } from "@/lib/editor/utils";
import { cn } from "@/lib/utils";
import { setDraggedElement } from "@/lib/editor/dnd";

interface EditorLinkProps {
  element: EditorElement;
}

const EditorLink: React.FC<EditorLinkProps> = ({ element }) => {
  const { dispatch, editor: editorState } = useEditor();
  const { editor } = editorState;
  const [isEditing, setIsEditing] = React.useState(false);
  const spanRef = React.useRef<HTMLSpanElement | null>(null);
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

  const onKeyDown = (event: React.KeyboardEvent) => {
    formatTextOnKeyboard(event, editor, dispatch);
  };

  const handleDragStart = (event: React.DragEvent) => {
    if (editor.liveMode || editor.previewMode || isEditing) {
      event.preventDefault();
      return;
    }

    event.stopPropagation();
    setDraggedElement(event, element.id);
  };

  React.useEffect(() => {
    if (isEditing && spanRef.current) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(spanRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  return (
    <div
      style={element.styles}
      draggable={!editor.liveMode && !editor.previewMode && !isEditing}
      onClick={handleOnClickBody}
      onDragStart={handleDragStart}
      className={cn(
        isEditor && "relative transition-all underline-offset-4 cursor-pointer",
        {
          "!border-blue-500 !border-solid":
            isEditor && editor.selectedElement.id === element.id,
          "!border-dashed !border": isEditor,
        }
      )}
    >
      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <Badge className="absolute -top-6 -left-0.5 rounded-none rounded-t-md bg-emerald-500 text-white">
          {editor.selectedElement.name}
        </Badge>
      )}
      {!Array.isArray(element.content) &&
        (editor.previewMode || editor.liveMode) && (
          <Link href={element.content.href || "#"}>
            {element.content.innerText}
          </Link>
        )}
      {!editor.previewMode && !editor.liveMode && (
        <span
          ref={spanRef}
          contentEditable={!editor.liveMode && isEditing}
          suppressContentEditableWarning={true}
          className="outline-none"
          onDoubleClick={() => !editor.liveMode && setIsEditing(true)}
          onKeyDown={onKeyDown}
          onBlur={(e) => {
            setIsEditing(false);
            const spanElement = e.target as HTMLSpanElement;

            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                elementDetails: {
                  ...element,
                  content: {
                    innerText: spanElement.innerText,
                  },
                },
              },
            });
          }}
        >
          {!Array.isArray(element.content) && element.content.innerText}
        </span>
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
      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <div className="absolute bg-emerald-500 px-2.5 py-1 text-xs font-bold -top-[25px] right-[40px] rounded-none rounded-t-lg !text-white">
          <LinkPicker
            initialValue={(!Array.isArray(element.content) && element.content.href) || "#"}
            onSave={(href) => {
              dispatch({
                type: "UPDATE_ELEMENT",
                payload: {
                  elementDetails: {
                    ...element,
                    content: {
                      ...element.content,
                      href,
                    },
                  },
                },
              });
            }}
          >
            <Link2 className="cursor-pointer" size={16} />
          </LinkPicker>
        </div>
      )}
    </div>
  );
};

export default EditorLink;

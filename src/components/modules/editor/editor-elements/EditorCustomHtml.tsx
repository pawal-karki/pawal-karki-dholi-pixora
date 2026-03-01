"use client";

import React from "react";
import { Trash } from "lucide-react";
import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/lib/types/editor";

interface EditorCustomHtmlProps {
    element: EditorElement;
}

const EditorCustomHtml: React.FC<EditorCustomHtmlProps> = ({ element }) => {
    const { dispatch, editor: editorState } = useEditor();
    const { editor } = editorState;
    const { id, styles, name } = element;
    const isSelected = editor.selectedElement.id === id;
    const isLive = editor.liveMode || editor.previewMode;

    const content = !Array.isArray(element.content) ? element.content : {};
    const htmlContent = content.html || "<div></div>";
    const cssContent = content.css || "";

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({
            type: "CHANGE_CLICKED_ELEMENT",
            payload: { elementDetails: element },
        });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({
            type: "DELETE_ELEMENT",
            payload: { elementDetails: element },
        });
    };

    // Build a scoped style tag + markup inside a shadow-like wrapper
    const scopedId = `html-block-${id}`;
    const scopedCss = cssContent
        ? cssContent.replace(/([^{}]+){/g, (match: string) => {
            // Prefix each selector with the scoped id for isolation
            const selectors = match.replace("{", "").trim().split(",");
            return (
                selectors.map((s: string) => `#${scopedId} ${s.trim()}`).join(", ") +
                " {"
            );
        })
        : "";

    return (
        <div
            id={scopedId}
            style={styles}
            className={cn(
                "relative w-full group transition-all",
                {
                    "outline outline-2 outline-blue-500 outline-offset-1":
                        isSelected && !isLive && element.type !== "__body",
                    "outline-dashed outline-1 outline-gray-200 hover:outline-gray-400":
                        !isLive && !isSelected,
                }
            )}
            onClick={handleClick}
        >
            {!isLive && (
                <Badge
                    className={cn(
                        "absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg bg-violet-500 text-white hidden",
                        { block: isSelected }
                    )}
                >
                    {name}
                </Badge>
            )}

            {/* Inject scoped CSS */}
            {scopedCss && (
                <style
                    dangerouslySetInnerHTML={{ __html: scopedCss }}
                />
            )}

            {/* Render the raw HTML */}
            <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Delete button */}
            {isSelected && !isLive && (
                <div className="absolute bg-violet-500 px-2.5 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
                    <Trash
                        className="cursor-pointer w-4 h-4"
                        onClick={handleDelete}
                    />
                </div>
            )}
        </div>
    );
};

export default EditorCustomHtml;

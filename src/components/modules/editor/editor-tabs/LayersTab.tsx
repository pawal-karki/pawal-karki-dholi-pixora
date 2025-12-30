"use client";

import { useEditor } from "@/hooks/use-editor";
import { EditorElement } from "@/lib/types/editor";
import React from "react";
import EditorLayersTree from "../editor-layers/EditorLayersTree";

interface LayersTabProps { }

const LayersTab: React.FC<LayersTabProps> = () => {
    const { pageDetails, dispatch, editor } = useEditor();
    const [elements, setElements] = React.useState<EditorElement[]>(
        (JSON.parse(pageDetails?.content || "[]")[0]?.content as EditorElement[]) ||
        []
    );

    const handleSelectElement = (element: EditorElement | undefined) => {
        if (element) {
            dispatch({
                type: "CHANGE_CLICKED_ELEMENT",
                payload: {
                    elementDetails: element,
                },
            });
        }
    };

    React.useEffect(() => {
        if (editor.editor.elements.length) {
            setElements(editor.editor.elements);
        }
    }, [editor.editor.elements]);

    return (
        <div className="min-h-[400px] overflow-auto">
            <div className="mb-4">
                <h3 className="text-sm font-medium">Layers</h3>
                <p className="text-xs text-muted-foreground">
                    View the editor in a tree like structure.
                </p>
            </div>
            <EditorLayersTree
                data={elements}
                className="flex-shrink-0"
                onSelectChange={handleSelectElement}
            />
        </div>
    );
};

export default LayersTab;

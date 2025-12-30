import { EditorBtns } from "@/lib/types/editor";
import { CopyPlus } from "lucide-react";
import React from "react";

const ProductPlaceholder = () => {
    const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
        if (type === null) return;
        e.dataTransfer.setData("componentType", type);
    };

    return (
        <div
            draggable
            onDragStart={(e) => handleDragStart(e, "productGrid")}
            className="h-14 w-14 bg-muted/70 rounded-md p-2 flex items-center justify-center cursor-grab"
        >
            <CopyPlus className="text-muted-foreground w-10 h-10" />
        </div>
    );
};

export default ProductPlaceholder;

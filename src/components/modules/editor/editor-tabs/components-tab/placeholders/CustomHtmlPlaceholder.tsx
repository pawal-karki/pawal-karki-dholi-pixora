import React from "react";
import { useEditor } from "@/hooks/use-editor";
import { Code } from "lucide-react";

const CustomHtmlPlaceholder: React.FC = () => {
    const [, setDragOver] = React.useState(false);

    const handleDragStart = (event: React.DragEvent) => {
        event.dataTransfer.setData("componentType", "customHtml");
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onMouseEnter={() => setDragOver(true)}
            onMouseLeave={() => setDragOver(false)}
            className="h-14 w-14 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg p-2 flex items-center justify-center cursor-grab hover:bg-violet-100 dark:hover:bg-violet-900/40 hover:border-violet-400 hover:scale-105 transition-all duration-150 group"
        >
            <Code className="w-6 h-6 text-violet-500 group-hover:text-violet-600 dark:text-violet-400" />
        </div>
    );
};

export default CustomHtmlPlaceholder;

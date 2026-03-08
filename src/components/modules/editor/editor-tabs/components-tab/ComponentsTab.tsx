import React from "react";
import { Sparkles, Code, Shapes } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import {
    ELEMENT_LAYOUT_PLACEHOLDERS,
    ELEMENT_PRIMITIVE_PLACEHOLDERS,
    TEMPLATE_SECTION_PLACEHOLDERS,
} from "@/lib/editor/element-placeholders";

import HtmlTemplatesModal, {
    TEMPLATE_GALLERY_COUNT,
} from "@/components/modules/editor/HtmlTemplatesModal";
import IconPlaceholder from "./placeholders/IconPlaceholder";

interface ComponentsTabProps { }

const ComponentsTab: React.FC<ComponentsTabProps> = ({ }) => {
    const [showHtmlTemplates, setShowHtmlTemplates] = React.useState(false);

    return (
        <>
            {/* HTML Templates Modal */}
            {showHtmlTemplates && (
                <HtmlTemplatesModal onClose={() => setShowHtmlTemplates(false)} />
            )}

            <div className="mb-4">
                <h3 className="text-sm font-medium">Components</h3>
                <p className="text-xs text-muted-foreground">
                    Drag and drop components to the canvas.
                </p>
            </div>

            {/* HTML Templates Button */}
            <Button
                variant="outline"
                className="w-full mb-4 gap-2 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-400 rounded-xl h-10"
                onClick={() => setShowHtmlTemplates(true)}
            >
                <Code className="w-4 h-4" />
                Browse Template Gallery
                <span className="ml-auto bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {TEMPLATE_GALLERY_COUNT}
                </span>
            </Button>

            <Accordion
                type="multiple"
                className="w-full"
                defaultValue={["Templates", "Layout", "Elements", "Icons"]}
            >
                <AccordionItem value="Templates" className="py-0 border rounded-md mb-2">
                    <AccordionTrigger className="!no-underline px-3 py-2 text-sm hover:no-underline">
                        <span className="font-medium flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Smart Templates
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="grid grid-cols-3 gap-2 p-3 pt-0">
                        {TEMPLATE_SECTION_PLACEHOLDERS.map((template) => (
                            <div
                                key={template.id}
                                className="flex flex-col items-center justify-center text-center"
                            >
                                {template.placeholder}
                                <span className="mt-1 text-[10px] text-muted-foreground leading-tight">{template.label}</span>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="Layout" className="py-0 border rounded-md mb-2">
                    <AccordionTrigger className="!no-underline px-3 py-2 text-sm hover:no-underline">
                        Layout
                    </AccordionTrigger>
                    <AccordionContent className="grid grid-cols-3 gap-2 p-3 pt-0">
                        {ELEMENT_LAYOUT_PLACEHOLDERS.map((element) => (
                            <div
                                key={element.id}
                                className="flex flex-col items-center justify-center text-center"
                            >
                                {element.placeholder}
                                <span className="mt-1 text-[10px] text-muted-foreground leading-tight">{element.label}</span>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="Elements" className="py-0 border rounded-md mb-2">
                    <AccordionTrigger className="!no-underline px-3 py-2 text-sm hover:no-underline">
                        Elements
                    </AccordionTrigger>
                    <AccordionContent className="grid grid-cols-3 gap-2 p-3 pt-0">
                        {ELEMENT_PRIMITIVE_PLACEHOLDERS.map((element) => (
                            <div
                                key={element.id}
                                className="flex flex-col items-center justify-center text-center"
                            >
                                {element.placeholder}
                                <span className="mt-1 text-[10px] text-muted-foreground leading-tight">{element.label}</span>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="Icons" className="py-0 border rounded-md">
                    <AccordionTrigger className="!no-underline px-3 py-2 text-sm hover:no-underline">
                        <span className="font-medium flex items-center gap-1.5">
                            <Shapes className="w-3.5 h-3.5 text-violet-500" />
                            Icons
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="p-3 pt-0">
                        <IconPlaceholder />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
};

export default ComponentsTab;

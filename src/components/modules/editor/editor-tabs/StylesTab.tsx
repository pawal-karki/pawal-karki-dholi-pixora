"use client";

import React from "react";
import { useEditor } from "@/hooks/use-editor";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const StylesTab = () => {
    const { editor, dispatch } = useEditor();
    const { globalStyles } = editor.editor;

    const handleColorChange = (key: keyof typeof globalStyles.colors, value: string) => {
        dispatch({
            type: "UPDATE_GLOBAL_STYLES",
            payload: {
                globalStyles: {
                    ...globalStyles,
                    colors: {
                        ...globalStyles.colors,
                        [key]: value,
                    },
                },
            },
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="mb-2">
                <h3 className="text-sm font-medium">Global Styles</h3>
                <p className="text-xs text-muted-foreground">
                    Customize your site's design system.
                </p>
            </div>

            <Accordion type="multiple" className="w-full" defaultValue={["Colors"]}>
                <AccordionItem value="Colors" className="border-b-0">
                    <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline rounded-md hover:bg-muted">
                        Colors
                    </AccordionTrigger>
                    <AccordionContent className="p-3 pt-2 grid gap-4">
                        <div className="grid grid-cols-1 gap-2">
                            <Label className="text-xs">Primary Color</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={globalStyles.colors.primary}
                                    onChange={(e) => handleColorChange("primary", e.target.value)}
                                    className="p-1 h-8 w-8 block bg-white border border-gray-200 cursor-pointer rounded-sm disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700"
                                />
                                <Input
                                    value={globalStyles.colors.primary}
                                    onChange={(e) => handleColorChange("primary", e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label className="text-xs">Secondary Color</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={globalStyles.colors.secondary}
                                    onChange={(e) => handleColorChange("secondary", e.target.value)}
                                    className="p-1 h-8 w-8 block bg-white border border-gray-200 cursor-pointer rounded-sm disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700"
                                />
                                <Input
                                    value={globalStyles.colors.secondary}
                                    onChange={(e) => handleColorChange("secondary", e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label className="text-xs">Background Color</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={globalStyles.colors.background}
                                    onChange={(e) => handleColorChange("background", e.target.value)}
                                    className="p-1 h-8 w-8 block bg-white border border-gray-200 cursor-pointer rounded-sm disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700"
                                />
                                <Input
                                    value={globalStyles.colors.background}
                                    onChange={(e) => handleColorChange("background", e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Label className="text-xs">Text Color</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={globalStyles.colors.text}
                                    onChange={(e) => handleColorChange("text", e.target.value)}
                                    className="p-1 h-8 w-8 block bg-white border border-gray-200 cursor-pointer rounded-sm disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700"
                                />
                                <Input
                                    value={globalStyles.colors.text}
                                    onChange={(e) => handleColorChange("text", e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default StylesTab;

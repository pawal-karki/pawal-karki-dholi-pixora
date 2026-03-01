"use client";

import React from "react";
import { Code, Eye, Check, RefreshCw } from "lucide-react";
import { useEditor } from "@/hooks/use-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const CodeEditorPanel: React.FC = () => {
    const { editor: editorState, dispatch } = useEditor();
    const { editor } = editorState;
    const element = editor.selectedElement;

    const isCustomHtml = element.type === "customHtml";
    const currentContent = !Array.isArray(element.content) ? element.content : {};
    const [html, setHtml] = React.useState(currentContent.html || "");
    const [css, setCss] = React.useState(currentContent.css || "");
    const [saved, setSaved] = React.useState(false);
    const [previewMode, setPreviewMode] = React.useState(false);

    // Sync state when the selected element changes
    React.useEffect(() => {
        if (isCustomHtml && !Array.isArray(element.content)) {
            setHtml(element.content.html || "");
            setCss(element.content.css || "");
        }
    }, [element.id]);

    if (!isCustomHtml) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                    <Code className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">No HTML Element Selected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Select a <span className="font-medium text-violet-500">Custom HTML</span> block on the canvas to edit its code here.
                    </p>
                </div>
                <p className="text-xs text-muted-foreground">
                    Drag a "Custom HTML" element from the Elements panel or insert a template.
                </p>
            </div>
        );
    }

    const handleApply = () => {
        dispatch({
            type: "UPDATE_ELEMENT",
            payload: {
                elementDetails: {
                    ...element,
                    content: { html, css },
                },
            },
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const handleReset = () => {
        if (!Array.isArray(element.content)) {
            setHtml(element.content.html || "");
            setCss(element.content.css || "");
        }
    };

    const previewDoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{margin:0;padding:0}${css}</style></head><body>${html}</body></html>`;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                        <Code className="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <span className="text-sm font-semibold">Code Editor</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setPreviewMode(!previewMode)}
                        title={previewMode ? "Edit Code" : "Preview"}
                    >
                        <Eye className={cn("w-3.5 h-3.5", previewMode && "text-violet-500")} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleReset}
                        title="Reset to saved"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        className={cn(
                            "h-7 px-3 text-xs gap-1.5 transition-all",
                            saved
                                ? "bg-green-500 hover:bg-green-500 text-white"
                                : "bg-violet-500 hover:bg-violet-600 text-white"
                        )}
                        onClick={handleApply}
                    >
                        {saved ? <><Check className="w-3 h-3" /> Applied!</> : "Apply"}
                    </Button>
                </div>
            </div>

            {/* Preview or Editor */}
            {previewMode ? (
                <div className="flex-1 overflow-hidden">
                    <iframe
                        srcDoc={previewDoc}
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts"
                        title="Code preview"
                    />
                </div>
            ) : (
                <Tabs defaultValue="html" className="flex flex-col flex-1 overflow-hidden">
                    <TabsList className="grid grid-cols-2 h-8 rounded-none border-b bg-muted/30 px-4 gap-2">
                        <TabsTrigger value="html" className="text-xs h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">
                            HTML
                        </TabsTrigger>
                        <TabsTrigger value="css" className="text-xs h-6 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm">
                            CSS
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="html" className="flex-1 overflow-hidden m-0 p-0 mt-0">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 border-b">
                                <span className="text-[10px] text-muted-foreground font-mono">index.html</span>
                                <span className="text-[10px] text-muted-foreground">{html.split("\n").length} lines</span>
                            </div>
                            <textarea
                                value={html}
                                onChange={(e) => { setHtml(e.target.value); setSaved(false); }}
                                className="flex-1 w-full font-mono text-xs p-3 bg-[#1e1e2e] text-[#cdd6f4] resize-none outline-none border-none leading-[1.7] scrollbar-thin scrollbar-thumb-white/10"
                                spellCheck={false}
                                placeholder="<div class='my-section'>
  <h1>Your HTML here</h1>
  <p>Any valid HTML is supported.</p>
</div>"
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        const start = e.currentTarget.selectionStart;
                                        const end = e.currentTarget.selectionEnd;
                                        const newVal = html.substring(0, start) + "  " + html.substring(end);
                                        setHtml(newVal);
                                        setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2; }, 0);
                                    }
                                    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        handleApply();
                                    }
                                }}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="css" className="flex-1 overflow-hidden m-0 p-0 mt-0">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 border-b">
                                <span className="text-[10px] text-muted-foreground font-mono">styles.css</span>
                                <span className="text-[10px] text-muted-foreground">{css.split("\n").length} lines</span>
                            </div>
                            <textarea
                                value={css}
                                onChange={(e) => { setCss(e.target.value); setSaved(false); }}
                                className="flex-1 w-full font-mono text-xs p-3 bg-[#1e1e2e] text-[#cdd6f4] resize-none outline-none border-none leading-[1.7] scrollbar-thin scrollbar-thumb-white/10"
                                spellCheck={false}
                                placeholder="/* CSS is automatically scoped to this element */
.my-section {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 60px 24px;
  text-align: center;
}

.my-section h1 {
  color: white;
  font-size: 48px;
}"
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        const start = e.currentTarget.selectionStart;
                                        const end = e.currentTarget.selectionEnd;
                                        const newVal = css.substring(0, start) + "  " + css.substring(end);
                                        setCss(newVal);
                                        setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2; }, 0);
                                    }
                                    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        handleApply();
                                    }
                                }}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            )}

            {/* Footer hint */}
            <div className="px-4 py-2 border-t bg-muted/10">
                <p className="text-[10px] text-muted-foreground">
                    <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Ctrl+S</kbd> to apply ·{" "}
                    <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Tab</kbd> to indent ·{" "}
                    CSS is auto-scoped
                </p>
            </div>
        </div>
    );
};

export default CodeEditorPanel;

"use client";

import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import tailwindPlugin from "grapesjs-tailwind";
import formsPlugin from "grapesjs-plugin-forms";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface BetaEditorClientProps {
    projectId: string;
}

export default function BetaEditorClient({ projectId }: BetaEditorClientProps) {
    const [isReady, setIsReady] = useState(false);
    const editorRef = useRef<any>(null);

    useEffect(() => {
        setIsReady(true);
    }, []);

    if (!isReady) {
        return <div className="flex items-center justify-center h-full w-full">Loading Beta Editor...</div>;
    }

    return (
        <StudioEditor
            options={{
                project: {
                    type: "web",
                    default: {
                        pages: [
                            {
                                name: "Home",
                                component: '<div class="p-8 text-center text-red-500"><h1>Start Building with Tailwind!</h1></div>',
                            },
                        ],
                    },
                },
                storage: {
                    type: "self",
                    // @ts-ignore
                    options: {
                        remote: {
                            onLoad: async () => {
                                const res = await fetch(`/api/projects/${projectId}`);
                                if (!res.ok) throw new Error("Could not load project");
                                const projectData = await res.json();
                                return projectData.grapesProjectJson ? JSON.parse(projectData.grapesProjectJson) : {};
                            },
                            onSave: async (projectData: any) => {
                                // Save JSON Framework Data
                                const res = await fetch(`/api/projects/${projectId}/grapes`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        grapesProjectJson: JSON.stringify(projectData),
                                    }),
                                });

                                // Automatically Export HTML/CSS for publishing
                                const editor = editorRef.current;
                                if (editor) {
                                    const pages = editor.Pages.getAll();
                                    const exportedPages = pages.map((page: any) => {
                                        const component = page.getMainComponent();
                                        const html = editor.getHtml({ component });
                                        const css = editor.getCss({ component });
                                        return {
                                            id: page.getId(),
                                            name: page.getName() || 'Home',
                                            html,
                                            css
                                        };
                                    });

                                    await fetch(`/api/projects/${projectId}/grapes/export`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(exportedPages),
                                    });
                                }

                                if (!res.ok) {
                                    toast.error("Failed to autosave project");
                                    throw new Error("Could not save project");
                                }
                                toast.success("Project Autosaved & Published successfully!");
                            },
                        },
                    },
                    autosave: true,
                    stepsBeforeSave: 3,
                },
                plugins: [tailwindPlugin, formsPlugin],
                pluginsOpts: {
                    [tailwindPlugin as any]: {
                        tailwindPlayCdn: "https://cdn.tailwindcss.com",
                        loadBlocks: true,
                    },
                },
            }}
            onReady={(editor) => {
                editorRef.current = editor;
                // Set asset upload config
                editor.AssetManager.getConfig().upload = `/api/assets/upload?projectId=${projectId}`;
                // Inject Tailwind CSS into canvas
                const styleId = "tailwind-builder-styles";
                editor.on("canvas:load", () => {
                    const iframe = editor.Canvas.getFrameEl();
                    const head = iframe?.contentDocument?.head;
                    if (head && !head.querySelector(`#${styleId}`)) {
                        const link = iframe.contentDocument!.createElement("link");
                        link.id = styleId;
                        link.rel = "stylesheet";
                        link.href = "/tailwind-builder.css";
                        head.appendChild(link);
                    }
                });

                // Initialize Blocks (Reusable components)
                const blockManager = editor.Blocks;

                blockManager.add("tw-navbar", {
                    label: "Navbar",
                    category: "Navigation",
                    content:
                        '<nav class="p-4 bg-gray-900 text-white flex justify-between items-center"><div class="font-bold text-xl">Logo</div><div class="flex gap-4"><a href="#" class="hover:text-blue-400">Home</a><a href="#" class="hover:text-blue-400">About</a></div></nav>',
                });

                blockManager.add("tw-footer", {
                    label: "Footer",
                    category: "Navigation",
                    content:
                        '<footer class="p-8 bg-gray-100 text-center text-gray-600 mt-10"><p>&copy; 2026 Your Company. All rights reserved.</p></footer>',
                });

                blockManager.add("tw-hero", {
                    label: "Hero section",
                    category: "Hero",
                    content:
                        '<section class="bg-blue-600 text-white py-24 px-10 text-center flex flex-col items-center"><h1 class="text-6xl font-extrabold mb-6 tracking-tight">Build Faster with Tailwind</h1><p class="text-xl mb-8 max-w-2xl text-blue-100">Drag and drop pre-built Tailwind CSS components directly into your page.</p><button class="bg-white text-blue-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors">Get Started</button></section>',
                });

                blockManager.add("tw-features", {
                    label: "3-Column Features",
                    category: "Features",
                    content:
                        '<section class="py-20 px-10 bg-white"><div class="max-w-6xl mx-auto"><h2 class="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Us</h2><div class="grid grid-cols-1 select-none md:grid-cols-3 gap-8"><div class="p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition bg-gray-50"><h3 class="text-xl font-semibold mb-3 text-gray-900">Feature 1</h3><p class="text-gray-600 leading-relaxed">Detailed description of this impressive feature.</p></div><div class="p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition bg-gray-50"><h3 class="text-xl font-semibold mb-3 text-gray-900">Feature 2</h3><p class="text-gray-600 leading-relaxed">Detailed description of this impressive feature.</p></div><div class="p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition bg-gray-50"><h3 class="text-xl font-semibold mb-3 text-gray-900">Feature 3</h3><p class="text-gray-600 leading-relaxed">Detailed description of this impressive feature.</p></div></div></div></section>',
                });

                blockManager.add('tw-pricing', {
                    label: 'Pricing Table',
                    category: 'Pricing',
                    content: '<section class="py-16 bg-gray-50"><div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-8"><div class="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-200"><h3 class="text-2xl font-bold mb-4">Starter</h3><p class="text-4xl font-extrabold mb-6">$19<span class="text-lg text-gray-500 font-normal">/mo</span></p><ul class="text-gray-600 mb-8 space-y-3"><li>1 Project</li><li>Basic Support</li></ul><button class="w-full py-3 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">Select Plan</button></div><div class="bg-blue-600 text-white p-8 rounded-2xl shadow-xl text-center"><h3 class="text-2xl font-bold mb-4">Pro</h3><p class="text-4xl font-extrabold mb-6">$49<span class="text-lg text-blue-200 font-normal">/mo</span></p><ul class="text-blue-100 mb-8 space-y-3"><li>Unlimited Projects</li><li>Priority Support</li></ul><button class="w-full py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100">Select Plan</button></div></div></section>'
                });

                // Add a custom export button to the panel
                editor.Panels.addButton("options", {
                    id: "action-export-files",
                    className: "fa fa-download",
                    label: "Export Code",
                    command: async () => {
                        const pages = editor.Pages.getAll();

                        const exportedPages = pages.map((page: any) => {
                            const component = page.getMainComponent();
                            const html = editor.getHtml({ component });
                            const css = editor.getCss({ component });
                            return {
                                id: page.getId(),
                                name: page.getName() || 'Home',
                                html,
                                css
                            };
                        });

                        try {
                            const res = await fetch(`/api/projects/${projectId}/grapes/export`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(exportedPages),
                            });
                            if (res.ok) {
                                toast.success("Project exported to server!");
                            } else {
                                toast.error("Failed to export project.");
                            }
                        } catch (err) {
                            toast.error("Error exporting project.");
                        }
                    },
                });

                // Load existing assets from backend
                fetch(`/api/assets?projectId=${projectId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.data) {
                            editor.AssetManager.add(data.data.map((url: string) => ({ src: url })));
                        }
                    })
                    .catch(() => { });
            }}
        />
    );
}

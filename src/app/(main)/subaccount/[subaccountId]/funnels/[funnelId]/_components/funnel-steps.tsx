"use client";

import React, { useState, useEffect } from "react";
import { Funnel, FunnelPage } from "@prisma/client";
import { ExternalLink, LucideLayoutGrid } from "lucide-react";
import Link from "next/link";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FunnelPageDetails from "@/components/forms/funnel-page-details";
import CreateFunnelPageButton from "./create-funnel-page-button";
import FunnelStepCard from "./funnel-step-card";
import { upsertFunnelPage } from "@/lib/queries";

interface FunnelStepsProps {
    funnel: Funnel & { funnelPages: FunnelPage[] };
    subaccountId: string;
    pages: FunnelPage[];
    funnelId: string;
}

const FunnelSteps: React.FC<FunnelStepsProps> = ({
    funnel,
    subaccountId,
    pages,
    funnelId,
}) => {
    const router = useRouter();
    const [clickedPage, setClickedPage] = useState<FunnelPage | undefined>(
        pages[0]
    );
    const [pagesState, setPagesState] = useState<FunnelPage[]>(pages);

    useEffect(() => {
        setPagesState(pages);
        if (pages.length > 0 && !clickedPage) {
            setClickedPage(pages[0]);
        }
    }, [pages]);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const newPages = Array.from(pagesState);
        const [reorderedPage] = newPages.splice(result.source.index, 1);
        newPages.splice(result.destination.index, 0, reorderedPage);

        setPagesState(newPages); // Optimistic visual update

        try {
            const updates = newPages.map((page, index) => { // Update DB order
                return upsertFunnelPage(subaccountId, funnelId, {
                    ...page,
                    order: index,
                });
            });

            await Promise.all(updates);

            toast.success("Success", { description: "Funnel page order saved" });
            router.refresh();
        } catch (error) {
            toast.error("Error", { description: "Could not save funnel page order" });
            console.error(error);
            setPagesState(pages); // Revert
        }
    };

    let protocol = process.env.NEXT_PUBLIC_SCHEME || 'http';
    if (protocol.includes(':')) {
        protocol = protocol.split(':')[0];
    }
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000';
    const url = clickedPage
        ? `${protocol}://${funnel.subDomainName}.${domain}/${clickedPage.pathName}`
        : '#';

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex border rounded-lg lg:!flex-row flex-col bg-background h-full overflow-hidden">
                {/* Left Sidebar: Steps List */}
                <aside className="w-full lg:w-[300px] border-r flex flex-col flex-shrink-0 bg-muted/10">
                    <div className="p-4 border-b">
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-lg">Funnel Steps</h2>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <Droppable droppableId="funnel-pages" direction="vertical">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="p-4 flex flex-col gap-2"
                                >
                                    {pagesState.map((page, index) => (
                                        <div
                                            key={page.id}
                                            className="relative"
                                            onClick={() => setClickedPage(page)}
                                        >
                                            <FunnelStepCard
                                                funnelPage={page}
                                                index={index}
                                                activePage={clickedPage?.id === page.id}
                                                isLastPage={index === pagesState.length - 1}
                                            />
                                        </div>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </ScrollArea>

                    <div className="p-4 border-t bg-background z-10">
                        <CreateFunnelPageButton
                            subaccountId={subaccountId}
                            funnelId={funnelId}
                            order={pagesState.length}
                            className="w-full"
                        >
                            Create New Steps
                        </CreateFunnelPageButton>
                    </div>
                </aside>

                {/* Right Content: Details */}
                <main className="flex-1 flex flex-col h-full bg-muted/5 p-4 lg:p-8 overflow-y-auto">
                    {clickedPage ? (
                        <div className="flex flex-col gap-6 max-w-4xl w-full mx-auto">

                            {/* Header */}
                            <div>
                                <h1 className="text-2xl font-bold">{clickedPage.name}</h1>
                            </div>

                            {/* Preview Section */}
                            <Card className="overflow-hidden">
                                <CardContent className="p-0 flex flex-col md:flex-row h-full">
                                    {/* Visual Preview / Thumbnail Placeholder */}
                                    <div className="bg-muted p-8 flex items-center justify-center min-h-[200px] flex-1 border-r border-b md:border-b-0">
                                        {clickedPage.previewImage ? (
                                            <img src={clickedPage.previewImage} alt="preview" className="rounded-md object-contain h-full w-full max-h-[300px]" />
                                        ) : (
                                            <LucideLayoutGrid className="w-20 h-20 text-muted-foreground/20" />
                                        )}
                                    </div>

                                    {/* Link Info */}
                                    <div className="p-6 md:w-[300px] flex flex-col justify-center gap-2">
                                        <p className="text-sm text-muted-foreground">Page Link:</p>
                                        <div className="flex items-center gap-2 text-sm font-medium text-primary hover:underline break-all">
                                            <a href={url} target="_blank" rel="noreferrer" className="flex items-start gap-2">
                                                <ExternalLink className="w-4 h-4 mt-1 flex-shrink-0" />
                                                <span>{url}</span>
                                            </a>
                                        </div>
                                        <div className="mt-4 flex flex-col gap-2">
                                            <Link href={`/editor/${subaccountId}/${funnelId}/${clickedPage.id}`}>
                                                <Button size="sm" variant="outline" className="w-full">
                                                    Edit Page Content (Old Editor)
                                                </Button>
                                            </Link>
                                            <Link href={`/builder/${funnelId}/editor-beta`}>
                                                <Button size="sm" className="w-full">
                                                    Edit with GrapesJS (Beta)
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Settings Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Funnel Page</CardTitle>
                                    <CardDescription>
                                        Funnel pages flow in the order they are created by default. You can move them around to change their order.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FunnelPageDetails
                                        subAccountId={subaccountId}
                                        funnelId={funnelId}
                                        order={clickedPage.order}
                                        defaultData={clickedPage}
                                    />
                                </CardContent>
                            </Card>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <LucideLayoutGrid className="w-16 h-16 opacity-20" />
                            <p>Select a step to view details</p>
                        </div>
                    )}
                </main>
            </div>
        </DragDropContext>
    );
};
export default FunnelSteps;

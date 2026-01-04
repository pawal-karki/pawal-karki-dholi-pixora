"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Draggable } from "@hello-pangea/dnd";
import { ArrowDown, LucideLayoutGrid } from "lucide-react";
import { FunnelPage } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FunnelStepCardProps {
    funnelPage: FunnelPage;
    index: number;
    activePage: boolean;
    isLastPage: boolean;
}

const FunnelStepCard: React.FC<FunnelStepCardProps> = ({
    activePage,
    funnelPage,
    index,
    isLastPage
}) => {
    const [portal, setPortal] = React.useState<HTMLElement | null>(null);

    React.useEffect(() => {
        setPortal(document.getElementById("blur-page"));
    }, []);

    return (
        <Draggable draggableId={funnelPage.id} index={index}>
            {(provided, snapshot) => {
                if (snapshot.isDragging) {
                    // Optional offset logic if needed
                }

                const component = (
                    <Card
                        className={cn("p-0 relative cursor-grab my-2", {
                            "border-primary": activePage,
                        })}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                    >
                        <CardContent className="p-0 flex items-center gap-4 flex-row">
                            <div className="h-14 w-14 bg-muted flex items-center justify-center relative border-r">
                                <LucideLayoutGrid className="w-6 h-6 text-muted-foreground" />
                                {!isLastPage && (
                                    <ArrowDown className="w-5 h-5 absolute -bottom-2 text-primary z-50" />
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden px-2">
                                <span className="truncate font-medium">{funnelPage.name}</span>
                                <span className="text-muted-foreground text-xs truncate">/{funnelPage.pathName}</span>
                            </div>
                        </CardContent>
                        {activePage && (
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
                        )}
                        {index === 0 && (
                            <Badge className="absolute top-2 right-2" variant="outline">Default</Badge>
                        )}
                    </Card>
                );

                if (!portal) return component;
                if (snapshot.isDragging) {
                    return createPortal(component, portal);
                }

                return component;
            }}
        </Draggable>
    );
};

export default FunnelStepCard;

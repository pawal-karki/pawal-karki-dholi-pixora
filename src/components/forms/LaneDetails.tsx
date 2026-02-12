"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lane } from "@prisma/client";

import { getPipelineDetails } from "@/queries/pipelines";
import { upsertLane } from "@/queries/lanes";
import { saveActivityLogsNotification } from "@/queries/notifications";

import { useModal } from "@/hooks/use-modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";

interface LaneDetailsProps {
    defaultData?: Lane;
    pipelineId: string;
}

const DEFAULT_COLOR =
    "linear-gradient(to bottom right,#ff75c3,#ffa647,#ffe83f,#9fff5b,#70e2ff,#cd93ff)";

const LaneDetails: React.FC<LaneDetailsProps> = ({ defaultData, pipelineId }) => {
    const router = useRouter();
    const { setClose } = useModal();

    const [name, setName] = React.useState(defaultData?.name || "");
    const [color, setColor] = React.useState(defaultData?.color || DEFAULT_COLOR);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error("Lane name is required");
            return;
        }

        setIsLoading(true);
        try {
            const response = await upsertLane({
                name: trimmedName,
                color,
                id: defaultData?.id,
                pipelineId,
                order: defaultData?.order,
            });

            const pipelineDetails = await getPipelineDetails(pipelineId);
            if (pipelineDetails) {
                await saveActivityLogsNotification({
                    agencyId: undefined,
                    description: `Updated a lane | ${response?.name}`,
                    subaccountId: pipelineDetails.subAccountId,
                });
            }

            toast.success("Success", { description: "Saved lane details" });
            router.refresh();
        } catch (error) {
            toast.error("Oops!", { description: "Could not save lane details" });
        } finally {
            setIsLoading(false);
        }

        setClose();
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Lane Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="lane-name">Lane name</Label>
                        <Input
                            id="lane-name"
                            placeholder="Lane name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Lane color</Label>
                        <div className="flex justify-center">
                            <ColorPicker value={color} onChange={setColor} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button disabled={isLoading} type="submit" className="w-20">
                            Save
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default LaneDetails;

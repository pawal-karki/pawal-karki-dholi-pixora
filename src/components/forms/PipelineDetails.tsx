"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pipeline } from "@prisma/client";

import { deletePipeline, upsertPipeline } from "@/queries/pipelines";
import { saveActivityLogsNotification } from "@/queries/notifications";

import { useModal } from "@/hooks/use-modal";
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PipelineDetailsProps {
    defaultData?: Pipeline;
    subAccountId: string;
    pipelineId: string;
}

const PipelineDetails: React.FC<PipelineDetailsProps> = ({
    defaultData,
    subAccountId,
    pipelineId,
}) => {
    const { setClose } = useModal();
    const router = useRouter();

    const [name, setName] = React.useState(defaultData?.name || "");
    const [isLoading, setIsLoading] = React.useState(false);

    const handleDelete = async () => {
        try {
            const response = await deletePipeline(pipelineId);
            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Deleted pipeline | ${response?.name}`,
                subaccountId: subAccountId,
            });
            toast.success("Deleted", { description: "Pipeline deleted" });
            router.push(`/subaccount/${subAccountId}/pipelines`);
        } catch (error) {
            toast.error("Oops!", { description: "Could not delete pipeline" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error("Pipeline name is required");
            return;
        }

        setIsLoading(true);
        try {
            const response = await upsertPipeline({
                name: trimmedName,
                id: defaultData?.id,
                subAccountId,
            });
            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Updated pipeline | ${response?.name}`,
                subaccountId: subAccountId,
            });
            toast.success("Success", { description: "Saved pipeline details" });
            router.refresh();
        } catch (error) {
            toast.error("Oops!", { description: "Could not save pipeline details" });
        } finally {
            setIsLoading(false);
        }

        setClose();
    };

    return (
        <Card className="max-w-xl w-full mx-auto">
            <CardHeader>
                <CardTitle>Pipeline Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pipeline-name">Pipeline Name</Label>
                        <Input
                            id="pipeline-name"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-4">
                        <Button className="w-20" disabled={isLoading} type="submit">
                            Save
                        </Button>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" type="button">
                                Delete Pipeline
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this
                                    pipeline and all related records.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="items-center">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default PipelineDetails;

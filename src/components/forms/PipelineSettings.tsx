"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Pipeline } from "@prisma/client";

import { AlertDialog } from "@/components/ui/alert-dialog";
import PipelineDetails from "@/components/forms/PipelineDetails";

const PipelineSettings = ({
    pipelineId,
    subaccountId,
    pipelines,
}: {
    pipelineId: string;
    subaccountId: string;
    pipelines: Pipeline[];
}) => {
    const router = useRouter();

    return (
        <AlertDialog>
            <div>
                <PipelineDetails
                    subAccountId={subaccountId}
                    pipelineId={pipelineId}
                    defaultData={pipelines.find((p) => p.id === pipelineId)}
                />
            </div>
        </AlertDialog>
    );
};

export default PipelineSettings;

"use client";

import React from "react";
import { Plus } from "lucide-react";

import { useModal } from "@/hooks/use-modal";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/global/custom-modal";
import FunnelDetails from "@/components/forms/funnel-details";

interface CreateFunnelButtonProps {
    subAccountId: string;
}

const CreateFunnelButton: React.FC<CreateFunnelButtonProps> = ({ subAccountId }) => {
    const { setOpen } = useModal();

    const handleClick = () => {
        setOpen(
            <CustomModal
                title="Create a Funnel"
                subTitle="Choose a subdomain for your published funnel URL, then add steps and pages."
            >
                <FunnelDetails subAccountId={subAccountId} />
            </CustomModal>
        );
    };

    return (
        <Button className="flex items-center gap-2" onClick={handleClick}>
            <Plus className="w-4 h-4" />
            Create Funnel
        </Button>
    );
};

export default CreateFunnelButton;

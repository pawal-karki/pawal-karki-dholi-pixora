"use client";

import React from "react";
import { Plus } from "lucide-react";

import { useModal } from "@/hooks/use-modal";
import { Button, ButtonProps } from "@/components/ui/button";
import CustomModal from "@/components/global/custom-modal";
import FunnelPageDetails from "@/components/forms/funnel-page-details";

interface CreateFunnelPageButtonProps extends ButtonProps {
    subaccountId: string;
    funnelId: string;
    order: number;
}

const CreateFunnelPageButton: React.FC<CreateFunnelPageButtonProps> = ({
    subaccountId,
    funnelId,
    order,
    children,
    ...props
}) => {
    const { setOpen } = useModal();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setOpen(
            <CustomModal
                title="Create a Funnel Page"
                subTitle="Funnel pages are flow in the order they are created by default. You can move them around to change their order."
            >
                <FunnelPageDetails
                    subAccountId={subaccountId}
                    funnelId={funnelId}
                    order={order}
                />
            </CustomModal>
        );

        if (props.onClick) props.onClick(e);
    };

    return (
        <Button {...props} onClick={handleClick}>
            {children || (
                <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Page
                </>
            )}
        </Button>
    );
};

export default CreateFunnelPageButton;

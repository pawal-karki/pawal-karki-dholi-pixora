"use client";

import React from "react";
import { PlusCircle } from "lucide-react";

import { useModal } from "@/hooks/use-modal";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/global/custom-modal";
import ContactDetails from "@/components/forms/ContactDetails";

type Props = {
    subAccountId: string;
};

const CreateContactButton: React.FC<Props> = ({ subAccountId }) => {
    const { setOpen } = useModal();

    const handleCreateContact = () => {
        setOpen(
            <CustomModal
                title="Create or update contact information"
                subTitle="Contacts are like customers."
            >
                <ContactDetails subAccountId={subAccountId} />
            </CustomModal>
        );
    };

    return (
        <Button
            onClick={handleCreateContact}
            className="inline-flex items-center gap-2"
        >
            <PlusCircle className="w-4 h-4" />
            Create Contact
        </Button>
    );
};

export default CreateContactButton;

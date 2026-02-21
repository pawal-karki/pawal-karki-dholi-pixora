"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { upsertContact } from "@/queries/contacts";
import { saveActivityLogsNotification } from "@/queries/notifications";
import { useModal } from "@/hooks/use-modal";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ContactDetailsProps {
    subAccountId: string;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ subAccountId }) => {
    const router = useRouter();
    const { setClose, data } = useModal();

    const [name, setName] = React.useState(data.contact?.name || "");
    const [email, setEmail] = React.useState(data.contact?.email || "");
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            toast.error("Name is required");
            return;
        }

        if (!trimmedEmail) {
            toast.error("Email is required");
            return;
        }

        setIsLoading(true);
        try {
            const response = await upsertContact({
                name: trimmedName,
                email: trimmedEmail,
                subAccountId,
                id: data.contact?.id,
            });

            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Updated a contact | ${response?.name}`,
                subaccountId: subAccountId,
            });

            toast.success("Success", {
                description: "Saved contact details",
            });

            setClose();
            router.refresh();
        } catch {
            toast.error("Oops!", {
                description: "Could not save contact details",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Contact Info</CardTitle>
                <CardDescription>
                    You can assign tickets to contacts and set a value for each
                    contact in the ticket.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="contact-name">Name</Label>
                        <Input
                            id="contact-name"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact-email">Email</Label>
                        <Input
                            id="contact-email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex w-full justify-end">
                        <Button
                            disabled={isLoading}
                            type="submit"
                            className="gap-2"
                        >
                            {isLoading ? "Saving…" : "Save Contact Details"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ContactDetails;

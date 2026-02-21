"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronsUpDownIcon, User2 } from "lucide-react";
import type { Contact, Tag, User } from "@prisma/client";

import { getSubAccountTeamMembers } from "@/queries/subaccounts";
import { searchContacts } from "@/queries/contacts";
import { saveActivityLogsNotification } from "@/queries/notifications";
import { upsertTicket } from "@/queries/tickets";

import { useModal } from "@/hooks/use-modal";
import type { TicketsWithTags } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import TagDetails from "./TagDetails";
import { cn } from "@/lib/utils";

interface TicketDetailsProps {
    laneId: string;
    subAccountId: string;
    getNewTicket: (ticket: TicketsWithTags[0]) => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({
    getNewTicket,
    laneId,
    subAccountId,
}) => {
    const router = useRouter();
    const { data: defaultData, setClose } = useModal();

    const [isLoading, setIsLoading] = React.useState(false);
    const [name, setName] = React.useState(defaultData?.ticket?.name || "");
    const [description, setDescription] = React.useState(defaultData?.ticket?.description || "");
    const [value, setValue] = React.useState(String(defaultData?.ticket?.value || ""));
    const [tags, setTags] = React.useState<Tag[]>(defaultData?.ticket?.tags || []);
    const [assignedTo, setAssignedTo] = React.useState(defaultData?.ticket?.assigned?.id || "");
    const [contactId, setContactId] = React.useState(defaultData?.ticket?.customerId || "");
    const [contactList, setContactList] = React.useState<Contact[]>([]);
    const [allTeamMembers, setAllTeamMembers] = React.useState<User[]>([]);
    const [search, setSearch] = React.useState("");

    const searchTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

    // Load team members
    React.useEffect(() => {
        if (!subAccountId) return;
        getSubAccountTeamMembers(subAccountId).then((res) => {
            if (res) setAllTeamMembers(res);
        });
    }, [subAccountId]);

    // Load initial contacts
    React.useEffect(() => {
        const customerName = defaultData?.ticket?.customer?.name;
        if (customerName) {
            searchContacts(customerName, subAccountId).then(setContactList);
        } else {
            searchContacts("", subAccountId).then(setContactList);
        }
    }, [defaultData?.ticket?.customer?.name, subAccountId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error("Ticket name is required");
            return;
        }

        setIsLoading(true);
        try {
            const response = await upsertTicket(
                {
                    name: trimmedName,
                    description: description || undefined,
                    value: value || "0",
                    laneId,
                    id: defaultData?.ticket?.id,
                    assignedUserId: assignedTo || undefined,
                    ...(contactId ? { customerId: contactId } : {}),
                },
                tags
            );

            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Updated a ticket | ${response?.name}`,
                subaccountId: subAccountId,
            });

            toast.success("Success", { description: "Saved ticket details" });

            if (response) {
                getNewTicket(response);
                setClose();
            }

            router.refresh();
        } catch (error) {
            toast.error("Oops!", { description: "Could not save ticket details" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="ticket-name">Ticket name</Label>
                        <Input
                            id="ticket-name"
                            placeholder="Ticket name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="ticket-description">Description</Label>
                        <Textarea
                            id="ticket-description"
                            placeholder="Ticket description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Value */}
                    <div className="space-y-2">
                        <Label htmlFor="ticket-value">Ticket value</Label>
                        <div className="relative">
                            <span className="absolute top-1/2 -translate-y-1/2 left-3 text-sm text-zinc-400">
                                $
                            </span>
                            <Input
                                id="ticket-value"
                                placeholder="0.00"
                                className="pl-6"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <h3 className="text-2xl font-semibold">Add tags</h3>
                        <TagDetails
                            subAccountId={subAccountId}
                            getSelectedTags={setTags}
                            defaultTags={defaultData?.ticket?.tags || []}
                        />
                    </div>

                    {/* Team member */}
                    <div className="space-y-2">
                        <Label>Assigned to Team Member</Label>
                        <Select
                            value={assignedTo}
                            onValueChange={setAssignedTo}
                            disabled={isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6">
                                                <AvatarFallback className="bg-primary text-sm text-white">
                                                    <User2 className="w-4 h-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-muted-foreground">
                                                Not Assigned
                                            </span>
                                        </div>
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {allTeamMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6">
                                                <AvatarImage src={member.avatarUrl} />
                                                <AvatarFallback className="bg-primary text-sm text-white">
                                                    <User2 className="w-4 h-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{member.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Customer */}
                    <div className="space-y-2">
                        <Label>Customer</Label>
                        <Popover>
                            <PopoverTrigger asChild className="w-full">
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="justify-between"
                                    type="button"
                                >
                                    {contactId
                                        ? contactList.find((c) => c.id === contactId)?.name ||
                                        "Select Customer..."
                                        : "Select Customer..."}
                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Search for customers..."
                                        className="h-9"
                                        value={search}
                                        onValueChange={(val) => {
                                            setSearch(val);
                                            if (searchTimerRef.current)
                                                clearTimeout(searchTimerRef.current);
                                            searchTimerRef.current = setTimeout(async () => {
                                                const res = await searchContacts(val, subAccountId);
                                                setContactList(res);
                                                setSearch("");
                                            }, 1000);
                                        }}
                                    />
                                    {contactList.length === 0 && (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            No customers found.
                                        </div>
                                    )}
                                    <CommandGroup>
                                        {contactList.map((contact) => (
                                            <CommandItem
                                                key={contact.id}
                                                value={contact.id}
                                                onSelect={(val) =>
                                                    setContactId(
                                                        val === contactId ? "" : val
                                                    )
                                                }
                                            >
                                                {contact.name}
                                                <Check
                                                    className={cn(
                                                        "ml-auto h-4 w-4",
                                                        contactId === contact.id
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading} className="w-20 mt-4">
                            Save
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default TicketDetails;

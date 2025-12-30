"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link2, Mail, Phone, Globe } from "lucide-react";

interface LinkPickerProps {
    initialValue?: string;
    onSave: (href: string) => void;
    children: React.ReactNode;
}

const LinkPicker: React.FC<LinkPickerProps> = ({ initialValue = "#", onSave, children }) => {
    const [open, setOpen] = useState(false);
    const [href, setHref] = useState(initialValue);
    const [type, setType] = useState<"url" | "email" | "phone">("url");

    // Simple heuristic to detect initial type
    React.useEffect(() => {
        if (initialValue.startsWith("mailto:")) {
            setType("email");
            setHref(initialValue.replace("mailto:", ""));
        } else if (initialValue.startsWith("tel:")) {
            setType("phone");
            setHref(initialValue.replace("tel:", ""));
        } else {
            setType("url");
            setHref(initialValue);
        }
    }, [initialValue]);

    const handleSave = () => {
        let finalHref = href;
        if (type === "email" && !href.startsWith("mailto:")) {
            finalHref = `mailto:${href}`;
        } else if (type === "phone" && !href.startsWith("tel:")) {
            finalHref = `tel:${href}`;
        }
        onSave(finalHref);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
                <Tabs value={type} onValueChange={(v) => setType(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="url"><Globe className="w-4 h-4 mr-1" /> URL</TabsTrigger>
                        <TabsTrigger value="email"><Mail className="w-4 h-4 mr-1" /> Email</TabsTrigger>
                        <TabsTrigger value="phone"><Phone className="w-4 h-4 mr-1" /> Phone</TabsTrigger>
                    </TabsList>
                    <div className="py-4 gap-2 flex flex-col">
                        <Label>
                            {type === "url" && "Website URL"}
                            {type === "email" && "Email Address"}
                            {type === "phone" && "Phone Number"}
                        </Label>
                        <Input
                            placeholder={
                                type === "url" ? "https://example.com" :
                                    type === "email" ? "user@example.com" :
                                        "+1234567890"
                            }
                            value={href}
                            onChange={(e) => setHref(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSave} className="w-full">Save Link</Button>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
};

export default LinkPicker;

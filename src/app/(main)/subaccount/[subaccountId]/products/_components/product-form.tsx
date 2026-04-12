"use client";

import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";
import { toast } from "@/hooks/use-toast";
import FileUpload from "@/components/global/file-upload";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProductFormProps {
    subaccountId: string;
    defaultData?: {
        id: string;
        name: string;
        price: string;
        description: string | null;
        image: string | null;
        recurring?: string | null;
        currency?: string;
        stripeProductId?: string | null;
        stripePriceId?: string | null;
    };
}

export const ProductForm = ({ subaccountId, defaultData }: ProductFormProps) => {
    const { setClose } = useModal();
    const router = useRouter();

    const [name, setName] = useState(defaultData?.name || "");
    const [price, setPrice] = useState(defaultData?.price || "");
    const [description, setDescription] = useState(defaultData?.description || "");
    const [image, setImage] = useState(defaultData?.image || "");
    const [recurring, setRecurring] = useState(defaultData?.recurring || "one_time");
    const [currency, setCurrency] = useState(defaultData?.currency || "NPR");

    const [isLoading, setIsLoading] = useState(false);
    const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);
    const [checkingStripe, setCheckingStripe] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEditing = !!defaultData?.id;

    useEffect(() => {
        const checkStripeConnection = async () => {
            try {
                const res = await fetch(`/api/stripe/products?subAccountId=${subaccountId}&source=local`);
                const data = await res.json();
                setStripeConnected(data.stripeConnected !== false);
            } catch {
                setStripeConnected(false);
            } finally {
                setCheckingStripe(false);
            }
        };
        checkStripeConnection();
    }, [subaccountId]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = "Name is required";
        if (!price.trim()) newErrors.price = "Price is required";
        else if (isNaN(Number(price)) || Number(price) < 0) newErrors.price = "Enter a valid price";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            if (isEditing) {
                const res = await fetch(`/api/stripe/products`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId: defaultData!.id,
                        subAccountId: subaccountId,
                        name: name.trim(),
                        price: price.trim(),
                        description: description.trim(),
                        image: image || "",
                        recurring,
                        currency,
                    }),
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Failed to update product");
                }
            } else {
                const res = await fetch(`/api/stripe/products`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subAccountId: subaccountId,
                        name: name.trim(),
                        price: price.trim(),
                        description: description.trim(),
                        image: image || "",
                        recurring: recurring === "one_time" ? null : recurring,
                        currency,
                        localOnly: !stripeConnected,
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Failed to create product");
                }
            }

            toast({
                title: "Success",
                description: isEditing
                    ? "Product updated"
                    : stripeConnected
                        ? "Product created and synced with Stripe"
                        : "Product created locally",
            });

            router.refresh();
            setClose();
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not save product",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingStripe) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {!stripeConnected && !isEditing && (
                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                        <strong>Stripe not connected.</strong> Product will be created locally.
                        Connect Stripe in Launchpad to enable customer checkout.
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-1.5">
                <Label>Product Image</Label>
                <FileUpload
                    apiEndpoint="subAccountLogo"
                    value={image}
                    onChange={(url) => setImage(url || "")}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                    id="product-name"
                    placeholder="e.g. Website Design Package"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    disabled={isLoading}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="product-price">Price</Label>
                    <Input
                        id="product-price"
                        type="text"
                        inputMode="decimal"
                        placeholder="999.00"
                        value={price}
                        onChange={(e) => {
                            setPrice(e.target.value);
                            if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                        }}
                        disabled={isLoading}
                    />
                    {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select
                        disabled={isLoading || isEditing}
                        onValueChange={setCurrency}
                        value={currency}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NPR">NPR (रू)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Billing Type</Label>
                <Select
                    disabled={isLoading || isEditing}
                    onValueChange={setRecurring}
                    value={recurring}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select billing type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="one_time">One-time payment</SelectItem>
                        <SelectItem value="month">Monthly subscription</SelectItem>
                        <SelectItem value="year">Yearly subscription</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Choose how customers will be charged</p>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="product-description">Description</Label>
                <Input
                    id="product-description"
                    placeholder="Brief description of your product"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            {defaultData?.stripePriceId && (
                <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        Stripe Price ID: {defaultData.stripePriceId}
                    </AlertDescription>
                </Alert>
            )}

            <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                {isLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                )}
                {isLoading
                    ? "Saving..."
                    : isEditing
                        ? "Update Product"
                        : "Create Product"}
            </Button>
        </form>
    );
};

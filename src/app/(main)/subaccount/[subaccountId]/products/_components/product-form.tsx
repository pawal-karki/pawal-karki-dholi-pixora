"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import { toast } from "@/hooks/use-toast";
import FileUpload from "@/components/global/file-upload";
import { useEffect, useState } from "react";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
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

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    price: z.string().min(1, { message: "Price is required" }),
    description: z.string().optional(),
    image: z.string().optional(),
    recurring: z.string().optional(),
    currency: z.string().default("NPR"),
});

export const ProductForm = ({ subaccountId, defaultData }: ProductFormProps) => {
    const { setClose } = useModal();
    const router = useRouter();
    const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);
    const [checkingStripe, setCheckingStripe] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultData?.name || "",
            price: defaultData?.price || "",
            description: defaultData?.description || "",
            image: defaultData?.image || "",
            recurring: defaultData?.recurring || "one_time",
            currency: defaultData?.currency || "NPR",
        },
    });

    const isLoading = form.formState.isSubmitting;
    const isEditing = !!defaultData?.id;

    // Check if Stripe is connected
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

    useEffect(() => {
        if (defaultData) {
            form.reset({
                name: defaultData.name,
                price: defaultData.price,
                description: defaultData.description || "",
                image: defaultData.image || "",
                recurring: defaultData.recurring || "one_time",
                currency: defaultData.currency || "NPR",
            });
        }
    }, [defaultData, form]);

    const handleSubmit = async (formValues: z.infer<typeof formSchema>) => {
        // Use formValues directly for cleaner code
        const values = formValues;

        try {
            if (isEditing) {
                // For editing, update local DB only (Stripe products can't be easily updated)
                const res = await fetch(`/api/stripe/products`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId: defaultData.id,
                        subAccountId: subaccountId,
                        name: values.name,
                        price: values.price,
                        description: values.description,
                        image: values.image,
                        recurring: values.recurring,
                        currency: values.currency,
                    }),
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Failed to update product");
                }
            } else {
                // Create new product (with Stripe if connected, otherwise local only)
                const res = await fetch(`/api/stripe/products`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subAccountId: subaccountId,
                        name: values.name,
                        price: values.price,
                        description: values.description,
                        image: values.image,
                        recurring: values.recurring === "one_time" ? null : values.recurring,
                        currency: values.currency,
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {!stripeConnected && !isEditing && (
                    <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                            <strong>Stripe not connected.</strong> Product will be created locally.
                            Connect Stripe in Launchpad to enable customer checkout.
                        </AlertDescription>
                    </Alert>
                )}
                <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Image</FormLabel>
                            <FormControl>
                                <FileUpload
                                    apiEndpoint="subAccountLogo"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Website Design Package" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="999.00"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select
                                    disabled={isLoading || isEditing}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="NPR">NPR (रू)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    disabled={isLoading || isEditing}
                    control={form.control}
                    name="recurring"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Billing Type</FormLabel>
                            <Select
                                disabled={isLoading || isEditing}
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select billing type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="one_time">One-time payment</SelectItem>
                                    <SelectItem value="month">Monthly subscription</SelectItem>
                                    <SelectItem value="year">Yearly subscription</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Choose how customers will be charged
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Brief description of your product" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                        ? "Creating in Stripe..."
                        : isEditing
                            ? "Update Product"
                            : "Create Product"}
                </Button>
            </form>
        </Form>
    );
};

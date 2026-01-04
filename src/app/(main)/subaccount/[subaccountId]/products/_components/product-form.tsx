"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import { upsertProduct } from "@/lib/queries";
import { toast } from "@/hooks/use-toast";
import FileUpload from "@/components/global/file-upload";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
    subaccountId: string;
    defaultData?: {
        id: string;
        name: string;
        price: string;
        description: string | null;
        image: string | null;
    };
}

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    price: z.string().min(1, { message: "Price is required" }),
    description: z.string().optional(),
    image: z.string().optional(),
});

export const ProductForm = ({ subaccountId, defaultData }: ProductFormProps) => {
    const { setClose } = useModal();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultData?.name || "",
            price: defaultData?.price || "",
            description: defaultData?.description || "",
            image: defaultData?.image || "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if (defaultData) {
            form.reset({
                name: defaultData.name,
                price: defaultData.price,
                description: defaultData.description || "",
                image: defaultData.image || "",
            });
        }
    }, [defaultData, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await upsertProduct(subaccountId, {
                ...values,
                id: defaultData?.id,
                subAccountId: subaccountId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            toast({
                title: "Success",
                description: defaultData ? "Product updated" : "Product created",
            });

            router.refresh();
            setClose();
        } catch (error) {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save product",
            });
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Product Details</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Product Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        disabled={isLoading}
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input placeholder="0.00" {...field} />
                                </FormControl>
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
                                    <Input placeholder="Product Description" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Save Product"}
                    </Button>
                </form>
            </Form>
        </DialogContent>
    );
};

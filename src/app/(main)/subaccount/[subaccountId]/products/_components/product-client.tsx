"use client";

import { useModal } from "@/providers/modal-provider";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, ExternalLink, Package } from "lucide-react";
import { ProductForm } from "./product-form";
import CustomModal from "@/components/global/custom-modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
    id: string;
    name: string;
    price: string;
    description: string | null;
    image: string | null;
    stripeProductId?: string | null;
    stripePriceId?: string | null;
    recurring?: string | null;
    currency?: string;
}

interface ProductClientProps {
    data: Product[];
    subaccountId: string;
}

export const ProductClient = ({ data, subaccountId }: ProductClientProps) => {
    const { setOpen } = useModal();
    const router = useRouter();

    const onDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/stripe/products?productId=${id}&subAccountId=${subaccountId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to delete");
            }

            toast({
                title: "Success",
                description: "Product deleted",
            });
            router.refresh();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not delete product",
            });
        }
    };

    const formatPrice = (price: string, currency?: string) => {
        const numPrice = parseFloat(price);
        return `${currency || "NPR"} ${numPrice.toLocaleString()}`;
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Products are synced with your Stripe account
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setOpen(
                            <CustomModal
                                title="Create Product"
                                subTitle="Create a product that will be synced with your Stripe account"
                            >
                                <ProductForm subaccountId={subaccountId} />
                            </CustomModal>
                        );
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" /> Create Product
                </Button>
            </div>
            <div className="border bg-background rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Stripe</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center p-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <Package className="h-12 w-12 text-muted-foreground opacity-50" />
                                        <div>
                                            <p className="font-medium">No products yet</p>
                                            <p className="text-sm text-muted-foreground">
                                                Create a product to start accepting payments
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setOpen(
                                                    <CustomModal
                                                        title="Create Product"
                                                        subTitle="Create a product that will be synced with your Stripe account"
                                                    >
                                                        <ProductForm subaccountId={subaccountId} />
                                                    </CustomModal>
                                                );
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Create First Product
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {data.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted/50">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                fill
                                                alt={product.name}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        {product.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {formatPrice(product.price, product.currency)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={product.recurring ? "default" : "secondary"}>
                                        {product.recurring === "month" 
                                            ? "Monthly" 
                                            : product.recurring === "year" 
                                                ? "Yearly" 
                                                : "One-time"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {product.stripePriceId ? (
                                        <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-300">
                                            <CreditCard className="h-3 w-3" />
                                            Synced
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                                            Local only
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {product.stripeProductId && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    window.open(
                                                        `https://dashboard.stripe.com/products/${product.stripeProductId}`,
                                                        "_blank"
                                                    );
                                                }}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setOpen(
                                                    <CustomModal
                                                        title="Edit Product"
                                                        subTitle="Update product details"
                                                    >
                                                        <ProductForm 
                                                            subaccountId={subaccountId} 
                                                            defaultData={product} 
                                                        />
                                                    </CustomModal>
                                                );
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will archive the product in Stripe and remove it from your database.
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => onDelete(product.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

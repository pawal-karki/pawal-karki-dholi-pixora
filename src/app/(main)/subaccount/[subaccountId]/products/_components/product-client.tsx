"use client";

import { useModal } from "@/providers/modal-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductForm } from "./product-form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { deleteProduct } from "@/lib/queries";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProductClientProps {
    data: any[];
    subaccountId: string;
}

export const ProductClient = ({ data, subaccountId }: ProductClientProps) => {
    const { setOpen } = useModal();
    const router = useRouter();

    const onDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            toast({
                title: "Success",
                description: "Product deleted",
            });
            router.refresh();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete product",
            });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        setOpen(
                            <ProductForm subaccountId={subaccountId} />
                        );
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" /> Create Product
                </Button>
            </div>
            <div className="border bg-background rounded-lg p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground p-8">
                                    No products found
                                </TableCell>
                            </TableRow>
                        )}
                        {data.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted/50">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                fill
                                                alt={product.name}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                                No img
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.price}</TableCell>
                                <TableCell>{product.description}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setOpen(
                                                    <ProductForm subaccountId={subaccountId} defaultData={product} />
                                                );
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDelete(product.id)}
                                        >
                                            Delete
                                        </Button>
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

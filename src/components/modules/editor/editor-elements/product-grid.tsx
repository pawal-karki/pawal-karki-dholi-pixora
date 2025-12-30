"use client";

import { EditorElement } from "@/lib/types/editor";
import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";
import { Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getProducts } from "@/lib/queries";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProductGridProps {
    element: EditorElement;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ element }) => {
    const { dispatch, editor: editorState, subaccountId } = useEditor() as any;
    const { editor } = editorState;
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (subaccountId) {
                try {
                    // getProducts is a server action
                    const data = await getProducts(subaccountId);
                    setProducts(data);
                } catch (error) {
                    console.error("Failed to fetch products", error);
                }
            }
        };
        fetchProducts();
    }, [subaccountId]);

    const handleOnClickBody = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({
            type: "CHANGE_CLICKED_ELEMENT",
            payload: {
                elementDetails: element,
            },
        });
    };

    const handleDeleteElement = () => {
        dispatch({
            type: "DELETE_ELEMENT",
            payload: { elementDetails: element },
        });
    };

    return (
        <div
            style={element.styles}
            onClick={handleOnClickBody}
            className={cn(
                "relative p-4 w-full transition-all",
                {
                    "!border-blue-500 !border-solid":
                        editor.selectedElement.id === element.id,
                    "!border-dashed !border": !editor.liveMode,
                }
            )}
        >
            {editor.selectedElement.id === element.id && !editor.liveMode && (
                <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg bg-emerald-500 text-white">
                    {editor.selectedElement.name}
                </Badge>
            )}

            {products.length === 0 ? (
                <div className="flex items-center justify-center p-10 bg-muted/20 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No products found. Add products in the dashboard.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="border rounded-lg overflow-hidden bg-background shadow-sm">
                            <div className="relative h-48 w-full bg-muted">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <span className="font-bold text-primary">{product.price}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                                <button className="w-full mt-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editor.selectedElement.id === element.id && !editor.liveMode && (
                <div className="absolute bg-emerald-500 px-2.5 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white">
                    <Trash
                        className="cursor-pointer"
                        size={16}
                        onClick={handleDeleteElement}
                    />
                </div>
            )}
        </div>
    );
};

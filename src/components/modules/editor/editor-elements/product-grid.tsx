"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Plus,
  Minus,
  Package,
  AlertCircle,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditorElement } from "@/lib/types/editor";
import { useEditor } from "@/hooks/use-editor";
import { useCart } from "@/providers/cart-provider";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  image: string | null;
  stripePriceId: string | null;
  currency: string;
}

interface ProductGridProps {
  element: EditorElement;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ element }) => {
  const { dispatch, editor: editorState, subAccountId } = useEditor();
  const { editor } = editorState;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart (safe for editor mode)
  let cart: ReturnType<typeof useCart> | null = null;
  try {
    cart = useCart();
  } catch {}

  useEffect(() => {
    const fetchProducts = async () => {
      if (!subAccountId) {
        setError("Subaccount ID not available");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const apiUrl = `${baseUrl}/api/stripe/products?subAccountId=${subAccountId}&source=local`;

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to load products");

        const data = await res.json();
        setProducts(data.products || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [subAccountId]);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: { elementDetails: element },
    });
  };

  const handleDelete = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: element },
    });
  };

  const handleAddToCart = (product: Product) => {
    if (!cart) {
      toast.info("Preview mode", {
        description: "Add to cart works in live mode only",
      });
      return;
    }

    cart.addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      currency: product.currency || "NPR",
      image: product.image,
      stripePriceId: product.stripePriceId,
    });

    toast.success("Added to cart", {
      description: product.name,
    });
  };

  const getQty = (productId: string) => {
    if (!cart) return 0;
    return cart.items.find((i) => i.productId === productId)?.quantity || 0;
  };

  const formatPrice = (price: string, currency = "NPR") =>
    `${currency} ${Number(price).toLocaleString()}`;

  return (
    <div
      style={element.styles}
      onClick={handleSelect}
      className={cn("relative w-full", {
        "border border-dashed p-4": !editor.liveMode,
        "border border-blue-500 p-4":
          editor.selectedElement.id === element.id,
      })}
    >
      {/* Editor label */}
      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <Badge className="absolute -top-6 left-0 bg-emerald-500 text-white">
          {element.name}
        </Badge>
      )}

      {/* STATES */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary" />
        </div>
      ) : error ? (
        <div className="p-10 text-center border rounded-xl">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
          <p className="font-semibold text-destructive">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-10 text-center border rounded-xl">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No products available</p>
        </div>
      ) : (
        <div className="grid justify-center gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {products.map((product) => {
            const quantity = getQty(product.id);

            return (
              <div
                key={product.id}
                className="max-w-[320px] w-full mx-auto rounded-2xl border bg-background overflow-hidden transition hover:shadow-lg"
              >
                {/* IMAGE */}
                <div className="relative aspect-square bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-14 w-14 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-semibold leading-tight">
                    {product.name}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description || " "}
                  </p>

                  <div className="text-lg font-bold">
                    {formatPrice(product.price, product.currency)}
                  </div>

                  {/* ACTION */}
                  {quantity > 0 && cart ? (
                    <div className="flex items-center justify-between bg-muted/50 rounded-xl p-2 border border-border/50">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 hover:bg-muted rounded-lg"
                        onClick={() =>
                          cart!.updateQuantity(product.id, quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="font-bold text-base min-w-[2rem] text-center">{quantity}</span>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 hover:bg-muted rounded-lg"
                        onClick={() =>
                          cart!.updateQuantity(product.id, quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full h-11 rounded-xl bg-black hover:bg-black/90 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to cart
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE */}
      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <div className="absolute -top-6 right-0 bg-emerald-500 p-1 rounded text-white">
          <Trash className="cursor-pointer" size={14} onClick={handleDelete} />
        </div>
      )}
    </div>
  );
};

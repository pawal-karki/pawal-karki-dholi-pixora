"use client";

import React, { useState } from "react";
import { EditorElement } from "@/lib/types/editor";
import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Trash, 
    ShoppingCart, 
    Plus, 
    Minus, 
    X, 
    ShoppingBag,
    ArrowRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCart } from "@/providers/cart-provider";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditorCartProps {
    element: EditorElement;
}

export const EditorCart: React.FC<EditorCartProps> = ({ element }) => {
    const { dispatch, editor: editorState, subAccountId, funnelId } = useEditor();
    const { editor } = editorState;
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    
    // Try to use cart
    let cart: ReturnType<typeof useCart> | null = null;
    try {
        cart = useCart();
    } catch {
        // Cart provider not available
    }

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

    const formatPrice = (price: number, currency: string = "NPR") => {
        return `${currency} ${price.toLocaleString()}`;
    };

    const handleCheckout = async () => {
        if (!cart || cart.items.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        // Check if all items have Stripe price IDs
        const itemsWithoutStripe = cart.items.filter(i => !i.stripePriceId);
        if (itemsWithoutStripe.length > 0) {
            toast.error("Some items cannot be checked out", {
                description: "Please remove items without Stripe configuration",
            });
            return;
        }

        try {
            setIsCheckingOut(true);

            // Create checkout session with cart items
            const prices = cart.items.map(item => ({
                priceId: item.stripePriceId,
                quantity: item.quantity,
            }));

            const currentUrl = window.location.href;
            const baseUrl = window.location.origin;
            const response = await fetch(`${baseUrl}/api/stripe/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prices,
                    subAccountId,
                    mode: "redirect",
                    successUrl: `${currentUrl}?checkout=success`,
                    cancelUrl: `${currentUrl}?checkout=canceled`,
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Redirect to Stripe checkout
            if (data.checkoutUrl) {
                // Clear cart before redirect
                cart.clearCart();
                window.location.href = data.checkoutUrl;
            } else {
                toast.error("Failed to create checkout session");
            }
        } catch (error: any) {
            toast.error("Checkout failed", {
                description: error.message,
            });
        } finally {
            setIsCheckingOut(false);
        }
    };

    // Demo cart for editor preview
    const demoItems = [
        { id: "1", name: "Sample Product", price: 999, currency: "NPR", quantity: 2, image: null },
        { id: "2", name: "Another Item", price: 499, currency: "NPR", quantity: 1, image: null },
    ];

    const displayItems = cart?.items.length ? cart.items : (editor.liveMode ? [] : demoItems);
    const totalPrice = cart ? cart.totalPrice : demoItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalItems = cart ? cart.totalItems : demoItems.reduce((sum, i) => sum + i.quantity, 0);
    const currency = cart?.currency || "NPR";

    return (
        <div
            style={element.styles}
            onClick={handleOnClickBody}
            className={cn(
                "relative w-full transition-all",
                {
                    "!border-blue-500 !border-solid p-4":
                        editor.selectedElement.id === element.id,
                    "!border-dashed !border p-4": !editor.liveMode,
                    "p-0": editor.liveMode,
                }
            )}
        >
            {editor.selectedElement.id === element.id && !editor.liveMode && (
                <Badge className="absolute -top-6 left-0 bg-emerald-500 text-white">
                    {editor.selectedElement.name}
                </Badge>
            )}

            <div className="bg-background rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                {/* Cart Header */}
                <div className="p-5 border-b border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-foreground" />
                            <h3 className="font-bold text-lg text-foreground">Shopping Cart</h3>
                        </div>
                        <Badge variant="secondary" className="font-medium">
                            {totalItems} {totalItems === 1 ? "item" : "items"}
                        </Badge>
                    </div>
                </div>

                {/* Cart Items */}
                {displayItems.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                        <p className="text-foreground font-semibold mb-1">Your cart is empty</p>
                        <p className="text-sm text-muted-foreground">
                            Add some products to get started
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[400px]">
                        <div className="p-4 space-y-3">
                            {displayItems.map((item: any) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-card border border-border/50 rounded-xl">
                                    {/* Product Image */}
                                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <ShoppingBag className="h-8 w-8 text-muted-foreground opacity-30" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-semibold text-base truncate">{item.name}</h4>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (cart) {
                                                        cart.removeItem(item.productId || item.id);
                                                        toast.success("Removed from cart");
                                                    }
                                                }}
                                                disabled={!cart}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {formatPrice(item.price, item.currency)}
                                        </p>
                                        
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2">
                                            {cart && (
                                                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1.5 border border-border/50">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-muted rounded-lg"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            cart.updateQuantity(item.productId || item.id, item.quantity - 1);
                                                        }}
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <span className="w-8 text-center font-bold text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-muted rounded-lg"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            cart.updateQuantity(item.productId || item.id, item.quantity + 1);
                                                        }}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                            {!cart && (
                                                <span className="text-sm text-muted-foreground">
                                                    Qty: {item.quantity}
                                                </span>
                                            )}
                                            <span className="ml-auto font-bold text-base">
                                                {formatPrice(item.price * item.quantity, item.currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                {/* Cart Footer */}
                {displayItems.length > 0 && (
                    <div className="p-5 border-t border-border/50 bg-muted/30">
                        <div className="flex items-center justify-between mb-5">
                            <span className="text-lg font-semibold text-foreground">Total</span>
                            <span className="text-2xl font-bold text-foreground">
                                {formatPrice(totalPrice, currency)}
                            </span>
                        </div>
                        
                        {cart && (
                            <Button 
                                className="w-full h-12 text-base font-semibold bg-black hover:bg-black/90 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckout();
                                }}
                                disabled={isCheckingOut || cart.items.length === 0}
                            >
                                {isCheckingOut ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Proceed to Checkout
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        )}
                        
                        {!cart && !editor.liveMode && (
                            <p className="text-sm text-muted-foreground text-center">
                                Checkout works in preview/live mode
                            </p>
                        )}
                    </div>
                )}
            </div>

            {editor.selectedElement.id === element.id && !editor.liveMode && (
                <div className="absolute -top-6 right-0 bg-emerald-500 p-1 rounded text-white">
                    <Trash
                        className="cursor-pointer"
                        size={14}
                        onClick={handleDeleteElement}
                    />
                </div>
            )}
        </div>
    );
};

export default EditorCart;

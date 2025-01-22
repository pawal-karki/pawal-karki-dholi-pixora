"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string | null;
  quantity: number;
  stripePriceId: string | null;
  subAccountId: string;
  agencyId: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  currency: string;
  subAccountId: string | null;
  agencyId: string | null;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      // If cart is empty, accept any agency
      if (prev.length === 0) {
        return [{ ...item, quantity: 1 }];
      }

      // Check if different agency
      const currentAgencyId = prev[0].agencyId;
      if (item.agencyId !== currentAgencyId) {
        // Clear cart and add new item
        toast.warning("Cart cleared", {
          description: "Products from different agencies cannot be mixed. Previous items removed.",
        });
        return [{ ...item, quantity: 1 }];
      }

      const existingItem = prev.find((i) => i.productId === item.productId);
      if (existingItem) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const currency = useMemo(
    () => items[0]?.currency || "NPR",
    [items]
  );

  const subAccountId = useMemo(() => items[0]?.subAccountId || null, [items]);
  const agencyId = useMemo(() => items[0]?.agencyId || null, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      currency,
      subAccountId,
      agencyId,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, currency, subAccountId, agencyId]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

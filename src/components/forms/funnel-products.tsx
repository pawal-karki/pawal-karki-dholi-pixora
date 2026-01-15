"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  CreditCard,
} from "lucide-react";

import { updateFunnelProducts } from "@/lib/queries";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LocalProduct {
  id: string;
  name: string;
  price: string;
  description: string | null;
  image: string | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  recurring: string | null;
  currency: string;
}

interface FunnelProductsProps {
  subAccountId: string;
  funnelId: string;
  currentProducts: string; // JSON string of selected price IDs
}

const FunnelProducts: React.FC<FunnelProductsProps> = ({
  subAccountId,
  funnelId,
  currentProducts,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [selectedPriceIds, setSelectedPriceIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stripeConnected, setStripeConnected] = useState(true);

  // Parse current products on mount
  useEffect(() => {
    try {
      const parsed = JSON.parse(currentProducts || "[]");
      // Handle both formats: array of objects with priceId or array of strings
      const priceIds = parsed.map((p: any) => 
        typeof p === "string" ? p : p.priceId || p.id
      ).filter(Boolean);
      setSelectedPriceIds(priceIds);
    } catch {
      setSelectedPriceIds([]);
    }
  }, [currentProducts]);

  // Fetch products from local DB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/stripe/products?subAccountId=${subAccountId}&source=local`
        );
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setProducts(data.products || []);
          setStripeConnected(data.stripeConnected !== false);
        }
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [subAccountId]);

  const toggleProduct = (priceId: string) => {
    setSelectedPriceIds((prev) =>
      prev.includes(priceId)
        ? prev.filter((id) => id !== priceId)
        : [...prev, priceId]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Format as array of price objects for the checkout
      const productsToSave = selectedPriceIds.map((priceId) => ({
        priceId,
        quantity: 1,
      }));

      await updateFunnelProducts(JSON.stringify(productsToSave), funnelId);

      toast.success("Products updated!", {
        description: `${selectedPriceIds.length} product(s) added to funnel`,
      });

      router.refresh();
    } catch (err) {
      toast.error("Failed to save products");
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    return `${currency} ${numPrice.toLocaleString()}`;
  };

  // Filter products that have Stripe price IDs (required for checkout)
  const stripeProducts = products.filter((p) => p.stripePriceId);
  const localOnlyProducts = products.filter((p) => !p.stripePriceId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stripeConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Stripe Connect Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
            Connect your Stripe account in Launchpad to create products and accept payments
          </p>
          <Button
            variant="outline"
            onClick={() => router.push(`/subaccount/${subAccountId}/launchpad`)}
          >
            Go to Launchpad
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="font-semibold text-lg mb-2">Error Loading Products</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Products Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Selected Products</CardTitle>
              <CardDescription>
                {selectedPriceIds.length} product(s) will be available for checkout
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardHeader>
        {selectedPriceIds.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedPriceIds.map((priceId) => {
                const product = stripeProducts.find((p) => p.stripePriceId === priceId);
                return (
                  <Badge
                    key={priceId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {product?.name || priceId}
                    <button
                      onClick={() => toggleProduct(priceId)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      <Separator />

      {/* Available Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Your Products</h3>
            <p className="text-sm text-muted-foreground">
              Select products to add to this funnel's checkout
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/subaccount/${subAccountId}/products`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Products
          </Button>
        </div>

        {stripeProducts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No Products Available</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Create products in the Products section to add them to your funnels
              </p>
              <Button
                onClick={() => router.push(`/subaccount/${subAccountId}/products`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-3">
              {stripeProducts.map((product) => {
                const isSelected = product.stripePriceId
                  ? selectedPriceIds.includes(product.stripePriceId)
                  : false;

                return (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => product.stripePriceId && toggleProduct(product.stripePriceId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isSelected}
                          className="mt-1"
                        />
                        
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{product.name}</h4>
                              <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                                <CreditCard className="h-3 w-3 mr-1" />
                                Stripe
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatPrice(product.price, product.currency)}
                              </p>
                              {product.recurring && (
                                <p className="text-xs text-muted-foreground">
                                  per {product.recurring}
                                </p>
                              )}
                            </div>
                          </div>
                          {product.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Show warning for local-only products */}
        {localOnlyProducts.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-amber-600 mb-2">
              ⚠️ {localOnlyProducts.length} product(s) don't have Stripe sync and can't be used for checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelProducts;

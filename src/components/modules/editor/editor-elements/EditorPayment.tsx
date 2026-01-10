'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash, CreditCard, AlertCircle, Settings, Package } from "lucide-react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

import { getSubAccountDetails, getFunnel, createCheckoutPage } from "@/lib/queries";

import { useEditor } from "@/hooks/use-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Loading from "@/components/global/loading";

import { getStripe } from "@/lib/stripe/stripe-client";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/lib/types/editor";

interface EditorPaymentProps {
  element: EditorElement;
}

type PaymentState = 
  | "loading"
  | "no-stripe-connect"
  | "no-products"
  | "error"
  | "ready";

const EditorPayment: React.FC<EditorPaymentProps> = ({ element }) => {
  const router = useRouter();
  const {
    editor: editorState,
    dispatch,
    funnelId,
    subAccountId,
  } = useEditor();
  const { editor } = editorState;

  const [clientSecret, setClientSecret] = React.useState<string>("");
  const [livePrices, setLivePrices] = React.useState<any[]>([]);
  const [subAccountConnectedId, setSubAccountConnectedId] = React.useState<string>("");
  const [paymentState, setPaymentState] = React.useState<PaymentState>("loading");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const options = React.useMemo(() => ({ clientSecret }), [clientSecret]);

  // Fetch subaccount connected ID
  React.useEffect(() => {
    if (!subAccountId) return;

    const fetchSubAccountConnectedId = async () => {
      try {
        const subAccountDetails = await getSubAccountDetails(subAccountId);

        if (subAccountDetails) {
          if (!subAccountDetails.connectAccountId) {
            setPaymentState("no-stripe-connect");
            return;
          }
          setSubAccountConnectedId(subAccountDetails.connectAccountId);
        }
      } catch (error) {
        console.error("Failed to fetch subaccount details:", error);
        setPaymentState("error");
        setErrorMessage("Failed to load subaccount details");
      }
    };

    fetchSubAccountConnectedId();
  }, [subAccountId]);

  // Fetch funnel products
  React.useEffect(() => {
    if (!funnelId) return;

    const fetchFunnel = async () => {
      try {
        const funnelData = await getFunnel(funnelId);

        if (funnelData) {
          const products = JSON.parse(funnelData.liveProducts || "[]");
          setLivePrices(products);
          
          if (products.length === 0 && subAccountConnectedId) {
            setPaymentState("no-products");
          }
        }
      } catch (error) {
        console.error("Failed to fetch funnel:", error);
      }
    };

    fetchFunnel();
  }, [funnelId, subAccountConnectedId]);

  // Create checkout session
  React.useEffect(() => {
    if (!livePrices.length || !subAccountId || !subAccountConnectedId) return;

    const getClientSecret = async () => {
      try {
        setPaymentState("loading");
        const payload = JSON.stringify({
          subAccountConnectedId,
          prices: livePrices,
          subAccountId,
        });

        const response = await fetch(
          `/api/stripe/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: payload,
          }
        );

        const data = await response.json();

        if (!data) throw new Error("Something went wrong...");
        if (data.error) throw new Error(data.error);

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setPaymentState("ready");
        }
      } catch (error: any) {
        console.error("Checkout session error:", error);
        setPaymentState("error");
        setErrorMessage(error.message || "Failed to create checkout session");
        toast.error("Oppse!", {
          description: error.message,
          descriptionClassName: "line-clamp-3",
        });
      }
    };

    getClientSecret();
  }, [livePrices, subAccountId, subAccountConnectedId]);

  const handleOnClickBody = (event: React.MouseEvent) => {
    event.stopPropagation();

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

  // Render content based on payment state
  const renderPaymentContent = () => {
    // In editor mode (not live), show helpful setup messages
    if (!editor.liveMode) {
      switch (paymentState) {
        case "no-stripe-connect":
          return (
            <div className="flex flex-col items-center justify-center w-full p-6 bg-amber-50 dark:bg-amber-950/30 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
              <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
                Stripe Connect Required
              </h4>
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center mb-3">
                Connect your Stripe account in Launchpad to accept payments
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/subaccount/${subAccountId}/launchpad`);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Go to Launchpad
              </Button>
            </div>
          );

        case "no-products":
          return (
            <div className="flex flex-col items-center justify-center w-full p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
              <Package className="h-10 w-10 text-blue-500 mb-3" />
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                No Products Added
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400 text-center mb-3">
                Add products to this funnel to enable checkout
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-300"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/subaccount/${subAccountId}/funnels/${funnelId}?tab=products`);
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </div>
          );

        case "error":
          return (
            <div className="flex flex-col items-center justify-center w-full p-6 bg-red-50 dark:bg-red-950/30 rounded-lg border-2 border-dashed border-red-300 dark:border-red-700">
              <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
              <h4 className="font-semibold text-red-700 dark:text-red-300 mb-1">
                Checkout Error
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {errorMessage || "Failed to initialize checkout"}
              </p>
            </div>
          );

        case "loading":
          return (
            <div className="flex flex-col items-center justify-center w-full p-6 bg-muted/50 rounded-lg border-2 border-dashed">
              <Loading />
              <p className="text-sm text-muted-foreground mt-3">
                Loading checkout...
              </p>
            </div>
          );

        case "ready":
          if (options.clientSecret && subAccountConnectedId) {
            return (
              <div className="text-white w-full">
                <EmbeddedCheckoutProvider
                  stripe={getStripe(subAccountConnectedId)}
                  options={options}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            );
          }
          // Fall through to placeholder
          return (
            <div className="flex flex-col items-center justify-center w-full p-6 bg-muted/50 rounded-lg border-2 border-dashed">
              <CreditCard className="h-10 w-10 text-muted-foreground mb-3" />
              <h4 className="font-semibold text-muted-foreground mb-1">
                Payment Checkout
              </h4>
              <p className="text-sm text-muted-foreground text-center">
                Checkout will appear here in preview mode
              </p>
            </div>
          );
      }
    }

    // Live mode - show actual checkout or errors
    if (paymentState === "ready" && options.clientSecret && subAccountConnectedId) {
      return (
        <div className="text-white w-full">
          <EmbeddedCheckoutProvider
            stripe={getStripe(subAccountConnectedId)}
            options={options}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      );
    }

    if (paymentState === "loading") {
      return (
        <div className="flex items-center justify-center w-full h-28">
          <Loading />
        </div>
      );
    }

    // Error states in live mode
    return (
      <div className="flex flex-col items-center justify-center w-full p-6 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">Checkout unavailable</p>
      </div>
    );
  };

  return (
    <div
      style={element.styles}
      draggable
      onClick={handleOnClickBody}
      className={cn(
        "p-0.5 w-full m-1 relative text-base min-h-7 transition-all underline-offset-4 flex items-center justify-center",
        {
          "border-blue-500 border-solid":
            editor.selectedElement.id === element.id,
          "border-dashed border": !editor.liveMode,
        }
      )}
    >
      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <Badge className="absolute -top-6 -left-0.5 rounded-none rounded-t-md bg-emerald-500 text-white">
          {editor.selectedElement.name}
        </Badge>
      )}

      <div className="border-none transition-all w-full">
        <div className="flex flex-col gap-4 w-full">
          {renderPaymentContent()}
        </div>
      </div>

      {editor.selectedElement.id === element.id && !editor.liveMode && (
        <div className="absolute bg-emerald-500 px-2.5 py-1 text-xs font-bold -top-[25px] -right-[1px] rounded-none rounded-t-lg !text-white flex items-center gap-1">
          <Trash
            className="cursor-pointer"
            size={16}
            onClick={handleDeleteElement}
          />
          <Badge
            className="cursor-pointer bg-white text-primary hover:bg-white/90"
            onClick={async (e) => {
              e.stopPropagation();
              // Create Checkout Page
              const response = await createCheckoutPage(
                subAccountId,
                funnelId,
                "Product",
                JSON.stringify([
                  {
                    ...element,
                    id: crypto.randomUUID(),
                  }
                ])
              );

              if (response) {
                toast.success("Checkout Page Created!");
                dispatch({
                  type: "UPDATE_ELEMENT",
                  payload: {
                    elementDetails: {
                      ...element,
                      type: "link",
                      content: {
                        innerText: "Buy Now",
                        href: `/${response.pathName}`
                      }
                    }
                  }
                });
              }
            }}
          >
            Create Page
          </Badge>
        </div>
      )}
    </div>
  );
};

export default EditorPayment;

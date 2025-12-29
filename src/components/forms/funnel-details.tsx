"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { v4 } from "uuid";
import { type Funnel } from "@prisma/client";

import { saveActivityLogsNotification, upsertFunnel } from "@/lib/queries";
import {
  type FunnelDetailsSchema,
  FunnelDetailsValidator,
} from "@/lib/validators/funnel-details";

import { useModal } from "@/hooks/use-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/global/file-upload";

interface FunnelDetailsProps {
  defaultData?: Funnel;
  subAccountId: string;
}

const FunnelDetails: React.FC<FunnelDetailsProps> = ({
  defaultData,
  subAccountId,
}) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<FunnelDetailsSchema>({
    mode: "onChange",
    resolver: zodResolver(FunnelDetailsValidator),
    defaultValues: {
      name: defaultData?.name || "",
      description: defaultData?.description || "",
      favicon: defaultData?.favicon || "",
      subDomainName: defaultData?.subDomainName || "",
    },
  });

  React.useEffect(() => {
    if (defaultData) {
      form.reset({
        description: defaultData.description || "",
        favicon: defaultData.favicon || "",
        name: defaultData.name || "",
        subDomainName: defaultData.subDomainName || "",
      });
    }
  }, [defaultData, form]);

  const onSubmit = async (values: FunnelDetailsSchema) => {
    if (!subAccountId) return;

    // Get current values as fallback to ensure nothing is missed
    const currentValues = form.getValues();
    const funnelData = {
      name: values.name || currentValues.name,
      description: values.description || currentValues.description || "",
      subDomainName: values.subDomainName || currentValues.subDomainName || "",
      favicon: values.favicon || currentValues.favicon || "",
      liveProducts: defaultData?.liveProducts || "[]",
    };

    console.log("Submitting funnel data:", funnelData);

    try {
      const response = await upsertFunnel(
        subAccountId,
        funnelData,
        defaultData?.id || v4()
      );

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `${defaultData ? "Updated" : "Created"} funnel | ${values.name}`,
        subaccountId: subAccountId,
      });

      if (response) {
        toast.success("Success", {
          description: "Saved funnel details",
        });
      } else {
        toast.error("Oops!", {
          description: "Could not save funnel details",
        });
      }

      setClose();
      router.refresh();
    } catch (error) {
      console.error("Error saving funnel:", error);
      toast.error("Oops!", {
        description: "Could not save funnel details",
      });
    }
  };

  const isLoading = form.formState.isLoading || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="space-y-3.5">
          <FormField
            disabled={isLoading}
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold">
                  Funnel Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter funnel name"
                    className="h-10 bg-muted/50 border-muted focus-visible:border-primary focus-visible:ring-primary/20"
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
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what this funnel is for..."
                    {...field}
                    className="resize-none min-h-[80px] bg-muted/50 border-muted focus-visible:border-primary focus-visible:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isLoading}
            control={form.control}
            name="subDomainName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold">
                  Sub Domain
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="subdomain"
                      className="h-10 bg-muted/50 border-muted focus-visible:border-primary focus-visible:ring-primary/20"
                      {...field}
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">
                      .pixora.com
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isLoading}
            control={form.control}
            name="favicon"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold">Favicon</FormLabel>
                <FormControl>
                  <FileUpload
                    apiEndpoint="subAccountLogo"
                    value={field.value as string}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setClose()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button className="flex-1" disabled={isLoading} type="submit">
            {isLoading
              ? "Saving..."
              : defaultData
                ? "Update Funnel"
                : "Create Funnel"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FunnelDetails;

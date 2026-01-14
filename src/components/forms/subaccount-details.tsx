"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type Agency, type SubAccount } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

import { saveActivityLogsNotification, upsertSubAccount } from "@/lib/queries";

import { useModal } from "@/hooks/use-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import FileUpload from "@/components/global/file-upload";
import { UpgradeDialog } from "@/components/global/upgrade-dialog";

const SubAccountDetailsValidator = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  companyEmail: z.string().email({ message: "Invalid email address" }),
  companyPhone: z.string().min(10, { message: "Phone must be at least 10 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  state: z.string().min(2, { message: "State must be at least 2 characters" }),
  zipCode: z.string().min(4, { message: "Zip code must be at least 4 characters" }),
  country: z.string().min(2, { message: "Country must be at least 2 characters" }),
  subAccountLogo: z.string().min(1, { message: "Logo is required" }),
});

type SubAccountDetailsSchema = z.infer<typeof SubAccountDetailsValidator>;

interface SubAccountDetailsProps {
  agencyDetails: Agency;
  details?: Partial<SubAccount>;
  userId: string;
  userName: string;
}

const SubAccountDetails: React.FC<SubAccountDetailsProps> = ({
  details,
  agencyDetails,
  userId,
  userName,
}) => {
  const router = useRouter();
  const { setClose } = useModal();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [planInfo, setPlanInfo] = useState({ planName: "Starter", message: "" });
  const isEditing = !!details?.id;

  const form = useForm<SubAccountDetailsSchema>({
    resolver: zodResolver(SubAccountDetailsValidator),
    defaultValues: {
      name: details?.name || "",
      companyEmail: details?.companyEmail || "",
      companyPhone: details?.companyPhone || "",
      address: details?.address || "",
      city: details?.city || "",
      state: details?.state || "",
      zipCode: details?.zipCode || "",
      country: details?.country || "",
      subAccountLogo: details?.subAccountLogo || "",
    },
  });

  // Check plan limits on mount (only for new subaccounts)
  useEffect(() => {
    if (!isEditing) {
      checkPlanLimits();
    }
  }, [isEditing]);

  async function checkPlanLimits() {
    try {
      const res = await fetch(`/api/plan-limits?agencyId=${agencyDetails.id}&type=subaccount`);
      const data = await res.json();
      
      if (!data.allowed) {
        setPlanInfo({ planName: data.planName, message: data.message });
        setShowUpgradeDialog(true);
      }
    } catch (error) {
      console.error("Failed to check plan limits:", error);
    }
  }

  async function onSubmit(values: SubAccountDetailsSchema) {
    // Check limits again before submission (for new subaccounts)
    if (!isEditing) {
      try {
        const res = await fetch(`/api/plan-limits?agencyId=${agencyDetails.id}&type=subaccount`);
        const data = await res.json();
        
        if (!data.allowed) {
          setPlanInfo({ planName: data.planName, message: data.message });
          setShowUpgradeDialog(true);
          return;
        }
      } catch (error) {
        console.error("Failed to check plan limits:", error);
      }
    }

    try {
      const currentValues = form.getValues();
      const formData = {
        name: values.name ?? currentValues.name ?? "",
        companyEmail: values.companyEmail ?? currentValues.companyEmail ?? "",
        companyPhone: values.companyPhone ?? currentValues.companyPhone ?? "",
        address: values.address ?? currentValues.address ?? "",
        city: values.city ?? currentValues.city ?? "",
        state: values.state ?? currentValues.state ?? "",
        zipCode: values.zipCode ?? currentValues.zipCode ?? "",
        country: values.country ?? currentValues.country ?? "",
        subAccountLogo: values.subAccountLogo ?? currentValues.subAccountLogo ?? "",
      };

      const subAccountData = {
        id: details?.id ? details.id : uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        agencyId: agencyDetails.id,
        connectAccountId: "",
        goal: 5000,
        ...formData,
      };

      const response = await upsertSubAccount(subAccountData);

      if (!response) throw new Error("No response from server");

      await saveActivityLogsNotification({
        agencyId: response.agencyId,
        description: `${userName} | ${isEditing ? "Updated" : "Created"} subaccount | ${response.name}`,
        subaccountId: response.id,
      });

      toast.success(isEditing ? "Subaccount updated" : "Subaccount created", {
        description: "Successfully saved your subaccount details.",
      });

      setClose();
      router.refresh();
    } catch (error: unknown) {
      console.error("Subaccount save error:", error);
      
      // Handle plan limit error
      if (error instanceof Error && error.message.startsWith("PLAN_LIMIT:")) {
        const message = error.message.replace("PLAN_LIMIT: ", "");
        setPlanInfo({ planName: "your current", message });
        setShowUpgradeDialog(true);
        return;
      }

      toast.error("Oops!", {
        description: "Could not save sub account details.",
      });
    }
  }

  useEffect(() => {
    if (details) {
      form.reset({
        name: details.name || "",
        companyEmail: details.companyEmail || "",
        companyPhone: details.companyPhone || "",
        address: details.address || "",
        city: details.city || "",
        state: details.state || "",
        zipCode: details.zipCode || "",
        country: details.country || "",
        subAccountLogo: details.subAccountLogo || "",
      });
    }
  }, [details, form]);

  const isSubmitting = form.formState.isSubmitting;

  return (
    <>
      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        title="Sub-Account Limit Reached"
        description={planInfo.message}
        currentPlan={planInfo.planName}
        agencyId={agencyDetails.id}
        feature="subaccounts"
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sub Account Information</CardTitle>
          <CardDescription>Please enter business details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                disabled={isSubmitting}
                control={form.control}
                name="subAccountLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Logo</FormLabel>
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
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isSubmitting}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input
                          required
                          placeholder="Your subaccount name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isSubmitting}
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Account Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your subaccount email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isSubmitting}
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Account Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your subaccount phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                disabled={isSubmitting}
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="20 Cooper Square" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isSubmitting}
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isSubmitting}
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isSubmitting}
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Zip Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isSubmitting}
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Account Information"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default SubAccountDetails;

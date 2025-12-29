"use client";
import React, { useEffect, useState } from "react";
import { Agency } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  updateAgencyDetails,
  deleteAgency,
  saveActivityLogsNotification,
  initUser,
  upsertAgency,
} from "@/lib/queries";
import { NumberInput } from "@tremor/react";
import { v4 } from "uuid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/global/file-upload";

type AgencyDetailsProps = {
  data?: Partial<Agency>;
};
const formSchema = z.object({
  name: z.string().min(2, {
    message: "AgencyName name must be at least 2 characters",
  }),
  companyEmail: z.string().email({
    message: "Company email is required",
  }),
  companyPhone: z.string().min(10, {
    message: "Company phone must be at least 10 characters",
  }),
  address: z.string().min(10, {
    message: "Address must be at least 10 characters",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters",
  }),
  zipCode: z.string().min(5, {
    message: "Zip code must be at least 5 characters",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters",
  }),
  agencyLogo: z.string().min(1, {
    message: "Agency logo is required",
  }),
  whiteLabel: z.boolean(),
});

const AgencyDetails = ({ data }: AgencyDetailsProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [deletingAgency, setDeletingAgency] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || "",
      companyEmail: data?.companyEmail || "",
      companyPhone: data?.companyPhone || "",
      whiteLabel: data?.whiteLabel || false,
      address: data?.address || "",
      city: data?.city || "",
      zipCode: data?.zipCode || "",
      state: data?.state || "",
      country: data?.country || "",
      agencyLogo: data?.agencyLogo || "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name || "",
        companyEmail: data.companyEmail || "",
        companyPhone: data.companyPhone || "",
        whiteLabel: data.whiteLabel || false,
        address: data.address || "",
        city: data.city || "",
        zipCode: data.zipCode || "",
        state: data.state || "",
        country: data.country || "",
        agencyLogo: data.agencyLogo || "",
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Get the current form values directly to ensure we have the latest state
      const currentValues = form.getValues();

      // Use form.getValues() as fallback if values from parameter are undefined
      const formData = {
        name: values.name ?? currentValues.name ?? "",
        companyEmail: values.companyEmail ?? currentValues.companyEmail ?? "",
        companyPhone: values.companyPhone ?? currentValues.companyPhone ?? "",
        address: values.address ?? currentValues.address ?? "",
        city: values.city ?? currentValues.city ?? "",
        state: values.state ?? currentValues.state ?? "",
        zipCode: values.zipCode ?? currentValues.zipCode ?? "",
        country: values.country ?? currentValues.country ?? "",
        agencyLogo: values.agencyLogo ?? currentValues.agencyLogo ?? "",
        whiteLabel: values.whiteLabel ?? currentValues.whiteLabel ?? false,
      };

      console.log("Form values:", formData); // Debug log

      let custId = "";
      // Create Stripe customer for new agencies
      if (!data?.id) {
        const bodyData = {
          email: formData.companyEmail,
          name: formData.name,
          shipping: {
            address: {
              city: formData.city,
              country: formData.country,
              line1: formData.address,
              postal_code: formData.zipCode,
              state: formData.state,
            },
            name: formData.name,
          },
          address: {
            city: formData.city,
            country: formData.country,
            line1: formData.address,
            postal_code: formData.zipCode,
            state: formData.state,
          },
        };

        // const customerResponse = await fetch("/api/stripe/create-customer", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify(bodyData),
        // });

        // const customerData: { customerId: string } =
        //   await customerResponse.json();
        // custId = customerData.customerId;
      }

      // Initialize user as agency owner (Clerk or JWT)
      await initUser({ role: "AGENCY_OWNER" });

      // Generate a new ID for new agencies
      const agencyId = data?.id || v4();

      // Create or update the agency
      const response = await upsertAgency({
        id: agencyId,
        name: formData.name,
        agencyLogo: formData.agencyLogo,
        companyEmail: formData.companyEmail,
        companyPhone: formData.companyPhone,
        whiteLabel: formData.whiteLabel,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        connectAccountId: "",
        customerId: custId,
        goal: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast({
        title: data?.id ? "Agency Updated" : "Agency Created",
        description: data?.id
          ? "Your agency details have been updated."
          : "Your agency has been created successfully.",
      });

      if (response) {
        // Redirect to the agency dashboard after creating a new agency
        if (!data?.id) {
          router.push(`/agency/${response.id}`);
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Could not save your agency details",
      });
    }
  };

  const handleDeleteAgency = async () => {
    if (!data?.id) return;

    setDeletingAgency(true);
    // WIP: discontinue the subscription
    try {
      await deleteAgency(data.id);
      toast({
        title: "Deleted Agency",
        description: "Deleted your agency and all subaccounts",
      });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Could not delete your agency",
      });
    }
    setDeletingAgency(false);
  };

  return (
    <AlertDialog>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Agency Details</CardTitle>
          <CardDescription>
            Let's Create Your Agency. Here you can add your agency details and
            start using the platform & later change them as you want from
            dashboard settings.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="agencyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
                        onChange={(url) => field.onChange(url || "")}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your agency name"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Email</FormLabel>
                      <FormControl>
                        <Input
                          readOnly
                          placeholder="Email"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="whiteLabel"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>Whitelabel Agency</FormLabel>
                        <FormDescription>
                          Turning on whilelabel mode will show your agency logo
                          to all sub accounts by default. You can overwrite this
                          functionality through sub account settings.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 st..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="State"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Zipcode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Zipcode"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Country"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Agency Information"}
              </Button>
            </form>
          </Form>
          {data?.id && (
            <div className="flex flex-col gap-2 mb-4 mt-4">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Create A Goal
              </label>
              <p className="text-sm text-muted-foreground">
                ✨ Create a goal for your agency. As your business grows your
                goals grow too so don't forget to set the bar higher!
              </p>
              <NumberInput
                defaultValue={data?.goal ?? 1}
                onValueChange={async (val: number) => {
                  if (!data?.id) return;
                  await updateAgencyDetails(data.id, { goal: val });
                  await saveActivityLogsNotification({
                    agencyId: data.id,
                    description: `Updated the agency goal to | ${val} Sub Account`,
                    subaccountId: undefined,
                  });
                  router.refresh();
                }}
                min={1}
                className="bg-background !border !border-input"
                placeholder="Sub Account Goal"
              />
            </div>
          )}
          {data?.id && (
            <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
              <div className="flex-1">
                <div className="font-semibold text-destructive mb-1">
                  Danger Zone
                </div>
                <div className="text-sm text-muted-foreground">
                  Deleting your agency cannot be undone. This will also delete
                  all sub accounts and all data related to your sub accounts.
                  Sub accounts will no longer have access to funnels, contacts
                  etc.
                </div>
              </div>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoading || deletingAgency}
                  className="whitespace-nowrap"
                >
                  {deletingAgency ? "Deleting..." : "Delete Agency"}
                </Button>
              </AlertDialogTrigger>
            </div>
          )}

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action cannot be undone. This will permanently delete the
                Agency account and all related sub accounts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingAgency}
                className="bg-destructive hover:bg-destructive"
                onClick={handleDeleteAgency}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default AgencyDetails;

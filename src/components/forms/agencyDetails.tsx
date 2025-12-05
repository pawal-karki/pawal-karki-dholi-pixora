"use client";
import React from "react";
import { Agency } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AlertDialog } from "@/components/ui/alert-dialog";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const agencyDetails = ({ data }: AgencyDetailsProps) => {
  const toast = useToast();
  const router = useRouter();
  const [deletingAgency, setDeletingAgency] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || "",
      companyEmail: data?.companyEmail || "",
      companyPhone: data?.companyPhone || "",
      address: data?.address || "",
      city: data?.city || "",
      state: data?.state || "",
      zipCode: data?.zipCode || "",
      country: data?.country || "",
      agencyLogo: data?.agencyLogo || "",
      whiteLabel: data?.whiteLabel || false,
    },
  });
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name || "",
        companyEmail: data.companyEmail || "",
        companyPhone: data.companyPhone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zipCode || "",
        country: data.country || "",
        agencyLogo: data.agencyLogo || "",
        whiteLabel: data.whiteLabel || false,
      });
    }
  }, [data, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };
  const isLoading = form.formState.isSubmitting;

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default agencyDetails;

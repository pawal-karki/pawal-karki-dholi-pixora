"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createMedia, saveActivityLogsNotification } from "@/lib/queries";

import { useModal } from "@/hooks/use-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/global/file-upload";

import {
  UploadMediaValidator,
  type UploadMediaSchema,
} from "@/lib/validators/upload-media";

interface UploadMediaFormProps {
  subAccountId: string;
}

const UploadMediaForm: React.FC<UploadMediaFormProps> = ({ subAccountId }) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<UploadMediaSchema>({
    resolver: zodResolver(UploadMediaValidator),
    mode: "onSubmit",
    defaultValues: {
      link: "",
      name: "",
    },
  });

  const onSubmit: SubmitHandler<UploadMediaSchema> = async (values) => {
    try {
      const response = await createMedia(subAccountId, values);

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Uploaded a media file | ${response.name}`,
        subAccountId,
      });

      setClose();
      toast.success("Success", {
        description: "Uploaded media file",
      });

      router.refresh();
    } catch (error) {
      toast.error("Failed", {
        description: "Could not uploaded media",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Information</CardTitle>
        <CardDescription>
          Please enter the details for your file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              disabled={isSubmitting}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>File name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your file name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              disabled={isSubmitting}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Media file</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      apiEndpoint="media"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              disabled={isSubmitting}
              type="submit"
              className="mt-4 w-full"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UploadMediaForm;

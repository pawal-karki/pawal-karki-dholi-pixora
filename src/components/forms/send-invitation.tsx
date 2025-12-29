"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { sendInvitationAction } from "@/lib/actions/invite-actions";
import { saveActivityLogsNotification } from "@/lib/queries";
import { useModal } from "@/hooks/use-modal";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SendInvitationValidator = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["AGENCY_ADMIN", "SUBACCOUNT_USER", "SUBACCOUNT_GUEST"]),
});

type SendInvitationSchema = z.infer<typeof SendInvitationValidator>;

interface SendInvitationProps {
  agencyId: string;
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<SendInvitationSchema>({
    resolver: zodResolver(SendInvitationValidator),
    defaultValues: {
      email: "",
      role: "SUBACCOUNT_USER",
    },
  });

  async function onSubmit(values: SendInvitationSchema) {
    console.log("FORM SUBMITTING:", { agencyId, values });
    try {
      const formValues = form.getValues();

      if (!formValues.email || !formValues.role) {
        toast.error("Missing fields", { description: "Please check email and role" });
        return;
      }

      const formData = new FormData();
      formData.append("email", formValues.email);
      formData.append("role", formValues.role);
      formData.append("agencyId", agencyId);

      console.log("Submitting invitation logic...");
      const response = await sendInvitationAction(formData);
      console.log("Invitation server response:", response);

      if (response?.error) {
        console.log("Showing error toast:", response.error);
        toast.error("Error", { description: response.error });
        form.setError("email", { message: response.error });
        return;
      }

      await saveActivityLogsNotification({
        agencyId,
        description: `Invited ${formValues.email}`,
        subaccountId: undefined,
      });

      toast.success("Success", {
        description: response?.success || `Invitation sent to ${formValues.email}`,
      });

      setClose();
      router.refresh();
    } catch (error) {
      toast.error("Oops!", {
        description: "Could not send invitation.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Invitation</CardTitle>
        <CardDescription>
          An invitation will be sent to the user. Users who already have an
          invitation sent out to their email, will not receive another
          invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                      <SelectItem value="SUBACCOUNT_USER">
                        Sub Account User
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SendInvitation;


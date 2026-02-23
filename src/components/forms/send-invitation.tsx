"use client";

import React, { useState, useEffect } from "react";
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
import { UpgradeDialog } from "@/components/global/upgrade-dialog";

import { SubAccount } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";

const SendInvitationValidator = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["AGENCY_ADMIN", "SUBACCOUNT_USER", "SUBACCOUNT_GUEST"]),
  subAccountIds: z.array(z.string()).optional(),
});

type SendInvitationSchema = z.infer<typeof SendInvitationValidator>;

interface SendInvitationProps {
  agencyId: string;
  subAccounts: SubAccount[];
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId, subAccounts }) => {
  const router = useRouter();
  const { setClose } = useModal();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [planInfo, setPlanInfo] = useState({ planName: "Starter", message: "" });

  const form = useForm<SendInvitationSchema>({
    resolver: zodResolver(SendInvitationValidator),
    defaultValues: {
      email: "",
      role: "SUBACCOUNT_USER",
      subAccountIds: [],
    },
  });

  const selectedRole = form.watch("role");

  // Check plan limits on mount
  useEffect(() => {
    checkPlanLimits();
  }, []);

  async function checkPlanLimits() {
    try {
      const res = await fetch(`/api/plan-limits?agencyId=${agencyId}&type=team`);
      const data = await res.json();

      if (!data.allowed) {
        setPlanInfo({ planName: data.planName, message: data.message });
        setShowUpgradeDialog(true);
      }
    } catch (error) {
      console.error("Failed to check plan limits:", error);
    }
  }

  async function onSubmit(values: SendInvitationSchema) {
    // Check limits again before submission
    try {
      const res = await fetch(`/api/plan-limits?agencyId=${agencyId}&type=team`);
      const data = await res.json();

      if (!data.allowed) {
        setPlanInfo({ planName: data.planName, message: data.message });
        setShowUpgradeDialog(true);
        return;
      }
    } catch (error) {
      console.error("Failed to check plan limits:", error);
    }

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

      if (formValues.subAccountIds && formValues.subAccountIds.length > 0) {
        formData.append("subAccountIds", JSON.stringify(formValues.subAccountIds));
      }

      const response = await sendInvitationAction(formData);

      if (response?.error) {
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
    <>
      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        title="Team Member Limit Reached"
        description={planInfo.message}
        currentPlan={planInfo.planName}
        agencyId={agencyId}
        feature="team"
      />

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

              {(selectedRole === "SUBACCOUNT_USER" || selectedRole === "SUBACCOUNT_GUEST") && subAccounts && subAccounts.length > 0 && (
                <div className="flex flex-col gap-3 py-2">
                  <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Assign Subaccounts
                  </div>
                  <CardDescription className="mb-2">
                    Select which subaccounts this team member will have access to.
                  </CardDescription>
                  <FormField
                    control={form.control}
                    name="subAccountIds"
                    render={() => (
                      <FormItem className="space-y-3">
                        {subAccounts.map((subAccount) => (
                          <FormField
                            key={subAccount.id}
                            control={form.control}
                            name="subAccountIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={subAccount.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(subAccount.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), subAccount.id])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== subAccount.id
                                            )
                                          )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex-1">
                                    {subAccount.name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default SendInvitation;

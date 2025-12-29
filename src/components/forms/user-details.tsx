"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type SubAccount, type User, Role } from "@prisma/client";
import * as z from "zod";

import {
  updateUser,
  changeUserPermissions,
  saveActivityLogsNotification,
  getAuthUser,
} from "@/lib/queries";
import { useModal } from "@/hooks/use-modal";

import {
  Form,
  FormControl,
  FormDescription,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import FileUpload from "@/components/global/file-upload";

const UserDetailsValidator = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  avatarUrl: z.string().optional(),
  role: z.enum([
    Role.AGENCY_OWNER,
    Role.AGENCY_ADMIN,
    Role.SUBACCOUNT_USER,
    Role.SUBACCOUNT_GUEST,
  ]),
});

type UserDetailsSchema = z.infer<typeof UserDetailsValidator>;

interface UserDetailsProps {
  id: string | null;
  type: "agency" | "subaccount";
  userData?: Partial<User>;
  subAccounts?: SubAccount[];
}

const UserDetailsForm: React.FC<UserDetailsProps> = ({
  id,
  type,
  userData,
  subAccounts,
}) => {
  const router = useRouter();
  const { data, setClose } = useModal();
  const [roleState, setRoleState] = React.useState<string>("");
  const [loadingPermissions, setLoadingPermissions] =
    React.useState<boolean>(false);
  const [subAccountPermissions, setSubAccountPermissions] = React.useState<
    {
      subAccountId: string;
      access: boolean;
      permissionId?: string;
    }[]
  >([]);

  const authUserData = data?.user;

  const form = useForm<UserDetailsSchema>({
    resolver: zodResolver(UserDetailsValidator),
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      avatarUrl: userData?.avatarUrl || "",
      role: userData?.role || Role.SUBACCOUNT_USER,
    },
  });

  React.useEffect(() => {
    if (authUserData) {
      form.reset({
        name: authUserData.name || "",
        email: authUserData.email || "",
        avatarUrl: authUserData.avatarUrl || "",
        role: authUserData.role || Role.SUBACCOUNT_USER,
      });
    }
    if (userData) {
      form.reset({
        name: userData.name || "",
        email: userData.email || "",
        avatarUrl: userData.avatarUrl || "",
        role: userData.role || Role.SUBACCOUNT_USER,
      });
    }
  }, [authUserData, userData, form]);

  React.useEffect(() => {
    if (!data?.user) return;
    const getPermissions = async () => {
      if (!data.user) return;
      const permission = await getAuthUser(data.user.email);
      const permissions = permission?.Permissions || [];
      setSubAccountPermissions(
        permissions.map((perm) => ({
          subAccountId: perm.subAccountId,
          access: perm.access,
          permissionId: perm.id,
        }))
      );
    };
    getPermissions();
  }, [data?.user]);

  async function onSubmit(values: UserDetailsSchema) {
    if (!id) return;
    if (userData?.role === "AGENCY_OWNER") return;

    try {
      await updateUser(values);

      await saveActivityLogsNotification({
        agencyId: type === "agency" ? id : undefined,
        description: `Updated ${values.name}'s information`,
        subaccountId: type === "subaccount" ? id : undefined,
      });

      toast.success("User information saved", {
        description: "Successfully saved user information.",
      });

      setClose();
      router.refresh();
    } catch (error) {
      toast.error("Oops!", {
        description: "Could not save user information.",
      });
    }
  }

  const onChangePermission = async (
    subAccountId: string,
    access: boolean,
    permissionId: string | undefined
  ) => {
    if (!data?.user?.email) return;
    setLoadingPermissions(true);

    const response = await changeUserPermissions(
      permissionId,
      data.user.email,
      subAccountId,
      access
    );

    if (response) {
      toast.success("Permission updated", {
        description: "User permission has been updated.",
      });

      if (subAccountPermissions) {
        const existingPermissionIndex = subAccountPermissions.findIndex(
          (perm) => perm.subAccountId === subAccountId
        );

        if (existingPermissionIndex !== -1) {
          const updated = [...subAccountPermissions];
          updated[existingPermissionIndex] = {
            ...updated[existingPermissionIndex],
            access,
            permissionId: response.id,
          };
          setSubAccountPermissions(updated);
        } else {
          setSubAccountPermissions([
            ...subAccountPermissions,
            {
              subAccountId,
              access,
              permissionId: response.id,
            },
          ]);
        }
      }
    } else {
      toast.error("Could not update permission");
    }

    router.refresh();
    setLoadingPermissions(false);
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === "AGENCY_OWNER" ||
                        !!authUserData?.email
                      }
                      placeholder="Email"
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select
                    disabled={field.value === "AGENCY_OWNER"}
                    onValueChange={(value) => {
                      if (
                        value === "SUBACCOUNT_USER" ||
                        value === "SUBACCOUNT_GUEST"
                      ) {
                        setRoleState(
                          "You need to have subaccounts to assign Subaccount access to team members."
                        );
                      } else {
                        setRoleState("");
                      }
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                      {(userData?.role === "AGENCY_OWNER" ||
                        authUserData?.role === "AGENCY_OWNER") && (
                        <SelectItem value="AGENCY_OWNER">
                          Agency Owner
                        </SelectItem>
                      )}
                      <SelectItem value="SUBACCOUNT_USER">
                        Sub Account User
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save User Information"}
            </Button>

            {authUserData?.role === "AGENCY_OWNER" && (
              <div>
                <Separator className="my-4" />
                <Label className="text-base font-semibold">
                  User Permissions
                </Label>
                <p className="text-sm text-muted-foreground mb-4 mt-1">
                  You can give Sub Account access to team members by toggling
                  access control for each Sub Account. This is only visible to
                  agency owners.
                </p>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAccount) => {
                    const subAccountPermissionDetails =
                      subAccountPermissions.find(
                        (p) => p.subAccountId === subAccount.id
                      );
                    return (
                      <div
                        key={subAccount.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionDetails?.access}
                          onCheckedChange={(access) =>
                            onChangePermission(
                              subAccount.id,
                              access,
                              subAccountPermissionDetails?.permissionId
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserDetailsForm;

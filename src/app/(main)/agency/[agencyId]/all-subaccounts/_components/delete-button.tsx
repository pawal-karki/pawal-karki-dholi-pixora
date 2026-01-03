"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteSubAccount, getSubAccountDetails, saveActivityLogsNotification } from "@/lib/queries";

import { AlertDialogAction } from "@/components/ui/alert-dialog";

interface DeleteButtonProps {
  subAccountId: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ subAccountId }) => {
  const router = useRouter();

  const onClickDelete = async () => {
    try {
      const response = await getSubAccountDetails(subAccountId);

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a subaccount | ${response?.name}`,
        subaccountId: subAccountId,
      });
      await deleteSubAccount(subAccountId);

      toast.success("Subaccount deleted", {
        description: "The subaccount has been deleted successfully.",
      });

      router.refresh();
    } catch (error) {
      toast.error("Could not delete subaccount");
    }
  };

  return (
    <AlertDialogAction
      onClick={onClickDelete}
      className="bg-destructive hover:bg-destructive"
    >
      Delete subaccount
    </AlertDialogAction>
  );
};

export default DeleteButton;


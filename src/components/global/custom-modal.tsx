"use client";

import React from "react";

import { useModal } from "@/hooks/use-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomModalProps {
  title: string;
  subTitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  children,
  defaultOpen,
  subTitle,
  title,
}) => {
  const { isOpen, setClose } = useModal();

  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent className="bg-card max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="text-left pb-3 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          {subTitle && (
            <DialogDescription className="mt-1.5">{subTitle}</DialogDescription>
          )}
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-1 -mr-1 custom-scrollbar">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;

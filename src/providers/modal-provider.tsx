"use client";

import React from "react";
import {
  type Plan,
  type Agency,
  type Contact,
  type User,
} from "@prisma/client";
import type { PriceList, TicketDetails } from "@/lib/types";

export interface ModalData {
  user?: User;
  agency?: Agency;
  contact?: Contact;
  ticket?: TicketDetails;
  plans?: {
    defaultPriceId: Plan;
    plans: PriceList["data"];
  };
}

interface ModalContextType {
  data: ModalData;
  isOpen: boolean;
  setOpen: (modal: React.ReactNode, fetch?: () => Promise<unknown>) => void;
  setClose: () => void;
}

export const ModalContext = React.createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: (_modal: React.ReactNode, _fetch?: () => Promise<unknown>) => { },
  setClose: () => { },
});

export const ModalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);
  const [data, setData] = React.useState<ModalData>({});
  const [currentModal, setCurrentModal] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const setOpen: ModalContextType["setOpen"] = async (modal, fetch) => {
    if (modal) {
      if (fetch) {
        const newData = await fetch();
        if (newData && typeof newData === 'object') {
          setData({ ...data, ...(newData as ModalData) });
        }
      }

      setCurrentModal(modal);
      setIsOpen(true);
    }
  };

  const setClose = () => {
    setIsOpen(false);
    setData({});
  };

  // Always render the Provider to maintain consistent hook count
  // Only render modal content after client-side mount
  return (
    <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
      {children}
      {isMounted && currentModal}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within the ModalProvider");
  }
  return context;
};



import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ModalProvider } from "@/providers/modal-provider";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <ModalProvider>{children}</ModalProvider>
    </ClerkProvider>
  );
};

export default layout;

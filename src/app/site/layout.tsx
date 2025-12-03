import React from "react";
import Navigation from "@/components/site/navigations";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <main className="h-full">
        <Navigation />
        {children}
      </main>
    </ClerkProvider>
  );
};

export default layout;

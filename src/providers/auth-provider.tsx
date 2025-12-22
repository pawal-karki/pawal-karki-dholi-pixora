"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

type AuthProviderProps = {
  children: React.ReactNode;
};

/**
 * AuthProvider - Always wraps children with ClerkProvider for consistency
 * 
 * ClerkProvider must always be present to avoid React hooks count mismatch
 * since it internally uses hooks. The app handles dual auth (JWT + Clerk)
 * at the component level, not the provider level.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Always wrap with ClerkProvider for consistent hook count
  // Individual components check auth method when needed
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      {children}
    </ClerkProvider>
  );
}



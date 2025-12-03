"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useEffect, useState } from "react";

type AuthProviderProps = {
  children: React.ReactNode;
};

/**
 * AuthProvider - Conditionally wraps children with ClerkProvider
 *
 * - If user is authenticated via JWT (auth_token cookie), ClerkProvider is not used
 * - If user is authenticated via Clerk OAuth, ClerkProvider is active
 * - On public pages, ClerkProvider is available for OAuth login options
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authMethod, setAuthMethod] = useState<"jwt" | "clerk" | "none">(
    "none"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check for JWT token in localStorage
    const jwtToken = localStorage.getItem("auth_token");

    if (jwtToken) {
      setAuthMethod("jwt");
    } else {
      // Default to clerk for OAuth support
      setAuthMethod("clerk");
    }
  }, []);

  // During SSR or before mount, render with ClerkProvider for OAuth support
  if (!mounted) {
    return (
      <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>
    );
  }

  // If authenticated via JWT, don't wrap with ClerkProvider
  if (authMethod === "jwt") {
    return <>{children}</>;
  }

  // For Clerk auth or unauthenticated users (for OAuth options)
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>
  );
}


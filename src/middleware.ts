import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require any authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/site(.*)",
  "/api/uploadthing(.*)",
  "/api/auth(.*)",
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
  "/agency/forgot-password(.*)",
  "/agency/reset-password(.*)",
  "/sso-callback(.*)",
]);

// Auth pages where signed-in users should be redirected away
const isAuthPage = createRouteMatcher([
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    const url = req.nextUrl;
    const searchParams = url.searchParams.toString();
    const hostname = req.headers;

    const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
      }`;

    // Check for custom subdomain
    const host = hostname.get("host") || "";

    // Handle Vercel domain format: subdomain.project.vercel.app or subdomain.custom-domain.com
    let customSubDomain: string | null = null;

    if (process.env.NEXT_PUBLIC_DOMAIN) {
      // If NEXT_PUBLIC_DOMAIN is set, use it to extract subdomain
      // Example: NEXT_PUBLIC_DOMAIN = "pawal-karki-dholi-pixora.vercel.app"
      // Host = "sohail.pawal-karki-dholi-pixora.vercel.app"
      // Result: "sohail"
      const baseDomain = process.env.NEXT_PUBLIC_DOMAIN;

      // Check if host includes the base domain and is NOT the base domain itself
      if (host.includes(baseDomain) && host !== baseDomain) {
        // Prepare subDomain extraction
        // Remove port number if present (e.g. localhost:3000)
        const hostWithoutPort = host.split(":")[0];
        const baseDomainWithoutPort = baseDomain.split(":")[0];

        // Extract subdomain part
        customSubDomain = hostWithoutPort
          .replace(baseDomainWithoutPort, "")
          .replace(/\.$/, "")  // Remove trailing dot
          .replace(/^\./, "")  // Remove leading dot
          .trim();
      }
    } else {
      // Fallback: Check if host has multiple parts (subdomain exists)
      // For Vercel: subdomain.project.vercel.app has 3+ parts
      // For localhost: localhost:3000 has 1 part (no subdomain) / subdomain.localhost:3000 has 2 parts

      // Remove port
      const hostWithoutPort = host.split(":")[0];
      const hostParts = hostWithoutPort.split(".");

      // logic for localhost (needs 2 parts: sub.localhost)
      if (hostWithoutPort.includes("localhost") && hostParts.length >= 2) {
        customSubDomain = hostParts[0];
      }
      // logic for vercel/production (needs 3 parts: sub.project.vercel.app)
      else if (!hostWithoutPort.includes("localhost") && hostParts.length >= 3) {
        // Check if it's not a known TLD pattern (e.g., www, api, etc.)
        const firstPart = hostParts[0];
        const knownPrefixes = ["www", "api", "app", "admin"];
        if (!knownPrefixes.includes(firstPart.toLowerCase())) {
          customSubDomain = firstPart;
        }
      }
    }

    // If subdomain exists and is not empty, rewrite to subdomain route (but NOT for API routes)
    if (customSubDomain && customSubDomain.trim() !== "" && !url.pathname.startsWith("/api")) {
      try {
        // Clean the subdomain to prevent issues
        const cleanSubDomain = customSubDomain.trim().toLowerCase();

        // Prevent infinite loops by checking if we're already on a domain route
        if (!url.pathname.startsWith(`/${cleanSubDomain}`)) {
          return NextResponse.rewrite(
            new URL(`/${cleanSubDomain}${pathWithSearchParams}`, req.url)
          );
        }
      } catch (error) {
        console.error("Error rewriting subdomain:", error);
        // Fall through to continue processing
      }
    }

    // Redirect /sign-in and /sign-up to /agency/sign-in
    if (url.pathname === "/sign-in" || url.pathname === "/sign-up") {
      return NextResponse.redirect(new URL("/agency/sign-in", req.url));
    }

    // Rewrite root to /site (only if no subdomain was detected)
    if (!customSubDomain && (
      url.pathname === "/" ||
      (url.pathname === "/site" && (!process.env.NEXT_PUBLIC_DOMAIN || url.host === process.env.NEXT_PUBLIC_DOMAIN))
    )) {
      return NextResponse.rewrite(new URL("/site", req.url));
    }

    // Check for JWT token in cookies
    const jwtToken = req.cookies.get("auth_token")?.value;
    const hasJwtAuth = !!jwtToken;

    // Get Clerk session (wrapped in try/catch — dev keys or rate limits can throw in production)
    let hasClerkAuth = false;
    try {
      const session = await auth();
      hasClerkAuth = !!session.userId;
    } catch (clerkError) {
      console.warn("[middleware] Clerk auth() failed, falling back to JWT only:", clerkError);
    }

    // If user is signed in (either method) and trying to access auth pages, redirect
    if ((hasClerkAuth || hasJwtAuth) && isAuthPage(req)) {
      return NextResponse.redirect(new URL("/agency", req.url));
    }

    // For agency and subaccount routes
    if (
      url.pathname.startsWith("/agency") ||
      url.pathname.startsWith("/subaccount")
    ) {
      return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Return a proper response instead of crashing
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};


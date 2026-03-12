import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { resolveCustomSubdomain } from "@/lib/subdomain";

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

    const pathWithSearchParams = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

    const host = hostname.get("host") || "";
    const customSubDomain = resolveCustomSubdomain(
      host,
      process.env.NEXT_PUBLIC_DOMAIN,
    );

    // If subdomain exists and is not empty, rewrite to subdomain route (but NOT for API routes)
    if (
      customSubDomain &&
      customSubDomain.trim() !== "" &&
      !url.pathname.startsWith("/api")
    ) {
      try {
        // Clean the subdomain to prevent issues
        const cleanSubDomain = customSubDomain.trim().toLowerCase();

        // Prevent infinite loops by checking if we're already on a domain route
        if (!url.pathname.startsWith(`/${cleanSubDomain}`)) {
          return NextResponse.rewrite(
            new URL(`/${cleanSubDomain}${pathWithSearchParams}`, req.url),
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
    if (
      !customSubDomain &&
      (url.pathname === "/" ||
        (url.pathname === "/site" &&
          (!process.env.NEXT_PUBLIC_DOMAIN ||
            url.host === process.env.NEXT_PUBLIC_DOMAIN)))
    ) {
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
      console.warn(
        "[middleware] Clerk auth() failed, falling back to JWT only:",
        clerkError,
      );
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

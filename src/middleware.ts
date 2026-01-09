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
  const url = req.nextUrl;
  const searchParams = url.searchParams.toString();
  const hostname = req.headers;

  const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

  // Check for custom subdomain
  const customSubDomain = hostname
    .get("host")
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

  // If subdomain exists, rewrite to subdomain route (but NOT for API routes)
  if (customSubDomain && !url.pathname.startsWith("/api")) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
    );
  }

  // Redirect /sign-in and /sign-up to /agency/sign-in
  if (url.pathname === "/sign-in" || url.pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/agency/sign-in", req.url));
  }

  // Rewrite root to /site
  if (
    url.pathname === "/" ||
    (url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL("/site", req.url));
  }

  // Check for JWT token in cookies
  const jwtToken = req.cookies.get("auth_token")?.value;
  const hasJwtAuth = !!jwtToken;

  // Get Clerk session
  const session = await auth();
  const hasClerkAuth = !!session.userId;

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
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};


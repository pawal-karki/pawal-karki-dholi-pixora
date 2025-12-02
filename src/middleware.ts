import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Auth pages where signed-in users should be redirected away
const isAuthPage = createRouteMatcher([
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const session = await auth();

  // If user is already signed in via Clerk and trying to access auth pages, redirect to dashboard
  if (session.userId && isAuthPage(request)) {
    const url = new URL("/agency", request.url);
    return NextResponse.redirect(url);
  }

  // All routes are public - Clerk is only used for login, not route protection
  // Your own auth system handles route protection separately
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run middleware for all routes EXCEPT static files + _next/*
    "/((?!_next|.*\\..*).*)",

    // Always run on API & tRPC routes
    "/(api|trpc)(.*)",
  ],
};

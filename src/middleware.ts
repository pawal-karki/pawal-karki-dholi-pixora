import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes that should NOT be protected by Clerk
const isPublicRoute = createRouteMatcher([
  "/site",
  // Auth APIs (custom JWT auth) must be public so they can return JSON
  "/api/auth(.*)",

  // Auth pages (route groups are not part of the URL)
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
  "/agency/forgot-password(.*)",
  "/agency/reset-password(.*)",

  // all UploadThing routes are public
  "/api/uploadthing(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    // Run middleware for all routes EXCEPT static files + _next/*
    "/((?!_next|.*\\..*).*)",

    // Always run on API & tRPC routes
    "/(api|trpc)(.*)",
  ],
};

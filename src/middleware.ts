import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/terms",
  "/privacy",
  "/book(.*)",
]); // createRouteMatcher called with req object, return true if user is trying to access a route that matches one route in createRouteMatcher() array.

export default clerkMiddleware(async (auth, req) => {
  // If user is not authenticated, redirected to the sign-in page
  if (!isPublicRoute(req)) await auth.protect(); // All other routes require authentication by default
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

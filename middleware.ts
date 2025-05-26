// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'; // Make sure to import NextResponse

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Protects /dashboard and any sub-routes
]);

// The middleware function itself needs to be async to use await inside it
export default clerkMiddleware(async (authProvider, req) => {
  const authObject = await authProvider();
  const { userId, redirectToSignIn } = authObject;

  // 1. If the user is logged in AND they are trying to access the root page ('/'),
  //    redirect them to the dashboard.
  if (userId && req.nextUrl.pathname === '/') {
    const dashboardUrl = new URL('/dashboard', req.url); // Construct absolute URL for redirection
    return NextResponse.redirect(dashboardUrl);
  }

  // 2. If it's a protected route (e.g., /dashboard itself) and the user is NOT signed in,
  //    redirect them to the sign-in page.
  if (isProtectedRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  // 3. For all other cases, Clerk's default behavior is to allow the request to proceed.
  //    This includes:
  //    - Logged-out user visiting the root page '/' (they will see the landing page).
  //    - Logged-in user visiting a non-root, non-protected page (if any).
  //    - Logged-in user already on /dashboard or its sub-routes.
  //    No explicit `return NextResponse.next()` is needed here as `clerkMiddleware` handles it.
});

export const config = {
  matcher: [
    // This pattern matches all routes except for static files, images, favicon,
    // and any routes explicitly marked as public under /api/public (if you had such routes).
    '/((?!_next/static|_next/image|favicon.ico|api/public).*)',
    // Ensure the root path is matched. The previous pattern already covers it,
    // but being explicit or ensuring your main pattern covers it is key.
    '/',
  ],
};
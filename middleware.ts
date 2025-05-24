// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Protects /dashboard and any sub-routes
]);

// The middleware function itself needs to be async to use await inside it
export default clerkMiddleware(async (authProvider, req) => { // Renamed 'auth' to 'authProvider' for clarity
  // Await the promise returned by authProvider() to get the actual auth object
  const authObject = await authProvider(); 

  const { userId, redirectToSignIn } = authObject; // Destructure from the resolved authObject

  if (isProtectedRoute(req)) {
    if (!userId) {
      // If it's a protected route and the user is not signed in,
      // redirect them to the sign-in page.
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/public).*)',
    '/',
  ],
};
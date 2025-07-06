// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Export the middleware config first
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

export default withAuth(
  function middleware(req) {
    const isAuthenticated = !!req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in')
    const isPublicPage = req.nextUrl.pathname === '/'

    // If user is authenticated and trying to access auth page, redirect to dashboard
    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is authenticated and on home page, redirect to dashboard
    if (isAuthenticated && isPublicPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in')
        const isPublicPage = req.nextUrl.pathname === '/'
        
        // Allow public pages and auth pages without authentication
        if (isAuthPage || isPublicPage) {
          return true
        }

        // Require authentication for all other pages
        return !!token
      },
    },
  }
)
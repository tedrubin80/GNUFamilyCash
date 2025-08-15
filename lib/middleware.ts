// File: middleware.ts

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
    const isAPIRoute = req.nextUrl.pathname.startsWith('/api')

    // Allow API routes to handle their own auth
    if (isAPIRoute) {
      return NextResponse.next()
    }

    // Redirect to login if not authenticated and not on login page
    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Redirect away from login if already authenticated
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Check admin access for admin pages
    if (isAdminPage && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page always
        if (req.nextUrl.pathname.startsWith('/login')) {
          return true
        }
        
        // Allow API routes to handle their own auth
        if (req.nextUrl.pathname.startsWith('/api')) {
          return true
        }
        
        // Require auth for all other pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
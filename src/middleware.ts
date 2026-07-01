import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware for rate limiting on API routes
export function middleware(request: NextRequest) {
  // Rate limiting logic handled per-endpoint in their route handlers
  // This middleware is a placeholder for future global middleware needs
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
}

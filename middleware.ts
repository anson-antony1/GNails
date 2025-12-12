import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Cookie names (must match auth.ts)
const OWNER_COOKIE = 'gnail_owner_session'
const STAFF_COOKIE = 'gnail_staff_session'

// Routes configuration
const PUBLIC_ROUTES = ['/', '/feedback', '/login']
const OWNER_ONLY_ROUTES = ['/dashboard', '/issues', '/review-insights', '/today', '/api/dashboard', '/api/issues', '/api/review-insights']
const STAFF_OR_OWNER_ROUTES = ['/check-in']

/**
 * Verify JWT token and extract session
 */
async function verifyToken(token: string): Promise<{ role: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload as { role: string }
  } catch {
    return null
  }
}

/**
 * Get session from request cookies
 */
async function getSession(request: NextRequest) {
  // Check owner session first (higher privilege)
  const ownerToken = request.cookies.get(OWNER_COOKIE)?.value
  if (ownerToken) {
    const session = await verifyToken(ownerToken)
    if (session) return session
  }
  
  // Check staff session
  const staffToken = request.cookies.get(STAFF_COOKIE)?.value
  if (staffToken) {
    const session = await verifyToken(staffToken)
    if (session) return session
  }
  
  return null
}

/**
 * Check if path matches any route pattern
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname === route || pathname.startsWith(route + '/')
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('/favicon') ||
    pathname.includes('/.') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Allow public API routes (feedback submission, etc.)
  if (pathname.startsWith('/api/feedback/') && pathname.endsWith('/submit')) {
    return NextResponse.next()
  }
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }
  if (pathname.startsWith('/api/cron/')) {
    // TODO: Add cron secret verification in production
    return NextResponse.next()
  }

  // Get current session
  const session = await getSession(request)

  // Protect owner-only routes
  if (matchesRoute(pathname, OWNER_ONLY_ROUTES)) {
    if (!session || session.role !== 'owner') {
      return NextResponse.redirect(new URL('/login/owner', request.url))
    }
    return NextResponse.next()
  }

  // Protect staff or owner routes
  if (matchesRoute(pathname, STAFF_OR_OWNER_ROUTES)) {
    if (!session) {
      return NextResponse.redirect(new URL('/login/staff', request.url))
    }
    return NextResponse.next()
  }

  // Default: require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/login/owner', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

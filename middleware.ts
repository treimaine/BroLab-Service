import { resolveTenancy } from '@/platform/tenancy/edge-router'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Clerk Middleware with Tenancy Resolution
 * 
 * Requirements: 1.6, 2.1, 2.2, 2.3, 2.4, Req 1
 * 
 * Flow:
 * 1. Clerk authentication runs FIRST
 * 2. Check if user is authenticated
 * 3. Check user role from auth().sessionClaims.unsafeMetadata.role
 * 4. Redirect to /onboarding if role is missing
 * 5. Protect /studio/* routes (require provider role: producer or engineer)
 * 6. Protect /artist/* routes (require artist role)
 * 7. Allow public access to hub routes (/, /pricing, /about, etc.)
 * 8. THEN tenancy resolution runs (hostname → workspace slug → rewrite to /_t/[slug])
 */

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // Legacy webhook namespace
  '/api/stripe/checkout(.*)', // Stripe checkout session creation
  '/api/stripe/webhook(.*)', // Stripe webhook deliveries
  '/api/clerk/webhook(.*)', // Clerk webhook deliveries
  '/api/clerk/billing/webhook(.*)', // Clerk Billing webhook deliveries
])

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://connect.stripe.com",
  "frame-ancestors 'none'",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://connect-js.stripe.com https://*.clerk.accounts.dev https://clerk.brolabentertainment.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://connect-js.stripe.com https://*.clerk.accounts.dev https://clerk.brolabentertainment.com https://vercel.live",
  "style-src 'self' 'unsafe-inline' https:",
  "connect-src 'self' https: ws: wss:",
  "worker-src 'self' blob:", // Allow Web Workers from blob URLs (required for Clerk)
].join('; ')

function applyCorsHeaders(response: NextResponse, req: Request, pathname: string): NextResponse {
  const origin = req.headers.get('origin')
  const isApiRoute = pathname.startsWith('/api/')

  // For API routes, apply CORS headers
  if (isApiRoute && origin) {
    const url = new URL(req.url)
    const requestHost = url.hostname

    // Allow same-origin and tenant subdomains
    const isAllowedOrigin =
      origin.includes(requestHost) ||
      origin.endsWith('.brolabentertainment.com') ||
      origin === 'http://localhost:3000' ||
      origin === 'http://localhost:3001'

    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, stripe-signature, X-Requested-With')
      response.headers.set('Access-Control-Max-Age', '86400')
    }
  }

  return response
}

function applySecurityHeaders(response: NextResponse, req: Request, pathname?: string): NextResponse {
  // Apply CORS headers first for API routes
  if (pathname) {
    applyCorsHeaders(response, req, pathname)
  }

  // Apply security headers
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  const forwardedProto = req.headers.get('x-forwarded-proto')
  const isHttps = forwardedProto === 'https' || new URL(req.url).protocol === 'https:'
  if (isHttps) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

/**
 * Helper: Get redirect URL based on user role
 */
function getDashboardUrl(role: string | undefined): string {
  if (role === 'artist') return '/artist'
  if (role === 'producer' || role === 'engineer') return '/studio'
  return '/'
}

/**
 * Helper: Check if user has provider role (producer or engineer)
 */
function isProviderRole(role: string | undefined): boolean {
  return role === 'producer' || role === 'engineer'
}

/**
 * Helper: Handle onboarding redirect logic
 */
function handleOnboardingRedirect(
  role: string | undefined,
  req: Request,
  isOnOnboardingPage: boolean
): NextResponse | null {
  // User has no role and not on onboarding page -> redirect to onboarding
  if (!role && !isOnOnboardingPage) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // User has role and on onboarding page -> redirect to dashboard
  if (role && isOnOnboardingPage) {
    const dashboardPath = getDashboardUrl(role)
    return NextResponse.redirect(new URL(dashboardPath, req.url))
  }

  return null
}

/**
 * Helper: Handle studio route protection
 */
function handleStudioProtection(
  userId: string | null,
  role: string | undefined,
  req: Request
): NextResponse | null {
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  if (!isProviderRole(role)) {
    const redirectPath = getDashboardUrl(role)
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }
  return null
}

/**
 * Helper: Handle artist route protection
 */
function handleArtistProtection(
  userId: string | null,
  role: string | undefined,
  req: Request
): NextResponse | null {
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  if (role !== 'artist') {
    const redirectPath = getDashboardUrl(role)
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }
  return null
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  const pathname = req.nextUrl.pathname
  const isAuthPath = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')

  // ============ STEP 1: STATIC FILE EXCLUSION ============
  const isStaticExt = /\.(css|js|png|gif|svg|ico|csv|zip|webp|webmanifest)$/i.test(pathname)
  const isStaticExtAlt = /\.(html?|jpe?g|ttf|woff2?|docx?|xlsx?)$/i.test(pathname)
  const isStaticFile = isStaticExt || isStaticExtAlt
  if (pathname.startsWith('/_next/') || pathname.includes('/_next/static/') || isStaticFile) {
    return applySecurityHeaders(NextResponse.next(), req, pathname)
  }

  // Define explicitly which paths are protected
  const isStudioPath = pathname.startsWith('/studio')
  const isArtistPath = pathname.startsWith('/artist')
  const isOnboardingPath = pathname.startsWith('/onboarding')
  const isPublicPath = isPublicRoute(req)

  // API routes should never be rewritten by tenancy resolution.
  // Route handlers are responsible for their own auth/validation.
  if (pathname.startsWith('/api/')) {
    return applySecurityHeaders(NextResponse.next(), req, pathname)
  }

  // ============ STEP 2: AUTHENTICATION REDIRECTION ============
  if (!userId) {
    if (isStudioPath || isArtistPath || isOnboardingPath) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/sign-in', req.url)), req, pathname)
    }
    if (isAuthPath) {
      return applySecurityHeaders(NextResponse.next(), req, pathname)
    }
    return applySecurityHeaders(await resolveTenancy(req), req, pathname)
  }

  // ============ STEP 3: PUBLIC ROUTES (Logged in) ============
  if (isPublicPath) {
    if (isAuthPath) {
      return applySecurityHeaders(NextResponse.next(), req, pathname)
    }
    return applySecurityHeaders(await resolveTenancy(req), req, pathname)
  }

  // ============ STEP 4: ROLE-BASED PROTECTION ============
  const role = (sessionClaims?.unsafeMetadata as { role?: string })?.role

  // Handle onboarding redirect logic
  const onboardingRedirect = handleOnboardingRedirect(
    role,
    req,
    isOnboardingPath
  )
  if (onboardingRedirect) return applySecurityHeaders(onboardingRedirect, req, pathname)

  // Protect /studio/* routes
  if (isStudioPath) {
    const studioProtection = handleStudioProtection(userId, role, req)
    if (studioProtection) return applySecurityHeaders(studioProtection, req, pathname)
  }

  // Protect /artist/* routes
  if (isArtistPath) {
    const artistProtection = handleArtistProtection(userId, role, req)
    if (artistProtection) return applySecurityHeaders(artistProtection, req, pathname)
  }

  // ============ STEP 5: TENANCY RESOLUTION ============
  return applySecurityHeaders(await resolveTenancy(req), req, pathname)
})

export const config = {
  matcher: [
    // NOSONAR - Next.js requires static string literals in config.matcher, String.raw cannot be used here
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', // NOSONAR
    '/(api|trpc)(.*)',
  ],
}

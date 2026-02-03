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
  '/api/webhooks(.*)', // Webhooks should be public
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isStudioRoute = createRouteMatcher(['/studio(.*)'])
const isArtistRoute = createRouteMatcher(['/artist(.*)'])

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

  // ============ STEP 1: STATIC FILE EXCLUSION ============
  const isStaticFile = /\.(html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)$/i.test(pathname)
  if (pathname.startsWith('/_next/') || pathname.includes('/_next/static/') || isStaticFile) {
    return NextResponse.next()
  }

  // Define explicitly which paths are protected
  const isStudioPath = pathname.startsWith('/studio')
  const isArtistPath = pathname.startsWith('/artist')
  const isOnboardingPath = pathname.startsWith('/onboarding')
  const isPublicPath = isPublicRoute(req)

  // ============ STEP 2: AUTHENTICATION REDIRECTION ============
  if (!userId) {
    if (isStudioPath || isArtistPath || isOnboardingPath) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    return resolveTenancy(req)
  }

  // ============ STEP 3: PUBLIC ROUTES (Logged in) ============
  if (isPublicPath) {
    return resolveTenancy(req)
  }

  // ============ STEP 4: ROLE-BASED PROTECTION ============
  const role = (sessionClaims?.unsafeMetadata as { role?: string })?.role

  // Handle onboarding redirect logic
  const onboardingRedirect = handleOnboardingRedirect(
    role,
    req,
    isOnboardingPath
  )
  if (onboardingRedirect) return onboardingRedirect

  // Protect /studio/* routes
  if (isStudioPath) {
    const studioProtection = handleStudioProtection(userId, role, req)
    if (studioProtection) return studioProtection
  }

  // Protect /artist/* routes
  if (isArtistPath) {
    const artistProtection = handleArtistProtection(userId, role, req)
    if (artistProtection) return artistProtection
  }

  // ============ STEP 5: TENANCY RESOLUTION ============
  return resolveTenancy(req)
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

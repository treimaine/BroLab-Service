import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Role-Based Routing Middleware
 * 
 * Requirements: 2.2, 2.3, 2.4
 * 
 * Flow:
 * 1. Check if user is authenticated
 * 2. Check user role from auth().sessionClaims.unsafeMetadata.role
 * 3. Redirect to /onboarding if role is missing
 * 4. Protect /studio/* routes (require provider role: producer or engineer)
 * 5. Protect /artist/* routes (require artist role)
 * 6. Allow public access to hub routes (/, /pricing, /about, etc.)
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
  role: string | undefined,
  req: Request
): NextResponse | null {
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
  role: string | undefined,
  req: Request
): NextResponse | null {
  if (role !== 'artist') {
    const redirectPath = getDashboardUrl(role)
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }
  return null
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // If user is not authenticated, Clerk will handle redirect to sign-in
  if (!userId) {
    return NextResponse.next()
  }

  // Get user role from session claims
  const role = (sessionClaims?.unsafeMetadata as { role?: string })?.role

  // Handle onboarding redirect logic
  const onboardingRedirect = handleOnboardingRedirect(
    role,
    req,
    isOnboardingRoute(req)
  )
  if (onboardingRedirect) return onboardingRedirect

  // Protect /studio/* routes
  if (isStudioRoute(req)) {
    const studioProtection = handleStudioProtection(role, req)
    if (studioProtection) return studioProtection
  }

  // Protect /artist/* routes
  if (isArtistRoute(req)) {
    const artistProtection = handleArtistProtection(role, req)
    if (artistProtection) return artistProtection
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    String.raw`/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)`,
    '/(api|trpc)(.*)',
  ],
}

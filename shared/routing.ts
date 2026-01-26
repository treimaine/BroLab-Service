/**
 * Runtime-Agnostic Routing Constants
 * 
 * Pure constants with NO imports - can be used in both:
 * - Next.js middleware (Edge runtime)
 * - Convex backend (Node runtime)
 * 
 * Requirements: Architecture, Edge Runtime, No Duplication
 */

// User roles
export type UserRole = 'artist' | 'producer' | 'engineer'

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/studio(.*)',
  '/artist(.*)',
  '/onboarding(.*)',
]

// Provider-only routes (producers and engineers)
export const PROVIDER_ROUTES = ['/studio(.*)']

// Artist-only routes
export const ARTIST_ROUTES = ['/artist(.*)']

// Public routes (no authentication required)
export const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/sign-in(.*)',
  '/sign-up(.*)',
]

// Reserved workspace slugs (cannot be used for workspace creation)
export const RESERVED_SLUGS = [
  'www',
  'app',
  'api',
  'admin',
  'studio',
  'artist',
  'pricing',
  'sign-in',
  'sign-up',
  'about',
  'contact',
  'privacy',
  'terms',
  'onboarding',
  'auth-bridge',
  'billing',
  'settings',
  'help',
  'support',
  'docs',
  'blog',
  'status',
  'legal',
]

// Role-based dashboard redirects
export const ROLE_REDIRECTS: Record<UserRole, string> = {
  artist: '/artist',
  producer: '/studio',
  engineer: '/studio',
}

// Helper: Check if role is a provider (producer or engineer)
export function isProviderRole(role: UserRole): boolean {
  return role === 'producer' || role === 'engineer'
}

// Helper: Get dashboard path for role
export function getDashboardPath(role: UserRole): string {
  return ROLE_REDIRECTS[role]
}

// Helper: Check if slug is reserved
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug)
}

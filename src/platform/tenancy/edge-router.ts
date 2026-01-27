// Platform Core: Edge-Compatible Tenancy Router
// Resolves workspace from hostname and routes to tenant pages
// Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, Req 1

import { NextRequest, NextResponse } from 'next/server'

// ============ CONSTANTS ============

/**
 * Hub domain (main platform domain)
 */
const HUB_DOMAIN = 'brolabentertainment.com'

/**
 * Reserved subdomains that should redirect to hub or return 404
 * These are NOT tenant slugs
 */
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'app',
  'api',
  'admin',
  'studio',
  'artist',
  'pricing',
  'sign-in',
  'sign-up',
])

// ============ HOSTNAME NORMALIZATION ============

/**
 * Normalize hostname
 * - Convert to lowercase
 * - Strip port (for localhost/preview deployments)
 * 
 * Edge-safe: No Node.js APIs used
 */
export function normalizeHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

// ============ DOMAIN DETECTION ============

/**
 * Check if hostname is the hub domain
 */
function isHubDomain(hostname: string): boolean {
  return hostname === HUB_DOMAIN || hostname === `www.${HUB_DOMAIN}`
}

/**
 * Check if hostname is localhost (development)
 */
function isLocalhost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

/**
 * Check if hostname is a subdomain of localhost (development)
 * Returns the subdomain slug if true, null otherwise
 */
function extractLocalhostSubdomain(hostname: string): string | null {
  // Match patterns like: www.localhost, testslug.localhost, etc.
  if (hostname.endsWith('.localhost')) {
    const subdomain = hostname.replace('.localhost', '')
    return subdomain
  }
  return null
}

/**
 * Check if hostname is a subdomain of the hub
 * Returns the subdomain slug if true, null otherwise
 */
function extractSubdomain(hostname: string): string | null {
  if (!hostname.endsWith(`.${HUB_DOMAIN}`)) {
    return null
  }
  
  const subdomain = hostname.replace(`.${HUB_DOMAIN}`, '')
  return subdomain
}

/**
 * Check if subdomain is reserved
 */
function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.has(subdomain)
}

// ============ CUSTOM DOMAIN RESOLUTION ============

/**
 * Resolve custom domain to workspace slug via Convex HTTP endpoint
 * Edge-safe: Uses fetch API (available in Edge runtime)
 * 
 * @param hostname - Normalized hostname
 * @returns Workspace slug if domain is verified, null otherwise
 */
async function resolveCustomDomain(hostname: string): Promise<string | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  
  if (!convexUrl) {
    console.error('[edge-router] NEXT_PUBLIC_CONVEX_URL not configured')
    return null
  }

  try {
    const response = await fetch(`${convexUrl}/api/domains/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostname }),
    })

    if (!response.ok) {
      console.error(`[edge-router] Domain resolution failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data.slug || null
  } catch (error) {
    console.error('[edge-router] Domain resolution error:', error)
    return null
  }
}

// ============ MAIN TENANCY RESOLVER ============

/**
 * Resolve tenancy from request and route accordingly
 * 
 * Edge-safe: No Node.js-specific APIs (fs, path, etc.)
 * 
 * Flow:
 * 1. Hub domain → NextResponse.next() (serve hub routes)
 * 2. Localhost → NextResponse.next() (serve hub routes in dev)
 * 3. Subdomain → Extract slug, check reserved, rewrite to /_t/[slug]
 * 4. Custom domain → Query Convex, rewrite to /_t/[slug] if verified
 * 5. Unknown domain → 404
 * 
 * @param request - Next.js request object
 * @returns NextResponse (next, rewrite, or redirect)
 */
export async function resolveTenancy(request: NextRequest): Promise<NextResponse> {
  const rawHost = request.headers.get('host') || ''
  const hostname = normalizeHostname(rawHost)
  const { pathname, search } = request.nextUrl

  // Case 1: Hub domain (exact match)
  if (isHubDomain(hostname)) {
    return NextResponse.next()
  }

  // Case 2: Localhost development - treat as hub
  if (isLocalhost(hostname)) {
    return NextResponse.next()
  }

  // Case 3a: Localhost subdomain (development)
  const localhostSubdomain = extractLocalhostSubdomain(hostname)
  if (localhostSubdomain) {
    // Reserved subdomains: serve hub routes (no redirect to avoid loop)
    if (isReservedSubdomain(localhostSubdomain)) {
      return NextResponse.next()
    }

    // Tenant subdomain - rewrite to tenant routes (no /_t prefix, route group handles it)
    const tenantUrl = new URL(`/${localhostSubdomain}${pathname}${search}`, request.url)
    return NextResponse.rewrite(tenantUrl)
  }

  // Case 3b: Subdomain of hub (production)
  const subdomain = extractSubdomain(hostname)
  if (subdomain) {
    // Reserved subdomains: redirect to hub
    if (isReservedSubdomain(subdomain)) {
      const hubUrl = new URL(`${pathname}${search}`, `https://${HUB_DOMAIN}`)
      return NextResponse.redirect(hubUrl)
    }

    // Tenant subdomain - rewrite to tenant routes (no /_t prefix, route group handles it)
    const tenantUrl = new URL(`/${subdomain}${pathname}${search}`, request.url)
    return NextResponse.rewrite(tenantUrl)
  }

  // Case 4: Custom domain - resolve via Convex
  const slug = await resolveCustomDomain(hostname)
  if (slug) {
    const tenantUrl = new URL(`/${slug}${pathname}${search}`, request.url)
    return NextResponse.rewrite(tenantUrl)
  }

  // Case 5: Unknown domain - explicit 404
  return new NextResponse('Not Found', { status: 404 })
}

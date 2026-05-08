// Platform Core: Edge-Compatible Tenancy Router
// Resolves workspace from hostname and routes to tenant pages
// Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, Req 1

import { NextRequest, NextResponse } from 'next/server'

const HUB_DOMAIN = 'brolabentertainment.com'

const VERCEL_DOMAINS = new Set([
  'brolab-service.vercel.app',
  'brolab-service-git-main-treiguas-projects.vercel.app',
])

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

export function normalizeHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

function isHubDomain(hostname: string): boolean {
  return (
    hostname === HUB_DOMAIN ||
    hostname === `www.${HUB_DOMAIN}` ||
    VERCEL_DOMAINS.has(hostname) ||
    hostname.endsWith('.vercel.app') // Allow all Vercel preview deployments
  )
}

function isLocalhost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function extractLocalhostSubdomain(hostname: string): string | null {
  // Match patterns like: www.localhost, testslug.localhost, etc.
  if (hostname.endsWith('.localhost')) {
    const subdomain = hostname.replace('.localhost', '')
    return subdomain
  }
  return null
}

function extractSubdomain(hostname: string): string | null {
  if (!hostname.endsWith(`.${HUB_DOMAIN}`)) {
    return null
  }
  
  const subdomain = hostname.replace(`.${HUB_DOMAIN}`, '')
  return subdomain
}

function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.has(subdomain)
}

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

export async function resolveTenancy(request: NextRequest): Promise<NextResponse> {
  const rawHost = request.headers.get('host') || ''
  const hostname = normalizeHostname(rawHost)
  const { pathname, search } = request.nextUrl
  const isApiLikePath = pathname === '/api' || pathname.startsWith('/api/') || pathname === '/trpc' || pathname.startsWith('/trpc/')

  // API routes should stay at their real app paths. Rewriting them to `/{slug}/api/*`
  // breaks server handlers such as Stripe checkout/webhook endpoints on tenant domains.
  if (isApiLikePath) {
    return NextResponse.next()
  }

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

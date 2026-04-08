'use client'

import { useAuth } from '@clerk/nextjs'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ReactNode } from 'react'

// Get Convex URL with fallback to avoid build-time errors
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

if (!convexUrl) {
  console.error('CRITICAL: NEXT_PUBLIC_CONVEX_URL is missing. Convex features will not work.')
}

// Create client with URL or empty string (will fail gracefully at runtime if missing)
const convex = new ConvexReactClient(convexUrl || '')

/**
 * ConvexClientProvider
 * 
 * Wraps the app with Convex + Clerk integration.
 * Must be nested inside ClerkProvider.
 * 
 * Requirements: Architecture, Convex Integration
 */
export default function ConvexClientProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}

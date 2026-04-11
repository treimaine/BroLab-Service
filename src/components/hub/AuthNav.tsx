'use client'

import { PillCTA } from '@/platform/ui'
import { UserButton, useUser } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface AuthNavProps {
  /**
   * Label for the primary CTA button when unauthenticated
   * @default "Explore"
   */
  readonly ctaLabel?: string
}

/**
 * AuthNav Component
 * 
 * Reactive navigation component for Hub pages.
 * Displays "Sign In" and a primary CTA for guests.
 * Displays "Dashboard" and User profile button for authenticated users.
 * 
 * Uses Clerk for auth state and follows ELECTRI-X design language.
 */
export function AuthNav({ ctaLabel = 'Explore' }: AuthNavProps) {
  const { isSignedIn, user, isLoaded } = useUser()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isLoaded) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="hidden sm:block w-16 h-4 bg-muted/20 rounded" />
        <div className="w-24 h-9 bg-muted/20 rounded-full" />
      </div>
    )
  }

  if (isSignedIn) {
    // Determine dashboard path based on role in metadata
    const role = user?.unsafeMetadata?.role as string | undefined
    const dashboardPath = role === 'artist' ? '/artist' : '/studio'

    return (
      <div className="flex items-center gap-6">
        <Link
          href={dashboardPath}
          className="text-sm font-medium text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded px-2 py-1"
        >
          Dashboard
        </Link>
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "w-8 h-8 rounded-full ring-2 ring-accent/20 hover:ring-accent/40 transition-all",
              userButtonPopoverCard: {
                className: "glass shadow-2xl border border-white/10 overflow-hidden",
                minHeight: "auto",
              },
              userButtonPopoverActionButtonText: "text-muted hover:text-text transition-colors",
              userButtonPopoverFooter: "hidden", // Remove cluttered footer
              
              // Fix for the User Profile Modal (Manage Account)
              userProfileModalOverlay: "backdrop-blur-md bg-black/40",
              userProfileModalContent: {
                className: "max-h-[85vh] w-full max-w-4xl rounded-2xl border border-white/10 shadow-strong overflow-hidden",
              },
              userProfilePage: "bg-transparent",
              userProfileNavbar: "border-r border-white/5",
              userProfileScrollBox: "bg-transparent",
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/sign-in"
        className="hidden sm:block text-sm font-medium text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded px-2 py-1"
      >
        Sign In
      </Link>
      <Link 
        href="/sign-up" 
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-full"
      >
        <PillCTA variant="primary" size="sm" className="group">
          <span>{ctaLabel}</span>
          <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
        </PillCTA>
      </Link>
    </div>
  )
}

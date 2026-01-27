'use client'

/**
 * Artist Dashboard Client Component
 * 
 * Requirements: 2.4, 20, Task 5.10
 * 
 * Uses Convex auth components (NOT Clerk) per official integration docs
 */

import { ChromeSurface, OutlineStackTitle } from '@/platform/ui'
import { useUser } from '@clerk/nextjs'
import { AuthLoading, Authenticated, Unauthenticated } from 'convex/react'
import { Loader2 } from 'lucide-react'

export function ArtistDashboard() {
  const { user } = useUser()

  const role = user?.unsafeMetadata?.role as string | undefined

  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
            <p className="text-muted">Loading...</p>
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted">Redirecting to sign in...</p>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="min-h-screen bg-app">
          <ChromeSurface as="header" blur="md" className="sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">BROLAB</div>
                <div className="text-sm text-muted capitalize">{role}</div>
              </div>
            </div>
          </ChromeSurface>

          <main className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center space-y-6">
              <OutlineStackTitle className="text-5xl md:text-7xl">
                ARTIST
              </OutlineStackTitle>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                Welcome to your artist dashboard. This is where you'll discover beats, book services, and manage your purchases.
              </p>
              <div className="mt-8 p-6 rounded-xl bg-[rgba(var(--card),0.5)] border border-border max-w-md mx-auto">
                <p className="text-sm text-muted">
                  🚧 Artist dashboard coming soon in Phase 6
                </p>
              </div>
            </div>
          </main>
        </div>
      </Authenticated>
    </>
  )
}

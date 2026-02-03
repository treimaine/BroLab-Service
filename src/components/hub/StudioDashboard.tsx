'use client'

/**
 * Studio Dashboard Client Component
 * 
 * Requirements: 2.3, 19, Task 5.10
 * 
 * Uses Convex auth components (NOT Clerk) per official integration docs
 */

import { ChromeSurface, OutlineStackTitle } from '@/platform/ui'
import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { useUser } from '@clerk/nextjs'
import { AuthLoading, Authenticated, Unauthenticated } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function StudioDashboard() {
  const { user } = useUser()
  const router = useRouter()

  const role = user?.unsafeMetadata?.role as string | undefined

  useEffect(() => {
    // Note: Clerk middleware handles most redirection, but this provides a better client-side UX
    // if a user somehow lands here without auth.
    if (user === null) {
      router.push('/sign-in')
    }
  }, [user, router])

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
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
            <p className="text-muted">Redirecting to sign in...</p>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="min-h-screen bg-app">
          <ChromeSurface as="header" blur="md" className="sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">BROLAB STUDIO</div>
                <div className="text-sm text-muted capitalize">{role}</div>
              </div>
            </div>
          </ChromeSurface>

          <main className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center space-y-6">
              <OutlineStackTitle className="text-5xl md:text-7xl">
                STUDIO
              </OutlineStackTitle>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                Welcome to your studio dashboard. This is where you'll manage your beats, services, and sales.
              </p>
              <DribbbleCard 
                padding="md"
                glow
                className="max-w-md mx-auto"
              >
                <p className="text-sm text-muted">
                  🚧 Studio dashboard coming soon in Phase 6
                </p>
              </DribbbleCard>
            </div>
          </main>
        </div>
      </Authenticated>
    </>
  )
}

function RedirectToSignIn() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/sign-in')
  }, [router])

  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
        <p className="text-muted">Redirecting to sign in...</p>
      </div>
    </div>
  )
}

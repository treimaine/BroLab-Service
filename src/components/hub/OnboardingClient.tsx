'use client'

/**
 * Onboarding Client Component
 * 
 * Requirements: 2.2, 4.1, 4.2, Req 2
 * 
 * Flow:
 * 1. Role selection (producer, engineer, artist)
 * 2. For providers: workspace creation (slug, name, type)
 * 3. Store role in user.unsafeMetadata.role
 * 4. Sync to Convex users table
 * 5. Redirect: providers → /studio, artists → /artist
 * 
 * NO subscription step (Clerk Billing comes later)
 * NO Stripe Connect step (comes in Phase 9)
 */

import { ChromeSurface, DribbbleCard, OutlineStackTitle, PillCTA } from '@/platform/ui'
import { useUser } from '@clerk/nextjs'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { ArrowRight, Check, Loader2, Music, Settings, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '../../../convex/_generated/api'

type UserRole = 'producer' | 'engineer' | 'artist'
type OnboardingStep = 'role' | 'workspace' | 'complete'

function getStepNumber(step: OnboardingStep): string {
  const stepMap: Record<OnboardingStep, string> = {
    role: '1',
    workspace: '2',
    complete: '3',
  }
  return stepMap[step]
}

/**
 * Helper: Get redirect path based on user role
 */
function getRedirectPath(role: string): string {
  return role === 'artist' ? '/artist' : '/studio'
}

/**
 * Helper: Check if user should be redirected (already onboarded)
 */
function shouldRedirectUser(
  clerkRole: string | undefined,
  existingUser: unknown
): boolean {
  return Boolean(clerkRole && existingUser)
}

/**
 * Helper: Render slug availability status
 */
function SlugAvailabilityStatus({
  slugError,
  isAvailable,
}: Readonly<{
  slugError: string | null
  isAvailable: boolean
}>) {
  if (slugError) {
    return (
      <p className="text-xs text-red-500 flex items-center gap-1">
        ✗ {slugError}
      </p>
    )
  }

  if (isAvailable) {
    return (
      <p className="text-xs text-green-500 flex items-center gap-1">
        <Check className="w-3 h-3" />
        Slug available
      </p>
    )
  }

  return null
}

export function OnboardingClient() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { user } = useUser()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceSlug, setWorkspaceSlug] = useState('')
  const [slugError, setSlugError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Convex mutations and queries
  const createUser = useMutation(api.platform.users.createUser)
  const createWorkspace = useMutation(api.platform.workspaces.createWorkspace)
  const checkSlugAvailability = useQuery(
    api.platform.workspaces.isSlugAvailable,
    workspaceSlug && workspaceSlug.length >= 3 ? { slug: workspaceSlug } : 'skip'
  )
  const existingUser = useQuery(
    api.platform.users.getUserByClerkId,
    user ? { clerkUserId: user.id } : 'skip'
  )

  // Redirect if user already has a role
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return

    const clerkRole = user.unsafeMetadata?.role as string | undefined
    
    if (shouldRedirectUser(clerkRole, existingUser)) {
      console.log('✅ User already onboarded, redirecting to dashboard')
      const redirectPath = getRedirectPath(clerkRole!)
      router.push(redirectPath)
    }
  }, [existingUser, user, router, isLoading, isAuthenticated])

  // Auto-generate slug from workspace name
  useEffect(() => {
    if (workspaceName && currentStep === 'workspace') {
      const slug = workspaceName
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/(?:^-+|-+$)/g, '')
        .slice(0, 30)
      setWorkspaceSlug(slug)
    }
  }, [workspaceName, currentStep])

  // Check slug availability
  useEffect(() => {
    if (checkSlugAvailability && typeof checkSlugAvailability === 'object') {
      if (checkSlugAvailability.available) {
        setSlugError(null)
      } else {
        setSlugError(checkSlugAvailability.error || 'Slug not available')
      }
    }
  }, [checkSlugAvailability])

  const handleRoleSelect = async (role: UserRole) => {
    if (!user || isCreating) return

    setSelectedRole(role)
    setIsCreating(true)

    try {
      await updateUserRole(role)
      await redirectBasedOnRole(role)
    } catch (error) {
      console.error('❌ Error creating user:', error)
      alert('Failed to save role. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const updateUserRole = async (role: UserRole) => {
    if (!user) return

    // 1. Update Clerk user metadata with role
    await user.update({
      unsafeMetadata: { role },
    })

    // 2. Force Clerk to reload user data to sync session claims
    await user.reload()

    // 3. Create user in Convex with selected role
    await createUser({
      clerkUserId: user.id,
      role,
    })

    console.log('✅ User created with role:', role)
  }

  const redirectBasedOnRole = async (role: UserRole) => {
    if (role === 'artist') {
      // Artists skip workspace creation
      setCurrentStep('complete')
      setTimeout(() => {
        router.push('/artist')
      }, 1500)
    } else {
      // Providers (producer/engineer) continue to workspace creation
      setCurrentStep('workspace')
    }
  }

  const handleWorkspaceCreate = async () => {
    if (!canCreateWorkspace()) return

    setIsCreating(true)

    try {
      await createWorkspaceInConvex()
      completeOnboarding()
    } catch (error) {
      console.error('❌ Error creating workspace:', error)
      alert('Failed to create workspace. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const canCreateWorkspace = (): boolean => {
    if (!user || !selectedRole || !workspaceName || !workspaceSlug || isCreating) {
      return false
    }
    if (selectedRole === 'artist') return false
    if (slugError) {
      alert('Please fix the slug error before continuing')
      return false
    }
    return true
  }

  const createWorkspaceInConvex = async () => {
    if (!user || !selectedRole) return
    
    // Only providers (producer/engineer) can create workspaces
    if (selectedRole === 'artist') return

    await createWorkspace({
      slug: workspaceSlug,
      name: workspaceName,
      type: selectedRole, // Now guaranteed to be 'producer' | 'engineer'
      ownerClerkUserId: user.id,
    })

    console.log('✅ Workspace created:', { slug: workspaceSlug, name: workspaceName })
  }

  const completeOnboarding = () => {
    setCurrentStep('complete')
    setTimeout(() => {
      router.push('/studio')
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* Header */}
      <ChromeSurface
        as="header"
        blur="md"
        className="sticky top-0 z-50"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">BROLAB</div>
            <div className="text-sm text-muted">
              Step {getStepNumber(currentStep)} of {selectedRole === 'artist' ? '2' : '3'}
            </div>
          </div>
        </div>
      </ChromeSurface>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Step 1: Role Selection */}
          {currentStep === 'role' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <OutlineStackTitle className="text-5xl md:text-6xl">
                  WELCOME
                </OutlineStackTitle>
                <p className="text-lg text-muted max-w-md mx-auto">
                  Choose your role to get started with BroLab Entertainment
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Producer */}
                <DribbbleCard
                  onClick={() => !isCreating && handleRoleSelect('producer')}
                  className="cursor-pointer hover:scale-105 transition-transform p-6 text-center space-y-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                    {isCreating && selectedRole === 'producer' ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Music className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Producer</h3>
                    <p className="text-sm text-muted">
                      Sell beats and tracks to artists
                    </p>
                  </div>
                </DribbbleCard>

                {/* Engineer */}
                <DribbbleCard
                  onClick={() => !isCreating && handleRoleSelect('engineer')}
                  className="cursor-pointer hover:scale-105 transition-transform p-6 text-center space-y-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                    {isCreating && selectedRole === 'engineer' ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Settings className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Engineer</h3>
                    <p className="text-sm text-muted">
                      Offer mixing, mastering, and audio services
                    </p>
                  </div>
                </DribbbleCard>

                {/* Artist */}
                <DribbbleCard
                  onClick={() => !isCreating && handleRoleSelect('artist')}
                  className="cursor-pointer hover:scale-105 transition-transform p-6 text-center space-y-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                    {isCreating && selectedRole === 'artist' ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Artist</h3>
                    <p className="text-sm text-muted">
                      Buy beats and book services
                    </p>
                  </div>
                </DribbbleCard>
              </div>
            </div>
          )}

          {/* Step 2: Workspace Creation (Providers only) */}
          {currentStep === 'workspace' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <OutlineStackTitle className="text-5xl md:text-6xl">
                  WORKSPACE
                </OutlineStackTitle>
                <p className="text-lg text-muted max-w-md mx-auto">
                  Create your storefront to start selling
                </p>
              </div>

              <DribbbleCard className="p-8 space-y-6">
                {/* Workspace Name */}
                <div className="space-y-2">
                  <label htmlFor="workspace-name" className="block text-sm font-medium">
                    Workspace Name
                  </label>
                  <input
                    id="workspace-name"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="My Studio"
                    className="w-full px-4 py-3 rounded-xl bg-[rgba(var(--bg-2),0.8)] border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                  <p className="text-xs text-muted">
                    This is the name of your storefront
                  </p>
                </div>

                {/* Workspace Slug */}
                <div className="space-y-2">
                  <label htmlFor="workspace-slug" className="block text-sm font-medium">
                    Workspace Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="workspace-slug"
                      type="text"
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase())}
                      placeholder="my-studio"
                      className="flex-1 px-4 py-3 rounded-xl bg-[rgba(var(--bg-2),0.8)] border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
                    />
                    <span className="text-sm text-muted">.brolabentertainment.com</span>
                  </div>
                  {workspaceSlug && workspaceSlug.length >= 3 && (
                    <SlugAvailabilityStatus
                      slugError={slugError}
                      isAvailable={checkSlugAvailability?.available ?? false}
                    />
                  )}
                  <p className="text-xs text-muted">
                    Your storefront URL: {workspaceSlug || 'your-slug'}.brolabentertainment.com
                  </p>
                </div>

                <PillCTA
                  onClick={handleWorkspaceCreate}
                  disabled={!workspaceName || !workspaceSlug || !!slugError || isCreating}
                  fullWidth
                  iconAfter={isCreating ? undefined : ArrowRight}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Continue'
                  )}
                </PillCTA>
              </DribbbleCard>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 'complete' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <OutlineStackTitle className="text-5xl md:text-6xl">
                  COMPLETE
                </OutlineStackTitle>
                <p className="text-lg text-muted max-w-md mx-auto">
                  {selectedRole === 'artist'
                    ? 'Welcome to BroLab! Redirecting to your dashboard...'
                    : 'Your workspace is ready! Redirecting to your studio...'}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

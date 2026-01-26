'use client'

/**
 * Onboarding Client Component
 * 
 * Separated from page.tsx to ensure proper ClerkProvider wrapping.
 * This component uses Clerk hooks and must be a Client Component.
 */

import { ChromeSurface, DribbbleCard, OutlineStackTitle, PillCTA } from '@/platform/ui'
import { useUser } from '@clerk/nextjs'
import { ArrowRight, Check, Loader2, Music, Settings, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type UserRole = 'producer' | 'engineer' | 'artist'
type OnboardingStep = 'role' | 'workspace' | 'subscription' | 'payments' | 'complete'

function getStepNumber(step: OnboardingStep): string {
  const stepMap: Record<OnboardingStep, string> = {
    role: '1',
    workspace: '2',
    subscription: '3',
    payments: '4',
    complete: '5',
  }
  return stepMap[step]
}

export function OnboardingClient() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceSlug, setWorkspaceSlug] = useState('')
  // const [slugError, setSlugError] = useState<string | null>(null) // TODO: Re-enable when Convex is ready

  // Convex mutations and queries
  // TODO: Implement these Convex functions when backend is ready
  // const createUser = useMutation(api.platform.users.create)
  // const createWorkspace = useMutation(api.platform.workspaces.create)
  // const checkSlugAvailability = useQuery(
  //   api.platform.workspaces.isSlugAvailable,
  //   workspaceSlug ? { slug: workspaceSlug } : 'skip'
  // )
  // const existingUser = useQuery(
  //   api.platform.users.getByClerkId,
  //   user ? { clerkUserId: user.id } : 'skip'
  // )
  
  // Temporary placeholder until Convex functions are implemented
  const existingUser: string | null = null

  // Redirect if user already has a role (but only after checking Clerk metadata)
  useEffect(() => {
    if (!user || !existingUser) return

    // Check if role is already in Clerk metadata
    const clerkRole = user.unsafeMetadata?.role as string | undefined
    
    // Only redirect if role is in BOTH Convex AND Clerk
    // This prevents premature redirects before sync completes
    if (clerkRole && existingUser) {
      console.log('✅ User already onboarded with role in both systems:', {
        clerkRole,
        convexRole: existingUser,
      })
      
      // User already onboarded, redirect based on role
      if (clerkRole === 'artist') {
        router.push('/artist')
      } else {
        router.push('/studio')
      }
    }
  }, [existingUser, user, router])

  // Sync role from Convex to Clerk if missing in unsafeMetadata
  useEffect(() => {
    const syncRoleToClerk = async () => {
      // More detailed logging to debug the issue
      console.log('🔍 Sync check (DETAILED):', {
        hasUser: !!user,
        hasExistingUser: !!existingUser,
        unsafeMetadataType: typeof user?.unsafeMetadata,
        unsafeMetadataValue: user?.unsafeMetadata,
        unsafeMetadataKeys: user?.unsafeMetadata ? Object.keys(user.unsafeMetadata) : [],
        roleValue: user?.unsafeMetadata?.role,
        roleType: typeof user?.unsafeMetadata?.role,
      })

      if (!user || !existingUser) {
        console.log('⏭️ Skipping sync: missing user or existingUser')
        return
      }

      // Check if role is missing in Clerk unsafeMetadata
      // Handle both undefined and empty object cases
      const unsafeMetadata = user.unsafeMetadata || {}
      const clerkRole = unsafeMetadata.role as string | undefined
      
      console.log('🔍 Role comparison:', {
        clerkRole,
        needsSync: !clerkRole,
      })
      
      // Only sync if role is truly missing (undefined, null, or empty string)
      if (!clerkRole && existingUser) {
        console.log('🔧 Syncing role from Convex to Clerk')
        try {
          await user.update({
            unsafeMetadata: {
              ...unsafeMetadata,
              role: existingUser,
            },
          })
          console.log('✅ Role updated in Clerk unsafeMetadata')
          
          await user.reload()
          console.log('✅ User reloaded')
          
          // Force a full page reload to ensure middleware gets updated session claims
          const dashboardPath = existingUser === 'artist' ? '/artist' : '/studio'
          console.log('🔄 Forcing full page reload to:', dashboardPath)
          
          // Use setTimeout to ensure the update is processed
          setTimeout(() => {
            globalThis.location.href = dashboardPath
          }, 500)
        } catch (error) {
          console.error('❌ Failed to sync role to Clerk:', error)
        }
      } else if (clerkRole) {
        console.log('✅ Role already in Clerk:', clerkRole)
        // If role exists in Clerk but we're still on onboarding, redirect
        const dashboardPath = clerkRole === 'artist' ? '/artist' : '/studio'
        console.log('🔄 Role exists, redirecting to:', dashboardPath)
        globalThis.location.href = dashboardPath
      } else {
        console.log('⚠️ No role to sync (both Clerk and Convex are empty)')
      }
    }

    syncRoleToClerk()
  }, [user, existingUser, router])

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
  // TODO: Re-enable when Convex functions are implemented
  // useEffect(() => {
  //   if (checkSlugAvailability !== null && typeof checkSlugAvailability === 'object') {
  //     if (checkSlugAvailability.available) {
  //       setSlugError(null)
  //     } else {
  //       setSlugError(checkSlugAvailability.error || 'Slug not available')
  //     }
  //   }
  // }, [checkSlugAvailability])

  const handleRoleSelect = async (role: UserRole) => {
    if (!user) return

    setSelectedRole(role)

    try {
      // Update Clerk user metadata with role
      await user.update({
        unsafeMetadata: {
          role,
        },
      })

      // Force Clerk to reload user data to sync session claims
      await user.reload()

      // Create user in Convex with selected role
      // TODO: Implement createUser Convex function
      // await createUser({
      //   clerkUserId: user.id,
      //   role,
      // })
      console.log('Creating user with role:', role)

      // If artist, skip to complete
      if (role === 'artist') {
        setCurrentStep('complete')
        setTimeout(() => {
          // Force full page reload to ensure Clerk metadata is synced
          globalThis.location.href = '/artist'
        }, 2000)
      } else {
        // Provider (producer/engineer) - continue to workspace creation
        setCurrentStep('workspace')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to save role. Please try again.')
    }
  }

  const handleWorkspaceCreate = async () => {
    if (!user || !selectedRole || !workspaceName || !workspaceSlug) return
    if (selectedRole === 'artist') return // Artists don't create workspaces

    // TODO: Re-enable slug validation when Convex is ready
    // if (slugError) {
    //   alert('Please fix the slug error before continuing')
    //   return
    // }

    try {
      // TODO: Implement createWorkspace Convex function
      // await createWorkspace({
      //   slug: workspaceSlug,
      //   name: workspaceName,
      //   type: selectedRole,
      //   ownerClerkUserId: user.id,
      // })
      console.log('Creating workspace:', { slug: workspaceSlug, name: workspaceName })

      // Move to subscription step
      setCurrentStep('subscription')
    } catch (error) {
      console.error('Error creating workspace:', error)
      alert('Failed to create workspace. Please try again.')
    }
  }

  const handleSubscriptionContinue = () => {
    // Move to Stripe Connect step
    setCurrentStep('payments')
  }

  const handlePaymentsContinue = () => {
    // Complete onboarding
    setCurrentStep('complete')
    setTimeout(() => {
      // Force full page reload to ensure Clerk metadata is synced
      globalThis.location.href = '/studio'
    }, 2000)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!user) {
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
              Step {getStepNumber(currentStep)} of {selectedRole === 'artist' ? '1' : '5'}
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
                  onClick={() => handleRoleSelect('producer')}
                  className="cursor-pointer hover:scale-105 transition-transform p-6 text-center space-y-4"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
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
                  onClick={() => handleRoleSelect('engineer')}
                  className="cursor-pointer hover:scale-105 transition-transform p-6 text-center space-y-4"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
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
                  onClick={() => handleRoleSelect('artist')}
                  className="cursor-pointer hover:scale-105 transition-transform p-6 text-center space-y-4"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
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
                  {/* TODO: Re-enable slug validation when Convex is ready */}
                  {workspaceSlug && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Slug available
                    </p>
                  )}
                  <p className="text-xs text-muted">
                    Your storefront URL: {workspaceSlug || 'your-slug'}.brolabentertainment.com
                  </p>
                </div>

                <PillCTA
                  onClick={handleWorkspaceCreate}
                  disabled={!workspaceName || !workspaceSlug}
                  fullWidth
                  iconAfter={ArrowRight}
                >
                  Continue
                </PillCTA>
              </DribbbleCard>
            </div>
          )}

          {/* Step 3: Subscription (Providers only) */}
          {currentStep === 'subscription' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <OutlineStackTitle className="text-5xl md:text-6xl">
                  SUBSCRIPTION
                </OutlineStackTitle>
                <p className="text-lg text-muted max-w-md mx-auto">
                  Choose a plan to activate your storefront
                </p>
              </div>

              <DribbbleCard className="p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Choose Your Plan</h3>
                  <p className="text-muted">
                    You'll be redirected to Clerk Billing to select and subscribe to a plan.
                    Plans start at $9.99/month.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 py-4">
                    <DribbbleCard className="p-4 space-y-2 border border-border">
                      <h4 className="font-bold">BASIC</h4>
                      <p className="text-2xl font-bold">$9.99<span className="text-sm text-muted">/mo</span></p>
                      <ul className="text-sm text-muted space-y-1">
                        <li>• 25 published tracks</li>
                        <li>• 1GB storage</li>
                        <li>• Subdomain</li>
                      </ul>
                    </DribbbleCard>
                    
                    <DribbbleCard className="p-4 space-y-2 border border-accent">
                      <h4 className="font-bold">PRO</h4>
                      <p className="text-2xl font-bold">$29.99<span className="text-sm text-muted">/mo</span></p>
                      <ul className="text-sm text-muted space-y-1">
                        <li>• Unlimited tracks</li>
                        <li>• 50GB storage</li>
                        <li>• 2 custom domains</li>
                      </ul>
                    </DribbbleCard>
                  </div>
                </div>

                <div className="flex gap-4">
                  <PillCTA
                    variant="secondary"
                    onClick={() => handleSubscriptionContinue()}
                    fullWidth
                  >
                    Skip for Now
                  </PillCTA>
                  <PillCTA
                    onClick={() => {
                      // TODO: Integrate with Clerk Billing
                      window.open('/pricing', '_blank')
                      handleSubscriptionContinue()
                    }}
                    fullWidth
                    iconAfter={ArrowRight}
                  >
                    Choose Plan
                  </PillCTA>
                </div>
              </DribbbleCard>
            </div>
          )}

          {/* Step 4: Stripe Connect (Providers only) */}
          {currentStep === 'payments' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <OutlineStackTitle className="text-5xl md:text-6xl">
                  PAYMENTS
                </OutlineStackTitle>
                <p className="text-lg text-muted max-w-md mx-auto">
                  Connect your Stripe account to receive payments
                </p>
              </div>

              <DribbbleCard className="p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Payment Setup</h3>
                  <p className="text-muted">
                    Connect your Stripe account to receive payments directly from artists.
                    You'll be redirected to Stripe to complete the setup.
                  </p>
                  
                  <DribbbleCard className="p-4 space-y-2 border border-border">
                    <h4 className="font-semibold">What you'll need:</h4>
                    <ul className="text-sm text-muted space-y-1">
                      <li>• Business or personal information</li>
                      <li>• Bank account details</li>
                      <li>• Tax information (if applicable)</li>
                    </ul>
                  </DribbbleCard>
                </div>

                <div className="flex gap-4">
                  <PillCTA
                    variant="secondary"
                    onClick={() => handlePaymentsContinue()}
                    fullWidth
                  >
                    Skip for Now
                  </PillCTA>
                  <PillCTA
                    onClick={() => {
                      // TODO: Integrate with Stripe Connect
                      alert('Stripe Connect integration coming soon')
                      handlePaymentsContinue()
                    }}
                    fullWidth
                    iconAfter={ArrowRight}
                  >
                    Connect Stripe
                  </PillCTA>
                </div>
              </DribbbleCard>
            </div>
          )}

          {/* Step 5: Complete */}
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

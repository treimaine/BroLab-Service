'use client'

/**
 * Onboarding Client Component — CRO Optimized
 *
 * CRO improvements applied (onboarding-cro skill):
 * - Progress bar with labeled steps (visible path reduces anxiety)
 * - Role cards with benefit bullets + "Most Popular" badge (value clarity)
 * - Social proof chip in header ("Join 500+ creators")
 * - Workspace step: live URL preview + benefit hint
 * - Stripe step: benefit-first framing, urgency on skip
 * - Complete step: celebration + explicit next action CTA
 * - Microcopy throughout to reduce friction
 */

import { ChromeSurface, DribbbleCard, PillCTA, TrustChip } from '@/platform/ui'
import { useUser } from '@clerk/nextjs'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  Music,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { PostSignupSurvey } from './PostSignupSurvey'

type UserRole = 'producer' | 'engineer' | 'artist'
type OnboardingStep = 'role' | 'workspace' | 'stripe' | 'complete'

// ─── Step config ────────────────────────────────────────────────────────────

const PROVIDER_STEPS: { key: OnboardingStep; label: string }[] = [
  { key: 'role', label: 'Your Role' },
  { key: 'workspace', label: 'Storefront' },
  { key: 'stripe', label: 'Payments' },
]

const ARTIST_STEPS: { key: OnboardingStep; label: string }[] = [
  { key: 'role', label: 'Your Role' },
]

function getSteps(role: UserRole | null) {
  return role === 'artist' ? ARTIST_STEPS : PROVIDER_STEPS
}

function getStepIndex(step: OnboardingStep, role: UserRole | null): number {
  return getSteps(role).findIndex((s) => s.key === step)
}

function getRedirectPath(role: string): string {
  return role === 'artist' ? '/artist' : '/studio'
}

function shouldRedirectUser(clerkRole: string | undefined, existingUser: unknown): boolean {
  return Boolean(clerkRole && existingUser)
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

function getNodeStyle(isDone: boolean, isActive: boolean): string {
  if (isDone) return 'bg-[rgb(var(--accent))] text-white'
  if (isActive) return 'bg-[rgb(var(--accent))]/20 border-2 border-[rgb(var(--accent))] text-[rgb(var(--accent))]'
  return 'bg-[rgba(var(--bg-2),0.6)] border border-border text-muted'
}

function getLabelStyle(isDone: boolean, isActive: boolean): string {
  if (isActive) return 'text-[rgb(var(--accent))]'
  if (isDone) return 'text-text'
  return 'text-muted'
}

function ProgressBar({
  currentStep,
  role,
}: Readonly<{
  currentStep: OnboardingStep
  role: UserRole | null
}>) {
  const steps = getSteps(role)
  const currentIndex = getStepIndex(currentStep, role)

  // Don't show on complete screen
  if (currentStep === 'complete') return null

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isDone = i < currentIndex
          const isActive = i === currentIndex
          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Node */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${getNodeStyle(isDone, isActive)}`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] font-medium whitespace-nowrap transition-colors duration-300 ${getLabelStyle(isDone, isActive)}`}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full overflow-hidden bg-border">
                  <div
                    className="h-full bg-[rgb(var(--accent))] transition-all duration-500"
                    style={{ width: isDone ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Slug availability ───────────────────────────────────────────────────────

function SlugAvailabilityStatus({
  slugError,
  isAvailable,
  slug,
}: Readonly<{

  slugError: string | null
  isAvailable: boolean
  slug: string
}>) {
  if (slugError) {
    return <p className="text-xs text-red-500 flex items-center gap-1">✗ {slugError}</p>
  }
  if (isAvailable && slug.length >= 3) {
    return (
      <p className="text-xs text-green-500 flex items-center gap-1">
        <Check className="w-3 h-3" />
        Available — your storefront will be at{' '}
        <span className="font-semibold">{slug}.brolabentertainment.com</span>
      </p>
    )
  }
  return null
}

// ─── Step: Role ──────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  {
    role: 'producer' as UserRole,
    label: 'Producer',
    desc: 'Sell beats with tiered licensing',
    Icon: Music,
    popular: true,
    benefits: ['Upload beats & set 3 price tiers', 'Auto-generate license PDFs', 'Direct Stripe payouts'],
  },
  {
    role: 'engineer' as UserRole,
    label: 'Engineer',
    desc: 'Offer mixing, mastering & more',
    Icon: Settings,
    popular: false,
    benefits: ['List your services & rates', 'Manage client bookings', 'Direct Stripe payouts'],
  },
  {
    role: 'artist' as UserRole,
    label: 'Artist',
    desc: 'Buy beats & book services',
    Icon: ShoppingBag,
    popular: false,
    benefits: ['Browse creator storefronts', 'Preview before you buy', 'Instant license delivery'],
  },
] as const

function RoleStep({
  selectedRole,
  isCreating,
  onRoleSelect,
}: Readonly<{
  selectedRole: UserRole | null
  isCreating: boolean
  onRoleSelect: (role: UserRole) => void
}>) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--accent))]">
          Step 1 of 3
        </p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
          What best describes you?
        </h1>
        <p className="text-base text-muted max-w-sm mx-auto">
          We&apos;ll tailor your experience based on your role.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {ROLE_OPTIONS.map(({ role, label, desc, Icon, popular, benefits }) => (
          <div key={role} className="relative">
            {popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[rgb(var(--accent))] text-white shadow-[0_0_12px_rgba(var(--accent),0.5)]">
                  <Sparkles className="w-2.5 h-2.5" />
                  Most Popular
                </span>
              </div>
            )}
            <DribbbleCard
              onClick={() => !isCreating && onRoleSelect(role)}
              className={`cursor-pointer transition-all duration-200 p-6 space-y-4 h-full ${
                popular ? 'border border-[rgb(var(--accent))]/40 shadow-[0_0_20px_rgba(var(--accent),0.1)]' : ''
              } ${selectedRole === role ? 'border-[rgb(var(--accent))]/60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center">
                  {isCreating && selectedRole === role ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">{label}</h3>
                <p className="text-sm text-muted mt-0.5">{desc}</p>
              </div>
              <ul className="space-y-1.5">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-muted">
                    <Check className="w-3.5 h-3.5 text-[rgb(var(--accent))] mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="pt-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--accent))]">
                  Get started →
                </span>
              </div>
            </DribbbleCard>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted">
        You can always change your role later in settings.
      </p>
    </div>
  )
}

// ─── Step: Workspace ─────────────────────────────────────────────────────────

function WorkspaceStep({
  workspaceName,
  workspaceSlug,
  slugError,
  isCreating,
  checkSlugAvailability,
  onWorkspaceCreate,
  setWorkspaceName,
  setWorkspaceSlug,
}: Readonly<{
  workspaceName: string
  workspaceSlug: string
  slugError: string | null
  isCreating: boolean
  checkSlugAvailability: { available: boolean; error?: string } | undefined
  onWorkspaceCreate: () => void
  setWorkspaceName: (v: string) => void
  setWorkspaceSlug: (v: string) => void
}>) {
  const canSubmit = workspaceName && workspaceSlug && !slugError && !isCreating

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--accent))]">
          Step 2 of 3
        </p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
          Name your storefront
        </h1>
        <p className="text-base text-muted max-w-sm mx-auto">
          This is your public URL — artists will find you here.
        </p>
      </div>

      <DribbbleCard className="p-8 space-y-6">
        <div className="space-y-2">
          <label htmlFor="workspace-name" className="block text-sm font-semibold">
            Storefront Name
          </label>
          <input
            id="workspace-name"
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="e.g. Metro Beats, Trap God Studio"
            className="w-full px-4 py-3 rounded-xl bg-[rgba(var(--bg-2),0.8)] border border-border focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition-colors"
            autoFocus
          />
          <p className="text-xs text-muted">Make it memorable — this is your brand.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="workspace-slug" className="block text-sm font-semibold">
            Your URL
          </label>
          <div className="flex items-center gap-0 rounded-xl border border-border focus-within:border-[rgb(var(--accent))] focus-within:ring-2 focus-within:ring-[rgb(var(--accent))]/20 transition-all overflow-hidden bg-[rgba(var(--bg-2),0.8)]">
            <input
              id="workspace-slug"
              type="text"
              value={workspaceSlug}
              onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase().replaceAll(/[^a-z0-9-]/g, '-'))}
              placeholder="my-studio"
              className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-sm"
            />
            <span className="px-3 py-3 text-xs text-muted bg-[rgba(var(--bg-2),0.4)] border-l border-border whitespace-nowrap">
              .brolabentertainment.com
            </span>
          </div>
          {workspaceSlug && workspaceSlug.length >= 3 && (
            <SlugAvailabilityStatus
              slugError={slugError}
              isAvailable={checkSlugAvailability?.available ?? false}
              slug={workspaceSlug}
            />
          )}
        </div>

        <PillCTA
          onClick={onWorkspaceCreate}
          disabled={!canSubmit}
          fullWidth
          iconAfter={isCreating ? undefined : ArrowRight}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating your storefront...
            </>
          ) : (
            'Create Storefront'
          )}
        </PillCTA>
      </DribbbleCard>
    </div>
  )
}

// ─── Step: Stripe ─────────────────────────────────────────────────────────────

function StripeStep({
  createdWorkspaceId,
  onSkipStripe,
}: Readonly<{
  createdWorkspaceId: string | null
  onSkipStripe: () => void
}>) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--accent))]">
          Step 3 of 3 — Last step
        </p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
          Get paid directly
        </h1>
        <p className="text-base text-muted max-w-sm mx-auto">
          Connect Stripe to receive payments straight to your bank. 0% commission.
        </p>
      </div>

      <DribbbleCard className="p-8 space-y-6">
        {/* Key benefit */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[rgb(var(--accent))]/5 border border-[rgb(var(--accent))]/20">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">You keep 100% of every sale</p>
            <p className="text-xs text-muted mt-0.5">
              Artists pay you directly via Stripe. BroLab never touches your money — only standard Stripe fees apply (2.9% + $0.30).
            </p>
          </div>
        </div>

        <ul className="space-y-2">
          {[
            'Instant payouts to your bank account',
            'Accept cards, Apple Pay, Google Pay',
            'Automatic license delivery on purchase',
            'Secure — PCI compliant via Stripe',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-muted">
              <Check className="w-4 h-4 text-[rgb(var(--accent))] shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <div className="space-y-3 pt-1">
          <a
            href={createdWorkspaceId ? `/api/stripe/connect?workspaceId=${createdWorkspaceId}` : '#'}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-bold text-white bg-linear-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] shadow-[0_4px_14px_rgba(var(--accent),0.3)] hover:shadow-[0_8px_24px_rgba(var(--accent),0.4)] transition-shadow duration-200 cursor-pointer"
          >
            Connect Stripe Account
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onSkipStripe}
            className="w-full text-xs text-muted hover:text-text transition-colors py-2 cursor-pointer"
          >
            Skip for now — I&apos;ll connect Stripe from my dashboard later
          </button>
        </div>
      </DribbbleCard>
    </div>
  )
}

// ─── Step: Complete ───────────────────────────────────────────────────────────

function CompleteStep({
  selectedRole,
  onGoToDashboard,
}: Readonly<{
  selectedRole: UserRole | null
  onGoToDashboard: () => void
}>) {
  const isArtist = selectedRole === 'artist'

  return (
    <motion.div
      className="space-y-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Celebration icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center shadow-[0_0_40px_rgba(var(--accent),0.4)]">
            <Check className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-yellow-900" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
          {isArtist ? "You're in!" : "You're live!"}
        </h1>
        <p className="text-base text-muted max-w-sm mx-auto">
          {isArtist
            ? 'Your account is ready. Start discovering beats and booking services.'
            : 'Your storefront is created. Upload your first beat and start earning.'}
        </p>
      </div>

      {/* Next action */}
      <div className="space-y-3">
        <PillCTA onClick={onGoToDashboard} size="lg" iconAfter={ArrowRight}>
          {isArtist ? 'Go to Dashboard' : 'Go to Studio'}
        </PillCTA>
        {!isArtist && (
          <p className="text-xs text-muted">
            First step: upload a beat and set your pricing tiers.
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(null)
  const [showSurvey, setShowSurvey] = useState(false)
  const isOnboardingActiveRef = useRef(false)

  const createUser = useMutation(api.platform.users.createUser)
  const createWorkspace = useMutation(api.platform.workspaces.createWorkspace)
  const recordEvent = useMutation(api.platform.events.recordEvent)
  const recordOnboardingMilestone = useMutation(api.platform.onboarding.recordOnboardingMilestone)
  const checkSlugAvailability = useQuery(
    api.platform.workspaces.isSlugAvailable,
    workspaceSlug && workspaceSlug.length >= 3 ? { slug: workspaceSlug } : 'skip'
  )
  const existingUser = useQuery(
    api.platform.users.getUserByClerkId,
    user ? { clerkUserId: user.id } : 'skip'
  )

  // Redirect if already onboarded (but not when showing survey)
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user || showSurvey) return
    if (isOnboardingActiveRef.current) return
    const clerkRole = user.unsafeMetadata?.role as string | undefined
    if (shouldRedirectUser(clerkRole, existingUser)) {
      router.push(getRedirectPath(clerkRole!))
    }
  }, [existingUser, user, router, isLoading, isAuthenticated, showSurvey])

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

  // Sync slug availability
  useEffect(() => {
    if (checkSlugAvailability && typeof checkSlugAvailability === 'object') {
      setSlugError(checkSlugAvailability.available ? null : (checkSlugAvailability.error ?? 'Slug not available'))
    }
  }, [checkSlugAvailability])

  const handleRoleSelect = async (role: UserRole) => {
    if (!user || isCreating) return
    setSelectedRole(role)
    setIsCreating(true)
    isOnboardingActiveRef.current = true
    try {
      await user.update({ unsafeMetadata: { role } })
      await user.reload()
      await createUser({ clerkUserId: user.id, role })

      // Track onboarding event: profile created
      try {
        await recordOnboardingMilestone({
          clerkUserId: user.id,
          eventType: 'profile_created',
          metadata: { role },
        })
      } catch (err) {
        console.error('Failed to record profile_created event:', err)
      }

      if (role === 'artist') {
        setCurrentStep('complete')
      } else {
        setCurrentStep('workspace')
      }
    } catch (error) {
      console.error('❌ Error creating user:', error)
      alert('Failed to save role. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleWorkspaceCreate = async () => {
    if (!user || !selectedRole || !workspaceName || !workspaceSlug || isCreating || slugError) return
    if (selectedRole === 'artist') return
    setIsCreating(true)
    try {
      const workspaceId = await createWorkspace({
        slug: workspaceSlug,
        name: workspaceName,
        type: selectedRole,
        ownerClerkUserId: user.id,
      })
      setCreatedWorkspaceId(workspaceId)

      // Track onboarding event: workspace created
      try {
        await recordOnboardingMilestone({
          clerkUserId: user.id,
          eventType: 'workspace_created',
          metadata: {
            workspaceId,
            workspaceName,
            role: selectedRole,
          },
        })
      } catch (err) {
        console.error('Failed to record workspace_created event:', err)
      }

      setCurrentStep('stripe')
    } catch (error) {
      console.error('❌ Error creating workspace:', error)
      alert('Failed to create workspace. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSkipStripe = () => {
    setCurrentStep('complete')
    setShowSurvey(true)
  }

  const handleGoToDashboard = () => {
    setShowSurvey(true)
  }

  const handleSurveyClose = async () => {
    setShowSurvey(false)

    // Track onboarding_completed milestone
    if (user) {
      try {
        await recordOnboardingMilestone({
          clerkUserId: user.id,
          eventType: 'onboarding_completed',
          metadata: {
            workspaceId: createdWorkspaceId || undefined,
            role: selectedRole || undefined,
          },
        })
      } catch (err) {
        console.error('Failed to record onboarding_completed event:', err)
      }
    }

    // Also record to workspace events for analytics
    if (createdWorkspaceId && selectedRole !== 'artist') {
      try {
        await recordEvent({
          workspaceId: createdWorkspaceId as Id<'workspaces'>,
          type: 'onboarding_completed',
          meta: { role: selectedRole },
        })
      } catch (err) {
        console.error('Failed to record workspace event:', err)
      }
    }

    router.push(selectedRole === 'artist' ? '/artist' : '/studio')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--accent))]" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    router.push('/sign-in')
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-[rgb(var(--bg))] flex flex-col">
        {/* Header */}
        <ChromeSurface as="header" blur="md" border="bottom" className="sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-xl font-black tracking-tight">BROLAB</div>
            <div className="flex items-center gap-3">
              <TrustChip icon={Users} label="Join 500+ creators" />
            </div>
          </div>
        </ChromeSurface>

        {/* Progress */}
        {currentStep !== 'complete' && (
          <div className="pt-8 pb-2 px-4">
            <ProgressBar currentStep={currentStep} role={selectedRole} />
          </div>
        )}

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-4 py-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                {currentStep === 'role' && (
                  <RoleStep
                    selectedRole={selectedRole}
                    isCreating={isCreating}
                    onRoleSelect={handleRoleSelect}
                  />
                )}
                {currentStep === 'workspace' && (
                  <WorkspaceStep
                    workspaceName={workspaceName}
                    workspaceSlug={workspaceSlug}
                    slugError={slugError}
                    isCreating={isCreating}
                    checkSlugAvailability={checkSlugAvailability as { available: boolean; error?: string } | undefined}
                    onWorkspaceCreate={handleWorkspaceCreate}
                    setWorkspaceName={setWorkspaceName}
                    setWorkspaceSlug={setWorkspaceSlug}
                  />
                )}
                {currentStep === 'stripe' && (
                  <StripeStep
                    createdWorkspaceId={createdWorkspaceId}
                    onSkipStripe={handleSkipStripe}
                  />
                )}
                {currentStep === 'complete' && (
                  <CompleteStep
                    selectedRole={selectedRole}
                    onGoToDashboard={handleGoToDashboard}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      {showSurvey && user && selectedRole && (
        <PostSignupSurvey
          clerkUserId={user.id}
          workspaceId={createdWorkspaceId || undefined}
          role={selectedRole}
          onClose={handleSurveyClose}
        />
      )}
    </>
  )
}

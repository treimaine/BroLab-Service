'use client'

/**
 * CreateWorkspaceClient
 *
 * Standalone workspace creation form for users who already have a role
 * but haven't created a workspace yet. Used at /studio/workspace/new.
 *
 * Reuses the same logic as OnboardingClient workspace step, but without
 * the role selection or redirect-if-already-onboarded logic.
 */

import { StudioHeader } from '@/components/hub/StudioHeader'
import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { useUser } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { ArrowRight, Check, Loader2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from 'convex/_generated/api'

type Step = 'form' | 'complete'

function SlugStatus({ slugError, isAvailable }: Readonly<{ slugError: string | null; isAvailable: boolean }>) {
  if (slugError) {
    return (
      <div className="flex items-center gap-1 text-red-500 text-xs">
        <XCircle className="w-3 h-3" />
        {slugError}
      </div>
    )
  }
  if (isAvailable) {
    return (
      <div className="flex items-center gap-1 text-green-500 text-xs">
        <Check className="w-3 h-3" />
        Slug available
      </div>
    )
  }
  return null
}

export function CreateWorkspaceClient() {
  const { user } = useUser()
  const router = useRouter()

  const [step, setStep] = useState<Step>('form')
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceSlug, setWorkspaceSlug] = useState('')
  const [slugError, setSlugError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const createWorkspace = useMutation(api.platform.workspaces.createWorkspace)
  const slugCheck = useQuery(
    api.platform.workspaces.isSlugAvailable,
    workspaceSlug && workspaceSlug.length >= 3 ? { slug: workspaceSlug } : 'skip'
  )

  // Auto-generate slug from name
  useEffect(() => {
    if (!workspaceName) return
    const slug = workspaceName
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/(?:^-+|-+$)/g, '')
      .slice(0, 30)
    setWorkspaceSlug(slug)
  }, [workspaceName])

  // Sync slug availability
  useEffect(() => {
    if (!slugCheck) return
    if (slugCheck.available) {
      setSlugError(null)
    } else {
      setSlugError(slugCheck.error || 'Slug not available')
    }
  }, [slugCheck])

  const canSubmit = workspaceName && workspaceSlug && !slugError && !isCreating

  const handleCreate = async () => {
    if (!canSubmit || !user) return

    const role = user.unsafeMetadata?.role as 'producer' | 'engineer' | 'artist' | undefined
    if (!role || role === 'artist') return

    setIsCreating(true)
    try {
      await createWorkspace({
        slug: workspaceSlug,
        name: workspaceName,
        type: role,
        ownerClerkUserId: user.id,
      })
      setStep('complete')
      setTimeout(() => router.push('/studio'), 1500)
    } catch (err) {
      console.error('Failed to create workspace:', err)
      alert('Failed to create workspace. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] pt-24">
      <StudioHeader />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Studio</p>
          <h1 className="text-4xl font-bold uppercase tracking-wide">Create Workspace</h1>
        </div>

        {step === 'form' && (
          <DribbbleCard className="p-8 space-y-6">
            {/* Name */}
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
              <p className="text-xs text-muted">This is the name of your storefront</p>
            </div>

            {/* Slug */}
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
                <span className="text-sm text-muted whitespace-nowrap">.brolabentertainment.com</span>
              </div>
              {workspaceSlug && workspaceSlug.length >= 3 && (
                <SlugStatus slugError={slugError} isAvailable={slugCheck?.available ?? false} />
              )}
              <p className="text-xs text-muted">
                Your storefront URL: {workspaceSlug || 'your-slug'}.brolabentertainment.com
              </p>
            </div>

            <PillCTA
              onClick={handleCreate}
              disabled={!canSubmit}
              fullWidth
              iconAfter={isCreating ? undefined : ArrowRight}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </PillCTA>
          </DribbbleCard>
        )}

        {step === 'complete' && (
          <DribbbleCard className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-br from-accent to-accent-2 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold">Workspace Created!</h3>
            <p className="text-muted">Redirecting to your studio...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </DribbbleCard>
        )}
      </main>
    </div>
  )
}

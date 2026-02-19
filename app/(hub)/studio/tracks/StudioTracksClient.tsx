/**
 * Studio Tracks Client Component
 * 
 * Client-side component for track management.
 * Handles filtering, upload modal, and track list display.
 * 
 * REFACTORED: Full Dribbble design system compliance
 * - PillCTA for buttons
 * - DribbbleCard for containers
 * - CSS tokens for colors
 * - Uppercase labels with tracking-wide
 * - Motion animations
 * 
 * Requirements: 19.2
 */

'use client'

import { StudioHeader } from '@/components/hub/StudioHeader'
import { TrackList, TrackUploadForm } from '@/modules/beats/components'
import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { AlertCircle, Plus, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

type FilterStatus = 'all' | 'draft' | 'published'

export function StudioTracksClient() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Get workspace from auth context
  // For MVP, we assume the user has a workspace
  // In production, this would come from the workspace context provider
  const workspaces = useQuery(api.platform.workspaces.listUserWorkspaces)
  const workspace = workspaces?.[0]

  // Get tracks count for each status
  const allTracks = useQuery(
    api.modules.beats.getTracksByWorkspace,
    workspace ? { workspaceId: workspace._id } : 'skip'
  )
  const draftTracks = useQuery(
    api.modules.beats.getTracksByWorkspace,
    workspace ? { workspaceId: workspace._id, status: 'draft' as const } : 'skip'
  )
  const publishedTracks = useQuery(
    api.modules.beats.getTracksByWorkspace,
    workspace ? { workspaceId: workspace._id, status: 'published' as const } : 'skip'
  )

  const handleUploadSuccess = (_trackId: Id<'tracks'>) => {
    setUploadSuccess('Track uploaded successfully!')
    setShowUploadModal(false)
    
    // Clear success message after 5 seconds
    setTimeout(() => setUploadSuccess(null), 5000)
  }

  const handleUploadError = (error: string) => {
    setUploadError(error)
    
    // Clear error message after 5 seconds
    setTimeout(() => setUploadError(null), 5000)
  }

  // Manage dialog open/close with native dialog API
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    
    if (showUploadModal) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [showUploadModal])

  if (!workspace) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] pt-24">
        <StudioHeader />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Studio</p>
            <h1 className="text-4xl font-bold uppercase tracking-wide">Tracks</h1>
          </div>
          <DribbbleCard className="max-w-2xl mx-auto p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2">No Workspace Found</h3>
            <p className="text-muted mb-6">
              You need to create a workspace before managing your tracks.
            </p>
            <Link href="/studio/workspace/new">
              <PillCTA variant="primary" size="md">
                Create Workspace
              </PillCTA>
            </Link>
          </DribbbleCard>
        </main>
      </div>
    )
  }

  const allTracksCount = allTracks?.length ?? 0
  const draftTracksCount = draftTracks?.length ?? 0
  const publishedTracksCount = publishedTracks?.length ?? 0

  return (
    <motion.div 
      className="min-h-screen bg-[rgb(var(--bg))] pt-24 p-6"
      variants={dribbblePageEnter}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <StudioHeader />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Studio</p>
            <h1 className="text-4xl font-bold uppercase tracking-wide">Tracks</h1>
          </div>
          <PillCTA
            onClick={() => setShowUploadModal(true)}
            variant="primary"
            size="md"
            icon={Plus}
          >
            Upload Track
          </PillCTA>
        </div>

        {/* Success Message */}
        {uploadSuccess && (
          <DribbbleCard padding="md" glow className="border-[rgb(var(--accent))]">
            <p className="text-sm">{uploadSuccess}</p>
          </DribbbleCard>
        )}

        {/* Error Message */}
        {uploadError && (
          <DribbbleCard padding="md" className="border-red-500/50">
            <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
          </DribbbleCard>
        )}

        {/* Filter Tabs */}
        <DribbbleCard padding="none" className="overflow-hidden">
          <div className="flex items-center gap-2 p-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`
                flex-1 px-4 py-2 font-semibold uppercase tracking-wide text-sm transition-all rounded-lg
                ${filterStatus === 'all'
                  ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/30'
                  : 'text-muted hover:bg-card/60'
                }
              `}
            >
              All Tracks{' '}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filterStatus === 'all' ? 'bg-white/20' : 'bg-card'
              }`}>
                {allTracksCount}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('draft')}
              className={`
                flex-1 px-4 py-2 font-semibold uppercase tracking-wide text-sm transition-all rounded-lg
                ${filterStatus === 'draft'
                  ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/30'
                  : 'text-muted hover:bg-card/60'
                }
              `}
            >
              Drafts{' '}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filterStatus === 'draft' ? 'bg-white/20' : 'bg-card'
              }`}>
                {draftTracksCount}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('published')}
              className={`
                flex-1 px-4 py-2 font-semibold uppercase tracking-wide text-sm transition-all rounded-lg
                ${filterStatus === 'published'
                  ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/30'
                  : 'text-muted hover:bg-card/60'
                }
              `}
            >
              Published{' '}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filterStatus === 'published' ? 'bg-white/20' : 'bg-card'
              }`}>
                {publishedTracksCount}
              </span>
            </button>
          </div>
        </DribbbleCard>

        {/* Track List */}
        <DribbbleCard padding="lg">
          <TrackList
            workspaceId={workspace._id}
            status={filterStatus === 'all' ? undefined : filterStatus}
          />
        </DribbbleCard>
      </div>

      {/* Upload Modal - using native dialog for accessibility */}
      <dialog 
        ref={dialogRef}
        className="fixed inset-0 z-50 p-4 bg-transparent backdrop:bg-black/70 max-w-2xl w-full"
        aria-labelledby="upload-modal-title"
        onClose={() => setShowUploadModal(false)}
      >
        {/* Modal Content */}
        <div className="relative bg-[rgb(var(--bg))] rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[rgb(var(--border-alpha))]">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-alpha))] bg-card/40">
            <div className="flex items-center gap-3">
              <DribbbleCard padding="sm" glow className="w-10 h-10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-[rgb(var(--accent))]" />
              </DribbbleCard>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide">Upload Track</h2>
                <p className="text-sm text-muted">
                  Upload your beat or audio track
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-muted hover:text-[rgb(var(--accent))] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="p-6 overflow-y-auto flex-1 bg-[rgb(var(--bg))]">
            <TrackUploadForm
              workspaceId={workspace._id}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgb(var(--border-alpha))] bg-card/40">
            <PillCTA
              onClick={() => setShowUploadModal(false)}
              variant="secondary"
              size="md"
            >
              Cancel
            </PillCTA>
          </div>
        </div>
      </dialog>
    </motion.div>
  )
}

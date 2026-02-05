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

import { TrackList, TrackUploadForm } from '@/modules/beats/components'
import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { Music, Plus, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

type FilterStatus = 'all' | 'draft' | 'published'

export function StudioTracksClient() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
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

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No workspace found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please complete onboarding to create a workspace.
          </p>
        </div>
      </div>
    )
  }

  const allTracksCount = allTracks?.length ?? 0
  const draftTracksCount = draftTracks?.length ?? 0
  const publishedTracksCount = publishedTracks?.length ?? 0

  return (
    <motion.div 
      className="min-h-screen bg-[rgb(var(--bg))] p-6"
      variants={dribbblePageEnter}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">Tracks</h1>
            <p className="text-muted">
              Manage your beats and audio tracks
            </p>
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

        {/* Upload Modal */}
        {showUploadModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={(e) => {
              // Close modal only if clicking the backdrop (not the modal content)
              if (e.target === e.currentTarget) {
                setShowUploadModal(false)
              }
            }}
            onKeyDown={(e) => e.key === 'Escape' && setShowUploadModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
          >
            {/* Modal Content */}
            <div 
              className="relative bg-[rgb(var(--bg))] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[rgb(var(--border-alpha))]"
              onClick={(e) => e.stopPropagation()}
            >
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
          </div>
        )}
      </div>
    </motion.div>
  )
}

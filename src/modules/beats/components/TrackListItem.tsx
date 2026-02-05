/**
 * TrackListItem Component
 * 
 * Displays a track with preview generation controls.
 * Shows processing status, retry button for failed jobs, and generate preview action.
 * 
 * REFACTORED: Now uses Dribbble design system
 * - DribbbleCard for container with hover lift
 * - PillCTA for action buttons
 * - CSS tokens for colors
 * - Gradient icon background with glow
 * 
 * Requirements: 10.6, 10.7, 11.5, 11.6
 */

'use client'

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { useMutation } from 'convex/react'
import { Music, Play, RefreshCw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { ProcessingStatusBadge } from './ProcessingStatusBadge'

interface Track {
  _id: Id<'tracks'>
  title: string
  bpm?: number
  key?: string
  tags: string[]
  status: 'draft' | 'published'
  processingStatus: 'idle' | 'processing' | 'completed' | 'failed'
  processingError?: string
  previewStorageId?: Id<'_storage'>
  createdAt: number
}

interface TrackListItemProps {
  readonly track: Track
  readonly onError?: (error: string) => void
  readonly onSuccess?: (message: string) => void
}

export function TrackListItem({ track, onError, onSuccess }: TrackListItemProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const retryPreviewGeneration = useMutation(api.modules.beats.retryPreviewGeneration)
  const generatePreview = useMutation(api.modules.beats.generatePreview)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await retryPreviewGeneration({ trackId: track._id })
      onSuccess?.('Preview generation restarted')
    } catch (error) {
      console.error('Retry error:', error)
      onError?.(error instanceof Error ? error.message : 'Failed to retry preview generation')
    } finally {
      setIsRetrying(false)
    }
  }

  const handleGeneratePreview = async () => {
    setIsGenerating(true)
    try {
      await generatePreview({ trackId: track._id })
      onSuccess?.('Preview generation started')
    } catch (error) {
      console.error('Generate preview error:', error)
      onError?.(error instanceof Error ? error.message : 'Failed to start preview generation')
    } finally {
      setIsGenerating(false)
    }
  }

  const showRetryButton = track.processingStatus === 'failed'
  const showGenerateButton = track.processingStatus === 'idle' && !track.previewStorageId
  const hasPreview = track.processingStatus === 'completed' && track.previewStorageId

  return (
    <DribbbleCard 
      padding="md" 
      hoverLift 
      className="flex items-center gap-4"
    >
      {/* Track Icon */}
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] rounded-lg flex items-center justify-center shadow-lg shadow-[rgb(var(--accent))]/20">
        <Music className="w-6 h-6 text-white" />
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-semibold truncate">
            {track.title}
          </h3>
          {track.status === 'published' && (
            <DribbbleCard padding="none" hoverLift={false} className="px-2 py-0.5">
              <span className="text-xs font-medium text-[rgb(var(--accent))]">
                Published
              </span>
            </DribbbleCard>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-sm text-muted">
          {track.bpm && <span>{track.bpm} BPM</span>}
          {track.key && <span>{track.key}</span>}
          {track.tags.length > 0 && (
            <span className="text-xs">
              {track.tags.slice(0, 3).join(', ')}
              {track.tags.length > 3 && ` +${track.tags.length - 3}`}
            </span>
          )}
        </div>
      </div>

      {/* Processing Status */}
      <div className="flex items-center gap-3">
        <ProcessingStatusBadge 
          status={track.processingStatus}
          error={track.processingError}
        />

        {/* Preview Actions */}
        {hasPreview && (
          <button
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Play preview"
          >
            <Play className="w-5 h-5" />
          </button>
        )}

        {/* Retry Button (for failed jobs) */}
        {showRetryButton && (
          <PillCTA
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            disabled={isRetrying}
            loading={isRetrying}
            icon={RefreshCw}
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </PillCTA>
        )}

        {/* Generate Preview Button (for tracks without preview) */}
        {showGenerateButton && (
          <PillCTA
            variant="secondary"
            size="sm"
            onClick={handleGeneratePreview}
            disabled={isGenerating}
            loading={isGenerating}
            icon={Sparkles}
          >
            {isGenerating ? 'Generating...' : 'Generate Preview'}
          </PillCTA>
        )}
      </div>
    </DribbbleCard>
  )
}

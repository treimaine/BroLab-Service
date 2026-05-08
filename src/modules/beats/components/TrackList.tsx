/**
 * TrackList Component
 * 
 * Displays a list of tracks with preview generation controls.
 * Shows empty state when no tracks exist.
 * 
 * REFACTORED: Added Dribbble stagger animations
 * 
 * Requirements: 10.1, 10.6
 */

'use client'

import { dribbbleStaggerChild, dribbbleStaggerContainer } from '@/platform/ui/dribbble/motion'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { Music } from 'lucide-react'
import { useState } from 'react'
import { TrackListItem } from './TrackListItem'

interface TrackListProps {
  readonly workspaceId: Id<'workspaces'>
  readonly status?: 'draft' | 'published'
}

export function TrackList({ workspaceId, status }: TrackListProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const tracks = useQuery(api.modules.beats.getTracksByWorkspace, {
    workspaceId,
    status,
  })

  const showMessage = (message: string, type: 'error' | 'success') => {
    if (type === 'error') {
      setError(message)
      setTimeout(() => setError(null), REQUEST_TIMEOUT_MS.NORMAL)
    } else {
      setSuccess(message)
      setTimeout(() => setSuccess(null), REQUEST_TIMEOUT_MS.NORMAL)
    }
  }

  if (tracks === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Music className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
          {status === 'published' 
            ? 'You haven\'t published any tracks yet. Upload and publish tracks to make them visible on your storefront.'
            : 'Upload your first track to get started. You can generate previews automatically or manually later.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Track List */}
      <motion.div 
        className="space-y-3"
        variants={dribbbleStaggerContainer}
        initial="initial"
        animate="animate"
      >
        {tracks.map((track) => (
          <motion.div
            key={track._id}
            variants={dribbbleStaggerChild}
          >
            <TrackListItem
              track={track}
              onError={(msg) => showMessage(msg, 'error')}
              onSuccess={(msg) => showMessage(msg, 'success')}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Track Count */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          {status && ` (${status})`}
        </p>
      </div>
    </div>
  )
}

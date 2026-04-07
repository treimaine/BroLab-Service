'use client'

/**
 * Interview Management Dashboard - Team Admin
 *
 * Allows team members (CMO) to:
 * - View pending interview requests
 * - Schedule interviews with available time slots
 * - Track completed interviews
 * - Manage interview calendar
 */

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { AuthLoading, Authenticated, useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Loader2,
  Mail,
  X,
} from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { StudioHeader } from './StudioHeader'

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'Not scheduled'
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

interface InterviewRequest {
  _id: string
  status: 'pending' | 'scheduled' | 'completed' | 'canceled'
  name: string
  email: string
  company?: string
  createdAt?: number
  preferredTimes?: string[]
  interviewDate?: number
  interviewUrl?: string
  notes?: string
}

function InterviewCard({ request }: { request: InterviewRequest }) {
  const statusColors: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
    pending: {
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      text: 'text-yellow-400',
      icon: Clock,
    },
    scheduled: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-400',
      icon: Calendar,
    },
    completed: {
      bg: 'bg-green-500/10 border-green-500/30',
      text: 'text-green-400',
      icon: Check,
    },
    canceled: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-400',
      icon: X,
    },
  }

  const statusConfig = statusColors[request.status] || statusColors.pending
  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DribbbleCard padding="md" className={`border ${statusConfig.bg}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{request.name}</h3>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text} capitalize`}
              >
                {request.status}
              </span>
            </div>
            <p className="text-sm text-muted flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {request.email}
            </p>
            {request.company && (
              <p className="text-xs text-muted mt-1">{request.company}</p>
            )}
          </div>
          <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
        </div>

        {/* Submitted */}
        <div className="text-xs text-muted mb-3 pb-3 border-b border-border">
          Submitted: {formatDate(request.createdAt)}
        </div>

        {/* Preferred Times */}
        {request.preferredTimes && request.preferredTimes.length > 0 && (
          <div className="mb-3 pb-3 border-b border-border">
            <p className="text-xs font-semibold text-muted mb-2 uppercase">
              Preferred Times
            </p>
            <div className="space-y-1">
              {request.preferredTimes.slice(0, 3).map((time: string) => (
                <p key={time} className="text-xs text-muted">
                  • {formatDateTime(time)}
                </p>
              ))}
              {request.preferredTimes.length > 3 && (
                <p className="text-xs text-muted">
                  + {request.preferredTimes.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Scheduled Date */}
        {request.status === 'scheduled' && request.interviewDate && (
          <div className="mb-3 pb-3 border-b border-border">
            <p className="text-xs font-semibold text-blue-400 mb-1">
              Scheduled For
            </p>
            <p className="text-sm font-semibold">{formatDate(request.interviewDate)}</p>
            {request.interviewUrl && (
              <a
                href={request.interviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline mt-1 block"
              >
                View Calendar →
              </a>
            )}
          </div>
        )}

        {/* Notes */}
        {request.notes && (
          <div className="text-xs text-muted">
            <p className="font-semibold mb-1">Notes:</p>
            <p className="italic">{request.notes}</p>
          </div>
        )}
      </DribbbleCard>
    </motion.div>
  )
}

export function InterviewManagementClient() {
  const pendingRequests = useQuery(api.modules.interviewRequests.getPendingInterviewRequests)
  const scheduledInterviews = useQuery(api.modules.interviewRequests.getScheduledInterviews)
  const allRequests = useQuery(api.modules.interviewRequests.getAllInterviewRequests, {
    limit: 50,
  })

  const isLoading =
    pendingRequests === undefined ||
    scheduledInterviews === undefined ||
    allRequests === undefined

  return (
    <>
      <StudioHeader />

      <motion.div className="container mx-auto px-4 py-8" {...dribbblePageEnter}>
        <AuthLoading>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </AuthLoading>

        <Authenticated>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Interview Management
                </h1>
                <p className="text-lg text-muted">
                  Schedule and manage product feedback interviews with customers
                </p>
              </motion.div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <DribbbleCard padding="md">
                  <div>
                    <p className="text-xs text-muted uppercase font-semibold mb-1">
                      Pending
                    </p>
                    <p className="text-3xl font-bold">
                      {pendingRequests?.length || 0}
                    </p>
                  </div>
                </DribbbleCard>
                <DribbbleCard padding="md">
                  <div>
                    <p className="text-xs text-muted uppercase font-semibold mb-1">
                      Scheduled
                    </p>
                    <p className="text-3xl font-bold text-blue-400">
                      {scheduledInterviews?.length || 0}
                    </p>
                  </div>
                </DribbbleCard>
                <DribbbleCard padding="md">
                  <div>
                    <p className="text-xs text-muted uppercase font-semibold mb-1">
                      Total Requests
                    </p>
                    <p className="text-3xl font-bold">
                      {allRequests?.length || 0}
                    </p>
                  </div>
                </DribbbleCard>
              </div>

              {/* Pending Interviews */}
              {pendingRequests && pendingRequests.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Pending Requests ({pendingRequests.length})
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingRequests.map((request) => (
                      <InterviewCard key={request._id} request={request} />
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Interviews */}
              {scheduledInterviews && scheduledInterviews.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Scheduled Interviews ({scheduledInterviews.length})
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {scheduledInterviews.map((interview) => (
                      <InterviewCard key={interview._id} request={interview} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!pendingRequests || pendingRequests.length === 0) &&
                (!scheduledInterviews || scheduledInterviews.length === 0) && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                    <p className="text-muted mb-2">No interview requests yet</p>
                    <p className="text-sm text-muted">
                      Interview requests will appear here once customers submit them
                    </p>
                  </div>
                )}

              {/* Help Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-4 border-t border-border"
              >
                <p className="text-xs text-muted">
                  💡 <strong>Tip:</strong> Target 2 interviews per week (15 min each).
                  Use Calendly or Savvycal to schedule confirmed slots.
                </p>
              </motion.div>
            </div>
          )}
        </Authenticated>
      </motion.div>
    </>
  )
}

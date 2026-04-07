'use client'

import {
    DribbbleCard,
    PillCTA,
} from '@/platform/ui'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MessageSquare, X } from 'lucide-react'
import { useState } from 'react'

const ABANDONMENT_REASONS = [
  { id: 'too_expensive', label: 'Too expensive' },
  { id: 'just_browsing', label: 'Just browsing / not ready to buy' },
  { id: 'payment_issue', label: 'Payment method issue' },
  { id: 'license_unclear', label: 'License terms unclear' },
  { id: 'found_alternative', label: 'Found a better alternative' },
  { id: 'technical_issue', label: 'Technical issue / error' },
  { id: 'other', label: 'Other' },
]

interface CheckoutAbandonmentSurveyProps {
  isOpen: boolean
  onClose: () => void
  clerkUserId?: string
  trackId?: string
  workspaceId?: string
  licenseTier?: 'basic' | 'premium' | 'unlimited'
  checkoutSessionId?: string
  onSubmit: (data: {
    reason: string
    customReason?: string
  }) => Promise<void>
}

export function CheckoutAbandonmentSurvey({
  isOpen,
  onClose,
  onSubmit,
}: Readonly<CheckoutAbandonmentSurveyProps>) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [customReason, setCustomReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedReason) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        reason: selectedReason,
        customReason: selectedReason === 'other' ? customReason : undefined,
      })
      onClose()
    } catch (error) {
      console.error('Failed to submit abandonment survey:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close survey"
            className="fixed inset-0 z-50 w-full h-full cursor-default"
            style={{ backgroundColor: 'rgb(0 0 0 / 0.6)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                className="w-full max-w-lg"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
              >
                <DribbbleCard className="relative p-6 md:p-8">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card hover:bg-border flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">Help Us Improve</h2>
                    </div>
                    <p className="text-sm text-muted">
                      What stopped you from completing your purchase?
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {ABANDONMENT_REASONS.map((reason) => (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() => setSelectedReason(reason.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                          selectedReason === reason.id
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-card hover:bg-border'
                        }`}
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>

                  {selectedReason === 'other' && (
                    <div className="mb-6">
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Tell us what happened..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text placeholder:text-muted focus:outline-none focus:border-accent resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <PillCTA
                      onClick={handleSubmit}
                      disabled={!selectedReason || isSubmitting}
                      fullWidth
                      icon={isSubmitting ? Loader2 : undefined}
                      className={isSubmitting ? 'animate-pulse' : ''}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </PillCTA>

                    <button
                      onClick={onClose}
                      className="w-full py-2 text-sm text-muted hover:text-text transition-colors"
                      disabled={isSubmitting}
                    >
                      Skip
                    </button>
                  </div>
                </DribbbleCard>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

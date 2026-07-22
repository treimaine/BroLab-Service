'use client'

/**
 * Post-Signup Survey Modal
 * 
 * Shown after onboarding completion to collect feedback:
 * "What made you choose BroLab?"
 * 
 * Stores responses in Convex surveyResponses table.
 */

import { useMutation } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

const SURVEY_OPTIONS = [
  { value: 'zero_commission', label: '0% commission on sales' },
  { value: 'direct_payments', label: 'Direct Stripe payouts' },
  { value: 'custom_storefront', label: 'Custom storefront' },
  { value: 'auto_licensing', label: 'Automatic license generation' },
  { value: 'multi_product', label: 'Sell beats AND services' },
  { value: 'friend_referral', label: 'Recommended by a friend' },
  { value: 'other', label: 'Other' },
] as const

type SurveyOption = (typeof SURVEY_OPTIONS)[number]['value']

interface PostSignupSurveyProps {
  clerkUserId: string
  workspaceId?: string
  role: 'producer' | 'engineer' | 'artist'
  onClose: () => void
}

export function PostSignupSurvey({ clerkUserId, workspaceId, role, onClose }: Readonly<PostSignupSurveyProps>) {
  const [selected, setSelected] = useState<SurveyOption | null>(null)
  const [customAnswer, setCustomAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const submitSurvey = useMutation(api.modules.surveyResponses.submitSurveyResponse)

  const handleSubmit = async () => {
    if (!selected) return
    setIsSubmitting(true)
    try {
      await submitSurvey({
        clerkUserId,
        workspaceId: workspaceId ? (workspaceId as Id<'workspaces'>) : undefined,
        role,
        question: 'what_made_you_choose_brolab',
        answer: selected,
        customAnswer: selected === 'other' ? customAnswer || undefined : undefined,
      })
      setIsSubmitted(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      console.error('Failed to submit survey:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-100 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <button
          type="button"
          className="absolute inset-0 bg-black/60 cursor-default"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
          aria-label="Close survey"
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md bg-[rgb(var(--bg-2))] border border-border rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[rgb(var(--bg)/0.5)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-muted" />
          </button>

          {isSubmitted ? (
            <motion.div
              className="p-8 text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center mx-auto shadow-[0_0_30px_rgb(var(--accent)/0.3)]">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold">Thanks for the feedback!</h3>
              <p className="text-sm text-muted">Your response helps us improve BroLab.</p>
            </motion.div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--accent))]">
                    Quick question
                  </span>
                </div>
                <h3 className="text-xl font-bold">What made you choose BroLab?</h3>
                <p className="text-sm text-muted">
                  Takes 10 seconds. Your answer helps us build a better platform.
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {SURVEY_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSelected(value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                      selected === value
                        ? 'bg-[rgb(var(--accent))]/15 border-2 border-[rgb(var(--accent))] text-[rgb(var(--accent))]'
                        : 'bg-[rgb(var(--bg)/0.5)] border border-border hover:border-[rgb(var(--accent))]/30 text-text'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Custom answer for "Other" */}
              {selected === 'other' && (
                <input
                  type="text"
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="Tell us more..."
                  className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg)/0.8)] border border-border focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition-colors text-sm"
                />
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!selected || isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white bg-linear-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] shadow-[0_4px_14px_rgb(var(--accent)/0.3)] hover:shadow-[0_8px_24px_rgb(var(--accent)/0.4)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Response
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

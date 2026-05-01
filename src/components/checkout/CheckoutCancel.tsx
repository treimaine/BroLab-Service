'use client'

import {
  DribbbleCard,
  PillCTA,
  dribbblePageEnter,
} from '@/platform/ui'
import { useMutation } from 'convex/react'
import { motion } from 'framer-motion'
import { RefreshCw, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { CheckoutAbandonmentSurvey } from './CheckoutAbandonmentSurvey'

export function CheckoutCancel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSurvey, setShowSurvey] = useState(true)

  const trackId = searchParams?.get('trackId') ?? undefined
  const workspaceId = (searchParams?.get('workspaceId') as Id<'workspaces'> | null) ?? undefined
  const licenseTier = (searchParams?.get('licenseTier') as 'basic' | 'premium' | 'unlimited' | undefined) ?? undefined
  const checkoutSessionId = searchParams?.get('sessionId') ?? undefined

  const submitAbandonment = useMutation(api.modules.checkoutAbandonment.submitAbandonment)

  const handleGoBack = () => {
    router.back()
  }

  const handleSurveySubmit = async (data: { reason: string; customReason?: string }) => {
    await submitAbandonment({
      trackId,
      workspaceId,
      licenseTier,
      checkoutSessionId,
      reason: data.reason,
      customReason: data.customReason,
    })
  }

  return (
    <>
      <motion.div
        className="min-h-screen bg-bg text-text flex items-center justify-center py-16 px-4"
        {...dribbblePageEnter}
      >
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <DribbbleCard className="p-8 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-border/50 flex items-center justify-center">
                  <X className="w-10 h-10 text-muted" />
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Checkout Cancelled
              </h1>
              <p className="text-lg text-muted mb-8">
                Your payment was not processed. No charges were made.
              </p>

              {/* Reasons & Help */}
              <DribbbleCard padding="md" className="text-left mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-accent mb-3">
                  Common Reasons
                </h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>You closed the payment window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Payment information was declined</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>You clicked the back button</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>The session expired</span>
                  </li>
                </ul>
              </DribbbleCard>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <PillCTA
                  onClick={handleGoBack}
                  variant="primary"
                  className="flex-1"
                  icon={RefreshCw}
                >
                  Try Again
                </PillCTA>
                <Link href="/marketplace" className="flex-1">
                  <PillCTA
                    variant="secondary"
                    className="w-full"
                    icon={ShoppingCart}
                  >
                    Browse Beats
                  </PillCTA>
                </Link>
              </div>

              {/* Recovery Suggestions */}
              <DribbbleCard padding="md" className="text-left mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-accent mb-3">
                  Want to come back later?
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted">
                    Browse more beats or save this one to find it easily later.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link 
                      href={trackId ? `/studio/${workspaceId}/track/${trackId}` : "/marketplace"} 
                      className="text-sm text-accent hover:underline font-semibold"
                    >
                      View track →
                    </Link>
                    <span className="text-muted">|</span>
                    <Link href="/marketplace" className="text-sm text-accent hover:underline font-semibold">
                      Browse more beats →
                    </Link>
                  </div>
                </div>
              </DribbbleCard>

              {/* Support Link */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted mb-2">
                  Having trouble? We&apos;re here to help.
                </p>
                <a
                  href="mailto:support@brolabentertainment.com"
                  className="text-sm text-accent hover:underline font-semibold"
                >
                  Contact Support
                </a>
              </div>
            </DribbbleCard>
          </motion.div>
        </div>
      </motion.div>

      <CheckoutAbandonmentSurvey
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        trackId={trackId}
        workspaceId={workspaceId}
        licenseTier={licenseTier}
        checkoutSessionId={checkoutSessionId}
        onSubmit={handleSurveySubmit}
      />
    </>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, RefreshCw, ShoppingCart, X } from 'lucide-react'
import {
  DribbbleCard,
  PillCTA,
  dribbblePageEnter,
} from '@/platform/ui'

export function CheckoutCancel() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  return (
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
            <div className="text-left bg-card/60 backdrop-blur-glass rounded-xl p-6 mb-8">
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
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <PillCTA
                onClick={handleGoBack}
                variant="primary"
                className="flex-1"
                iconBefore={RefreshCw}
              >
                Try Again
              </PillCTA>
              <PillCTA
                href="/marketplace"
                variant="secondary"
                className="flex-1"
                iconBefore={ShoppingCart}
              >
                Browse Beats
              </PillCTA>
            </div>

            {/* Support Link */}
            <div className="mt-8 pt-6 border-t border-border">
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
  )
}

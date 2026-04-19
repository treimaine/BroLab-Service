'use client'

import {
  DribbbleCard,
  PillCTA,
  dribbblePageEnter,
  dribbbleStaggerChild,
  dribbbleStaggerContainer,
} from '@/platform/ui'
import { motion } from 'framer-motion'
import { Check, FileText, Home, Music, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { InstantDelivery } from './InstantDelivery'

export function CheckoutSuccess() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [purchaseData, setPurchaseData] = useState<{
    itemType: 'track' | 'service'
    beatTitle: string
    producerName: string
    licenseType: string | null
    price: number
    downloadUrl: string | null
    licenseUrl: string | null
  } | null>(null)

  // In production, fetch purchase data from session_id
  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    const trackPurchaseComplete = async () => {
      if (!sessionId) return
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'checkout_funnel',
            step: 'complete_payment',
            sessionId,
          }),
        })
      } catch (e) {
        console.error('Failed to track purchase completion:', e)
      }
    }

    const fetchPurchaseData = async () => {
      if (!sessionId) {
        setIsLoading(false)
        return
      }

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const response = await fetch(`/api/stripe/session/${sessionId}`, {
          cache: 'no-store',
        })

        if (response.status === 202) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          continue
        }

        if (!response.ok) {
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setPurchaseData({
          itemType: data.itemType,
          beatTitle: data.beatTitle,
          producerName: data.producerName,
          licenseType: data.licenseType,
          price: data.price,
          downloadUrl: data.downloadUrl,
          licenseUrl: data.licenseUrl,
        })
        setIsLoading(false)
        await trackPurchaseComplete()
        return
      }

      setIsLoading(false)
    }

    fetchPurchaseData().catch(() => setIsLoading(false))
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-accent to-accent-2 flex items-center justify-center animate-pulse">
            <Music className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted">Processing your purchase...</p>
        </div>
      </div>
    )
  }

  if (!purchaseData) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <DribbbleCard className="p-8 text-center max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Purchase Not Found</h2>
          <p className="text-muted mb-4">
            We couldn&apos;t find your purchase details. Please contact support.
          </p>
          <Link href="/">
            <PillCTA variant="secondary">
              Go Home
            </PillCTA>
          </Link>
        </DribbbleCard>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-bg text-text py-16 px-4"
      {...dribbblePageEnter}
    >
      <div className="container mx-auto max-w-3xl">
        {/* Success Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-accent to-accent-2 flex items-center justify-center shadow-glow-strong">
                <Check className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-yellow-900" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Purchase Successful!
          </h1>
          <p className="text-lg text-muted">
            {purchaseData.itemType === 'track'
              ? 'Your beat and license are ready for download.'
              : 'Your payment is confirmed. Your provider will contact you shortly.'}
          </p>
        </motion.div>

        {/* Purchase Summary */}
        <motion.div
          variants={dribbbleStaggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4 mb-8"
        >
          <motion.div variants={dribbbleStaggerChild}>
            <DribbbleCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {purchaseData.beatTitle}
                  </h2>
                  <p className="text-sm text-muted">
                    by {purchaseData.producerName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted mb-1">License</div>
                  {purchaseData.licenseType && (
                    <div className="text-sm font-semibold text-accent">
                      {purchaseData.licenseType}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-muted">Total Paid</span>
                <span className="text-2xl font-bold text-accent">
                  ${purchaseData.price.toFixed(2)}
                </span>
              </div>
            </DribbbleCard>
          </motion.div>

          {/* Instant Delivery */}
          {purchaseData.itemType === 'track' && (
            <motion.div variants={dribbbleStaggerChild}>
              <InstantDelivery
                beatTitle={purchaseData.beatTitle}
                downloadUrl={purchaseData.downloadUrl}
                licenseUrl={purchaseData.licenseUrl}
              />
            </motion.div>
          )}

          {/* What's Next */}
          <motion.div variants={dribbbleStaggerChild}>
            <DribbbleCard className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                What&apos;s Next?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Download your beat</div>
                    <div className="text-sm text-muted">
                      High-quality WAV or MP3 file
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Save your license PDF</div>
                    <div className="text-sm text-muted">
                      Keep it for your records
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Start creating</div>
                    <div className="text-sm text-muted">
                      Make your next hit!
                    </div>
                  </div>
                </li>
              </ul>
            </DribbbleCard>
          </motion.div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/artist/purchases" className="flex-1">
            <PillCTA
              variant="primary"
              className="w-full"
              icon={FileText}
            >
              View My Purchases
            </PillCTA>
          </Link>
          <Link href="/marketplace" className="flex-1">
            <PillCTA
              variant="secondary"
              className="w-full"
              icon={Home}
            >
              Back to Marketplace
            </PillCTA>
          </Link>
        </motion.div>

        {/* Receipt Email Notice */}
        <motion.p
          className="text-center text-sm text-muted mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A receipt has been sent to your email address.
        </motion.p>
      </div>
    </motion.div>
  )
}

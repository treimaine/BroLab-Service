'use client'

import {
  DribbbleCard,
  PillCTA,
  dribbblePageEnter,
} from '@/platform/ui'
import { motion } from 'framer-motion'
import { Check, Copy, HelpCircle, Music } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { InstantDelivery } from './InstantDelivery'

interface PurchaseData {
  itemType: 'track' | 'service'
  itemTitle: string
  producerName: string
  licenseType: string | null
  amountCents: number
  currency: string
  downloadUrl: string | null
  licenseUrl: string | null
  buyerEmail: string | undefined
  paidAt: string
  orderId: string
  sessionId: string
  price: number
}

export function CheckoutSuccess() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [copied, setCopied] = useState(false)

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
          itemTitle: data.itemTitle,
          producerName: data.producerName,
          licenseType: data.licenseType,
          amountCents: data.amountCents,
          currency: data.currency,
          downloadUrl: data.downloadUrl,
          licenseUrl: data.licenseUrl,
          buyerEmail: data.buyerEmail,
          paidAt: data.paidAt,
          orderId: data.orderId,
          sessionId: data.sessionId,
          price: data.price,
        })
        setIsLoading(false)
        await trackPurchaseComplete()
        return
      }

      setIsLoading(false)
    }

    fetchPurchaseData().catch(() => setIsLoading(false))
  }, [searchParams])

  const copyOrderId = () => {
    if (purchaseData?.orderId) {
      navigator.clipboard.writeText(purchaseData.orderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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

  const itemTypeBadge = purchaseData.itemType === 'track' && purchaseData.licenseType
    ? purchaseData.licenseType
    : purchaseData.itemType === 'track'
      ? 'Beat License'
      : 'Service'

  const formatCurrency = (amountCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amountCents / 100)
  }

  return (
    <motion.div
      className="min-h-screen bg-bg text-text py-8 sm:py-16 px-4"
      {...dribbblePageEnter}
    >
      <div className="container mx-auto max-w-2xl space-y-6 sm:space-y-8">
        {/* Confirmation Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-accent to-accent-2 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Payment successful
          </h1>
          <p className="text-base sm:text-lg text-muted mb-6">
            Your order is confirmed and ready now.
          </p>

          {/* Utility Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 bg-bg-secondary rounded-lg">
            <div className="text-left">
              <div className="text-xs text-muted mb-1">Order #</div>
              <button
                onClick={copyOrderId}
                className="text-sm font-semibold text-text hover:text-accent flex items-center gap-1 group"
                title="Click to copy"
              >
                {purchaseData.orderId.slice(0, 8)}
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
            <div className="text-left">
              <div className="text-xs text-muted mb-1">Paid at</div>
              <div className="text-sm font-semibold text-text">
                {purchaseData.paidAt}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 text-left">
              <div className="text-xs text-muted mb-1">Payment method</div>
              <div className="text-sm font-semibold text-text">****</div>
            </div>
            <div className="col-span-2 sm:col-span-1 text-left">
              <div className="text-xs text-muted mb-1">Receipt</div>
              <div className="text-xs text-text truncate">
                {purchaseData.buyerEmail || 'email'}
              </div>
            </div>
          </div>

          {copied && (
            <p className="text-xs text-accent mt-2">Order # copied!</p>
          )}
        </motion.div>

        {/* Purchase Summary Card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <DribbbleCard className="p-6">
            <div className="space-y-4">
              {/* Item Info */}
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {purchaseData.itemTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                    {itemTypeBadge}
                  </span>
                  <span className="text-sm text-muted">
                    by {purchaseData.producerName}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Price and Details */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted mb-1">Amount paid</div>
                  <div className="text-2xl sm:text-3xl font-bold text-accent">
                    {formatCurrency(purchaseData.amountCents, purchaseData.currency)}
                  </div>
                </div>
                {purchaseData.itemType === 'track' && purchaseData.licenseType && (
                  <div className="text-right">
                    <div className="text-xs text-muted mb-1">License tier</div>
                    <div className="text-sm font-semibold text-text">
                      {purchaseData.licenseType.split(' ')[0]}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DribbbleCard>
        </motion.div>

        {/* Instant Delivery Card (Primary CTA Block) */}
        {purchaseData.itemType === 'track' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <InstantDelivery
              downloadUrl={purchaseData.downloadUrl}
              licenseUrl={purchaseData.licenseUrl}
            />
          </motion.div>
        )}

        {/* Next Actions Row */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link href="/artist/purchases" className="flex-1">
            <PillCTA
              variant="primary"
              className="w-full"
            >
              View my purchases
            </PillCTA>
          </Link>
          <Link href="/marketplace" className="flex-1">
            <PillCTA
              variant="secondary"
              className="w-full"
            >
              Back to dashboard
            </PillCTA>
          </Link>
          <Link href="/support" className="flex-1">
            <PillCTA
              variant="secondary"
              className="w-full"
              icon={HelpCircle}
            >
              Contact support
            </PillCTA>
          </Link>
        </motion.div>

        {/* Support Helper */}
        <motion.div
          className="text-center text-sm text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <p>
            Need help? Contact support and include your order number.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

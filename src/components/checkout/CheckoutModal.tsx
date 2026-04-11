'use client'

import {
  DribbbleCard,
  PillCTA,
} from '@/platform/ui'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock, Flame, Loader2, Lock, ShoppingCart, ShieldCheck, Star, X } from 'lucide-react'
import { useState } from 'react'
import { DEFAULT_LICENSE_TIERS, LicenseSelector, type LicenseTier } from './LicenseSelector'
import { CheckoutAbandonmentSurvey } from './CheckoutAbandonmentSurvey'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  beat: {
    id: string
    title: string
    producer: string
    coverUrl?: string
    bpm?: number
    genre?: string
  }
  workspaceId: string
  licenseTiers?: LicenseTier[]
}

export function CheckoutModal({
  isOpen,
  onClose,
  beat,
  workspaceId,
  licenseTiers = DEFAULT_LICENSE_TIERS,
}: Readonly<CheckoutModalProps>) {
  const [selectedLicenseId, setSelectedLicenseId] = useState<string | null>(
    licenseTiers.find((t) => t.popular)?.id || licenseTiers[0]?.id || null
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAbandonmentSurvey, setShowAbandonmentSurvey] = useState(false)

  const selectedLicense = licenseTiers.find((t) => t.id === selectedLicenseId)

  const trackFunnelEvent = async (step: string, amountCents?: number) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout_funnel',
          workspaceId,
          trackId: beat.id,
          step,
          amountCents,
        }),
      })
    } catch (e) {
      console.error('Failed to track funnel event:', e)
    }
  }

  const handleAbandonmentSubmit = async (data: { reason: string; customReason?: string }) => {
    await fetch('/api/analytics/abandonment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkoutSessionId: beat.id,
        licenseTier: selectedLicense?.id,
        reason: data.reason,
        customReason: data.customReason,
      }),
    })
  }

  const handleClose = () => {
    setShowAbandonmentSurvey(true)
    onClose()
  }

  const handleCheckout = async () => {
    if (!selectedLicense) return

    await trackFunnelEvent('select_license', selectedLicense.price * 100)
    setIsProcessing(true)

    try {
      await trackFunnelEvent('begin_payment')
      
      // Map license tier ID: 'exclusive' → 'unlimited' for API compatibility
      const licenseTier = selectedLicense.id === 'exclusive' ? 'unlimited' : selectedLicense.id

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          itemType: 'track',
          itemId: beat.id,
          licenseTier,
        }),
      })

      if (!response.ok) {
        throw new Error(`Checkout failed: ${response.status}`)
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error('No checkout URL received')
      }

      await trackFunnelEvent('view_checkout')
      globalThis.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - button for a11y (closes modal on click) */}
          <motion.button
            type="button"
            aria-label="Close modal"
            className="fixed inset-0 z-50 w-full h-full cursor-default"
            style={{ backgroundColor: 'rgb(0 0 0 / 0.6)' }}
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                className="w-full max-w-2xl"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
              >
                <DribbbleCard className="relative p-6 md:p-8">
                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card hover:bg-border flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-accent to-accent-2 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Purchase Beat</h2>
                    </div>
                    <p className="text-sm text-muted">
                      Select your license and complete checkout securely with Stripe.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-medium">
                      <Flame className="w-3.5 h-3.5" />
                      Popular beat — high demand!
                    </div>
                  </div>

                  {/* Beat Info */}
                  <DribbbleCard padding="sm" className="mb-6 border border-border">
                    <div className="flex items-center gap-4">
                      {/* Cover Art */}
                      <div className="w-16 h-16 rounded-lg bg-linear-to-br from-accent/20 to-accent-2/10 flex items-center justify-center shrink-0">
                        <span className="text-2xl">🎵</span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{beat.title}</h3>
                        <p className="text-sm text-muted">by {beat.producer}</p>
                        {(beat.bpm || beat.genre) && (
                          <div className="flex items-center gap-2 mt-1">
                            {beat.genre && (
                              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                                {beat.genre}
                              </span>
                            )}
                            {beat.bpm && (
                              <span className="px-2 py-0.5 rounded-full bg-card text-muted text-xs font-medium">
                                {beat.bpm} BPM
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </DribbbleCard>

                  {/* License Selection */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">
                      Choose License
                    </h3>
                    <LicenseSelector
                      tiers={licenseTiers}
                      selectedTierId={selectedLicenseId}
                      onSelect={setSelectedLicenseId}
                    />
                  </div>

                  {/* Total */}
                  {selectedLicense && (
                    <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted mb-1">Total</div>
                          <div className="font-semibold">
                            {selectedLicense.name}
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-accent">
                          ${selectedLicense.price}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    <PillCTA
                      onClick={handleCheckout}
                      disabled={!selectedLicense || isProcessing}
                      fullWidth
                      icon={isProcessing ? Loader2 : Lock}
                      iconAfter={isProcessing ? undefined : ArrowRight}
                      className={isProcessing ? 'animate-pulse' : ''}
                    >
                      {isProcessing ? 'Processing...' : 'Complete Purchase Now'}
                    </PillCTA>

                    <button
                      onClick={handleClose}
                      className="w-full py-2 text-sm text-muted hover:text-text transition-colors"
                      disabled={isProcessing}
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-muted text-center flex items-center justify-center gap-2">
                      <Lock className="w-3 h-3" />
                      Secured by Stripe. Your payment information is never stored.
                    </p>
                    
                    {/* Trust Signals */}
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                        <span>Secure Checkout</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>Instant Download</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Star className="w-3.5 h-3.5 text-yellow-500" />
                        <span>Licensed & Verified</span>
                      </div>
                    </div>
                  </div>
                </DribbbleCard>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>

    <CheckoutAbandonmentSurvey
      isOpen={showAbandonmentSurvey}
      onClose={() => setShowAbandonmentSurvey(false)}
      trackId={beat.id}
      workspaceId={workspaceId}
      onSubmit={handleAbandonmentSubmit}
    />
    </>
  )
}

'use client'

import { useWorkspace } from '@/components/tenant'
import {
    DribbbleCard,
    DribbbleSectionEnter,
    PillCTA,
} from '@/platform/ui'
import { useQuery } from 'convex/react'
import { AlertCircle, ArrowLeft, Check, Clock } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

/**
 * Service Detail Page
 *
 * Displays service info, features, and booking/purchase button.
 *
 * Requirements: 21.5 (service detail with info, features, purchase/book button)
 * Requirements: 13.8, 27.4 (payments not configured state)
 */
export default function ServiceDetailPage() {
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string
  const serviceId = params.id as string

  const { workspace, isLoading: workspaceLoading } = useWorkspace()
  const [isPurchasing, setIsPurchasing] = useState(false)

  const service = useQuery(
    api.modules.services.getActiveService,
    serviceId && workspace ? { serviceId: serviceId as Id<'services'>, workspaceId: workspace._id as Id<'workspaces'> } : 'skip'
  )

  const isLoading = workspaceLoading || service === undefined

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading service...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-2">Service Not Found</h2>
          <p className="text-muted mb-6">This service may have been removed or is no longer available.</p>
          <Link href={`/${workspaceSlug}/services`}>
            <PillCTA variant="secondary">Back to Services</PillCTA>
          </Link>
        </div>
      </div>
    )
  }

  const isPaymentsConfigured =
    workspace?.paymentsStatus === 'active' && workspace?.stripeAccountId !== undefined

  const bookLabel = (() => {
    if (isPurchasing) return 'Redirecting...'
    if (isPaymentsConfigured) return 'Book Service'
    return 'Unavailable'
  })()

  const handleBook = async () => {
    if (!isPaymentsConfigured || !workspace) return
    setIsPurchasing(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: 'service',
          itemId: service._id,
          workspaceId: workspace._id,
        }),
      })
      const data = await res.json()
      if (data.url) {
        globalThis.location.href = data.url
      }
    } catch {
      // silently fail — user stays on page
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Back Button */}
      <section className="px-4 lg:px-8 py-6">
        <div className="container mx-auto">
          <Link
            href={`/${workspaceSlug}/services`}
            className="inline-flex items-center gap-2 text-muted hover:text-text transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services</span>
          </Link>
        </div>
      </section>

      {/* Service Details */}
      <section className="px-4 lg:px-8 py-8">
        <div className="container mx-auto max-w-6xl">
          <DribbbleSectionEnter>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-text mb-3">{service.title}</h1>
                  <p className="text-muted mb-4">by {workspace?.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted mb-6">
                    <Clock className="w-4 h-4" />
                    <span>{service.turnaround}</span>
                  </div>
                  <p className="text-lg text-muted leading-relaxed">{service.description}</p>
                </div>

                <DribbbleCard padding="lg">
                  <h2 className="text-xl font-bold text-text mb-4">What&apos;s Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>
                </DribbbleCard>
              </div>

              {/* Right Column - Booking Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <DribbbleCard glow padding="lg">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted mb-2">Starting at</p>
                      <p className="text-5xl font-bold text-text mb-4">${service.priceUSD}</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted">
                        <Clock className="w-4 h-4" />
                        <span>{service.turnaround}</span>
                      </div>
                    </div>

                    <PillCTA
                      variant="primary"
                      size="lg"
                      className="w-full mb-4"
                      disabled={!isPaymentsConfigured || isPurchasing}
                      onClick={handleBook}
                    >
                      {bookLabel}
                    </PillCTA>

                    <div className="space-y-3 pt-4">
                      <div className="h-px bg-[rgba(var(--border),0.5)]" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Delivery Time</span>
                        <span className="text-text font-medium">{service.turnaround}</span>
                      </div>
                      {service.priceEUR && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted">Price (EUR)</span>
                          <span className="text-text font-medium">€{service.priceEUR}</span>
                        </div>
                      )}
                    </div>
                  </DribbbleCard>

                  {/* Payments Not Configured Warning */}
                  {!isPaymentsConfigured && (
                    <DribbbleCard padding="lg" className="border-2 border-[rgba(var(--accent),0.3)]">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-base font-bold text-text mb-2">Payments Not Configured</h3>
                          <p className="text-sm text-muted">
                            This creator hasn&apos;t completed their payment setup yet.
                            Bookings are currently unavailable.
                          </p>
                        </div>
                      </div>
                    </DribbbleCard>
                  )}

                  <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
                    <p className="text-sm text-muted text-center">
                      Have questions?{' '}
                      <Link href={`/${workspaceSlug}/contact`} className="text-accent hover:underline">
                        Contact us
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DribbbleSectionEnter>
        </div>
      </section>
    </div>
  )
}

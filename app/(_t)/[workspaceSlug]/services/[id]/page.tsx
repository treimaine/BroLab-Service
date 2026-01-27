'use client'

import { useWorkspace } from '@/components/tenant'
import {
  DribbbleCard,
  DribbbleSectionEnter,
  PillCTA,
} from '@/platform/ui'
import { ArrowLeft, Check, Clock, Headphones } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

/**
 * Service Detail Page
 * 
 * Displays detailed information about a specific service.
 * Includes features, pricing, and booking button.
 * Placeholder implementation - will be replaced with real data.
 * 
 * Requirements: 21.5 (service detail with info, features, purchase/book button)
 */
export default function ServiceDetailPage({
  params,
}: {
  readonly params: Promise<{ workspaceSlug: string; id: string }>
}) {
  const { workspaceSlug, id } = use(params)
  const { workspace, isLoading } = useWorkspace()

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

  // Placeholder service data
  const service = {
    id,
    title: 'MIXING & MASTERING',
    description: 'Professional mixing and mastering services to make your tracks radio-ready. With years of experience and state-of-the-art equipment, we deliver industry-standard results.',
    price: 99,
    turnaround: '3-5 business days',
    features: [
      'Unlimited Revisions',
      'Radio Ready Sound',
      'Stem Mastering',
      'Reference Track Matching',
      'Loudness Optimization',
      'Format Delivery (WAV, MP3)',
      'Professional Feedback',
      'Fast Turnaround',
    ],
    process: [
      'Upload your stems or mixed track',
      'Provide reference tracks and notes',
      'Receive first draft within 3 days',
      'Request revisions if needed',
      'Download final mastered files',
    ],
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Back Button */}
      <section className="px-4 lg:px-8 py-6">
        <div className="container mx-auto">
          <Link 
            href={`/_t/${workspaceSlug}/services`}
            className="inline-flex items-center gap-2 text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services</span>
          </Link>
        </div>
      </section>

      {/* Service Details */}
      <section className="px-4 lg:px-8 py-12">
        <div className="container mx-auto max-w-6xl">
          <DribbbleSectionEnter>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold text-text mb-2">{service.title}</h1>
                      <p className="text-muted">by {workspace?.name}</p>
                    </div>
                  </div>
                  <p className="text-lg text-muted leading-relaxed">{service.description}</p>
                </div>

                <DribbbleCard padding="lg">
                  <h2 className="text-xl font-bold text-text mb-4">What's Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>
                </DribbbleCard>

                <DribbbleCard padding="lg">
                  <h2 className="text-xl font-bold text-text mb-4">How It Works</h2>
                  <div className="space-y-4">
                    {service.process.map((step, index) => (
                      <div key={step} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[rgba(var(--accent),0.15)] flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-accent">{index + 1}</span>
                        </div>
                        <p className="text-muted pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </DribbbleCard>
              </div>

              {/* Right Column - Booking Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <DribbbleCard glow padding="lg">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted mb-2">Starting at</p>
                      <p className="text-5xl font-bold text-text mb-4">${service.price}</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted">
                        <Clock className="w-4 h-4" />
                        <span>{service.turnaround}</span>
                      </div>
                    </div>

                    <PillCTA variant="primary" size="lg" className="w-full mb-4">
                      Book Service
                    </PillCTA>

                    <div className="space-y-3 pt-4">
                      <div className="h-px bg-[rgba(var(--border),0.5)]" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Delivery Time</span>
                        <span className="text-text font-medium">{service.turnaround}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Revisions</span>
                        <span className="text-text font-medium">Unlimited</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Format</span>
                        <span className="text-text font-medium">WAV + MP3</span>
                      </div>
                    </div>
                  </DribbbleCard>

                  <div className="mt-6 p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
                    <p className="text-sm text-muted text-center">
                      Have questions? <Link href={`/_t/${workspaceSlug}/contact`} className="text-accent hover:underline">Contact us</Link>
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

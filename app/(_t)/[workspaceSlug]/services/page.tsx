'use client'

import { useWorkspace } from '@/components/tenant'
import {
    DribbbleCard,
    DribbbleSectionEnter,
    DribbbleStaggerItem,
    PillCTA,
} from '@/platform/ui'
import { Clock, Headphones, Music, Star } from 'lucide-react'

/**
 * Services List Page
 * 
 * Displays all active services for this workspace.
 * Placeholder implementation - will be replaced with real data.
 * 
 * Requirements: 21.4 (services list page)
 */
export default function ServicesListPage() {
  const { workspace, isLoading } = useWorkspace()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading services...</p>
        </div>
      </div>
    )
  }

  // Placeholder services data
  const placeholderServices = [
    {
      id: 1,
      title: 'MIXING & MASTERING',
      description: 'Professional mixing and mastering services. Radio-ready sound guaranteed with unlimited revisions.',
      price: 99,
      turnaround: '3-5 days',
      features: ['Unlimited Revisions', 'Radio Ready', 'Stem Mastering', 'Reference Track'],
      icon: Headphones,
    },
    {
      id: 2,
      title: 'CUSTOM PRODUCTION',
      description: 'Exclusive beats tailored to your vision. Full commercial rights and stems included.',
      price: 299,
      turnaround: '7-10 days',
      features: ['Exclusive Rights', 'Stems Included', 'Unlimited Revisions', 'Custom Sound'],
      icon: Music,
    },
    {
      id: 3,
      title: 'VOCAL TUNING',
      description: 'Professional vocal tuning and editing. Natural sound with pitch-perfect results.',
      price: 49,
      turnaround: '1-2 days',
      features: ['Pitch Correction', 'Timing Adjustment', 'Breath Control', 'Natural Sound'],
      icon: Star,
    },
  ]

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <section className="px-4 lg:px-8 py-12">
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-text mb-4">Professional Services</h1>
            <p className="text-muted text-lg">
              {workspace?.name} offers professional audio services to take your music to the next level.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 lg:px-8 py-12">
        <div className="container mx-auto">
          <DribbbleSectionEnter stagger>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {placeholderServices.map((service, index) => {
                const Icon = service.icon
                return (
                  <DribbbleStaggerItem key={service.id}>
                    <DribbbleCard 
                      glow={index === 0} 
                      hoverLift 
                      padding="lg" 
                      className="h-full"
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          index === 0 
                            ? 'bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))]' 
                            : 'bg-[rgba(var(--accent),0.15)]'
                        }`}>
                          <Icon className={`w-7 h-7 ${index === 0 ? 'text-white' : 'text-accent'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-text mb-2">{service.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted mb-3">
                            <Clock className="w-4 h-4" />
                            <span>{service.turnaround}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted">From</p>
                          <p className="text-2xl font-bold text-text">${service.price}</p>
                        </div>
                      </div>

                      <p className="text-muted mb-6">{service.description}</p>

                      <div className="space-y-2 mb-6">
                        {service.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-muted">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <PillCTA 
                        variant={index === 0 ? 'primary' : 'secondary'} 
                        size="lg" 
                        className="w-full"
                      >
                        Book Service
                      </PillCTA>
                    </DribbbleCard>
                  </DribbbleStaggerItem>
                )
              })}
            </div>
          </DribbbleSectionEnter>

          {/* Empty State (when no services) */}
          {placeholderServices.length === 0 && (
            <div className="text-center py-20">
              <Headphones className="w-16 h-16 text-muted mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text mb-2">No Services Yet</h2>
              <p className="text-muted mb-8">Check back soon for available services</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

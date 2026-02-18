'use client'

import { useWorkspace } from '@/components/tenant'
import {
    DribbbleCard,
    DribbbleSectionEnter,
    DribbbleStaggerItem,
    PillCTA,
} from '@/platform/ui'
import { useQuery } from 'convex/react'
import { Clock, Headphones } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

/**
 * Services List Page
 *
 * Displays all active services for this workspace.
 *
 * Requirements: 21.4 (services list page)
 */
export default function ServicesListPage() {
  const { workspace, isLoading: workspaceLoading } = useWorkspace()
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string

  const services = useQuery(
    api.modules.services.getActiveServices,
    workspace ? { workspaceId: workspace._id as Id<'workspaces'> } : 'skip'
  )

  const isLoading = workspaceLoading || services === undefined

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
      <section className="px-4 lg:px-8 pb-20">
        <div className="container mx-auto">
          {services.length === 0 ? (
            <div className="text-center py-20">
              <Headphones className="w-16 h-16 text-muted mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text mb-2">No Services Yet</h2>
              <p className="text-muted mb-8">Check back soon for available services</p>
            </div>
          ) : (
            <DribbbleSectionEnter stagger>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {services.map((service, index) => (
                  <DribbbleStaggerItem key={service._id}>
                    <DribbbleCard
                      glow={index === 0}
                      hoverLift
                      padding="lg"
                      className="h-full"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-text mb-2 truncate">{service.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{service.turnaround}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-muted">From</p>
                          <p className="text-2xl font-bold text-text">${service.priceUSD}</p>
                        </div>
                      </div>

                      <p className="text-muted mb-6 line-clamp-3">{service.description}</p>

                      <div className="space-y-2 mb-6">
                        {service.features.slice(0, 4).map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-muted">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {service.features.length > 4 && (
                          <p className="text-xs text-muted pl-3.5">+{service.features.length - 4} more</p>
                        )}
                      </div>

                      <Link href={`/${workspaceSlug}/services/${service._id}`}>
                        <PillCTA
                          variant={index === 0 ? 'primary' : 'secondary'}
                          size="lg"
                          className="w-full"
                        >
                          View Service
                        </PillCTA>
                      </Link>
                    </DribbbleCard>
                  </DribbbleStaggerItem>
                ))}
              </div>
            </DribbbleSectionEnter>
          )}
        </div>
      </section>
    </div>
  )
}

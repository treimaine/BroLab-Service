'use client'

import { useWorkspace } from '@/components/tenant'
import {
    DribbbleCard,
    DribbbleSectionEnter,
    DribbbleStaggerItem,
    GlassFooter,
    PillCTA,
    WavyLines,
} from '@/platform/ui'
import { useQuery } from 'convex/react'
import { Clock, Headphones, Music } from 'lucide-react'
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

  const workspaceName = workspace?.name?.toUpperCase() ?? workspaceSlug.toUpperCase()

  return (
    <>
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        {/* Page Header */}
        <section className="relative px-4 lg:px-8 pt-12 pb-8 overflow-hidden">
          <WavyLines className="right-0 top-0 w-[100px] h-full opacity-40" />
          <div className="container mx-auto">
            <DribbbleSectionEnter>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-bold text-accent uppercase tracking-widest">02</span>
                <div className="h-px w-16 bg-[rgba(var(--border),0.5)]" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-text mb-2 tracking-tight">SERVICES</h1>
              <p className="text-muted text-lg">
                {workspace?.name} offers professional audio services to take your music to the next level.
              </p>
            </DribbbleSectionEnter>
          </div>
        </section>

        {/* Services Grid */}
        <section className="px-4 lg:px-8 pb-20">
          <div className="container mx-auto">
            {services.length === 0 ? (
              <DribbbleSectionEnter>
                <DribbbleCard padding="lg" className="text-center py-16 max-w-md mx-auto">
                  <Headphones className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-text mb-2">No Services Yet</h2>
                  <p className="text-muted mb-8">Check back soon for available services</p>
                  <Link href={`/${workspaceSlug}`}>
                    <PillCTA variant="primary" size="md" icon={Music}>Browse Beats Instead</PillCTA>
                  </Link>
                </DribbbleCard>
              </DribbbleSectionEnter>
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
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              index === 0
                                ? 'bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))]'
                                : 'bg-[rgba(var(--accent),0.15)]'
                            }`}>
                              <Headphones className={`w-7 h-7 ${index === 0 ? 'text-white' : 'text-accent'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-text mb-2 truncate">{service.title.toUpperCase()}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{service.turnaround}</span>
                              </div>
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

      {/* FOOTER */}
      <GlassFooter className="py-12 px-4 lg:px-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center text-white font-bold select-none">
              {workspaceName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-text">{workspaceName}</p>
              <p className="text-xs text-muted">Powered by BroLab Entertainment</p>
            </div>
          </div>
          <nav className="flex gap-8 text-sm text-muted" aria-label="Footer navigation">
            <Link href={`/${workspaceSlug}`} className="hover:text-text transition-colors cursor-pointer">Beats</Link>
            <Link href={`/${workspaceSlug}/services`} className="hover:text-text transition-colors cursor-pointer">Services</Link>
            <Link href={`/${workspaceSlug}/contact`} className="hover:text-text transition-colors cursor-pointer">Contact</Link>
          </nav>
          <p className="text-xs text-muted">© {new Date().getFullYear()} {workspaceName}. All rights reserved.</p>
        </div>
      </GlassFooter>
    </>
  )
}

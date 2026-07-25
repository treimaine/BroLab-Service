'use client'

import { useWorkspace } from '@/components/tenant'
import {
  StorefrontFooter,
  StorefrontPageHeader,
  StorefrontServiceCard,
} from '@/components/tenant/storefront'
import { DribbbleCard, PillCTA } from '@/platform/ui'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Headphones, Music } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ServicesListPage() {
  const { workspace, isLoading: workspaceLoading } = useWorkspace()
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string
  const basePath = `/${workspaceSlug}`

  const services = useQuery(
    api.modules.services.getActiveServices,
    workspace ? { workspaceId: workspace._id as Id<'workspaces'> } : 'skip'
  )

  if (workspaceLoading || services === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-muted">Loading services…</p>
        </div>
      </div>
    )
  }

  const workspaceName = workspace?.name ?? workspaceSlug

  return (
    <>
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        <StorefrontPageHeader
          eyebrow={`Built around ${workspaceName}`}
          title="SERVICES THAT FINISH THE SONG"
          description="Clear deliverables, visible turnaround times, and a focused creative process from first files to final master."
        />

        <section className="px-4 pb-20 lg:px-8">
          <div className="container mx-auto">
            {services.length === 0 ? (
              <DribbbleCard padding="lg" className="mx-auto max-w-md py-16 text-center">
                <Headphones className="mx-auto mb-4 h-16 w-16 text-muted" />
                <h2 className="text-2xl font-black text-text">Services coming soon</h2>
                <p className="mb-8 mt-2 text-muted">This creator has not published a service yet.</p>
                <Link href={`${basePath}/beats`}>
                  <PillCTA as="span" variant="primary" icon={Music}>Browse beats instead</PillCTA>
                </Link>
              </DribbbleCard>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {services.map((service, index) => (
                  <StorefrontServiceCard
                    key={service._id}
                    title={service.title}
                    description={service.description}
                    turnaround={service.turnaround}
                    price={service.priceUSD}
                    href={`${basePath}/services/${service._id}`}
                    featured={index === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <StorefrontFooter workspaceName={workspaceName} basePath={basePath} />
    </>
  )
}

'use client'

import { DemoStorefrontShell } from '@/components/tenant-demo/DemoStorefrontShell'
import { demoServices } from '@/components/tenant-demo/demo-data'
import { StorefrontPageHeader, StorefrontServiceCard } from '@/components/tenant/storefront'

export default function DemoServicesPage() {
  return (
    <DemoStorefrontShell>
      <StorefrontPageHeader
        eyebrow="Built around the record"
        title="SERVICES THAT FINISH THE SONG"
        description="Clear deliverables, visible turnaround times, and a focused creative process from first files to final master."
      />

      <section className="px-4 pb-20 lg:px-8">
        <div className="container mx-auto grid grid-cols-1 gap-6 lg:grid-cols-3">
          {demoServices.map((service, index) => (
            <StorefrontServiceCard
              key={service.slug}
              title={service.title}
              description={service.shortDescription}
              turnaround={service.turnaround}
              price={service.price}
              href={`/tenant-demo/services/${service.slug}`}
              featured={index === 0}
            />
          ))}
        </div>
      </section>
    </DemoStorefrontShell>
  )
}

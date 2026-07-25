'use client'

import { DemoStorefrontShell } from '@/components/tenant-demo/DemoStorefrontShell'
import { getDemoService } from '@/components/tenant-demo/demo-data'
import { DribbbleCard, PillCTA } from '@/platform/ui'
import { ArrowLeft, Check, Clock, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function DemoServiceDetailPage() {
  const params = useParams<{ id: string }>()
  const service = getDemoService(params.id)

  if (!service) {
    return (
      <DemoStorefrontShell>
        <section className="flex min-h-[60vh] items-center justify-center px-4 text-center">
          <div>
            <h1 className="text-3xl font-black text-text">Service not found</h1>
            <Link href="/tenant-demo/services" className="mt-6 inline-block">
              <PillCTA as="span" variant="secondary">Back to services</PillCTA>
            </Link>
          </div>
        </section>
      </DemoStorefrontShell>
    )
  }

  return (
    <DemoStorefrontShell>
      <section className="px-4 py-6 lg:px-8">
        <div className="container mx-auto">
          <Link href="/tenant-demo/services" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-text">
            <ArrowLeft className="h-4 w-4" />
            Back to services
          </Link>
        </div>
      </section>

      <section className="px-4 pb-20 pt-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Demo Studio service</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-text md:text-6xl">{service.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{service.description}</p>

              <DribbbleCard padding="lg" className="mt-8">
                <h2 className="text-xl font-black text-text">What you receive</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent)/0.12)]">
                        <Check className="h-3 w-3 text-accent" />
                      </span>
                      <span className="text-sm text-muted">{feature}</span>
                    </div>
                  ))}
                </div>
              </DribbbleCard>
            </div>

            <aside>
              <DribbbleCard glow padding="lg" className="sticky top-24">
                <p className="text-sm text-muted">Starting at</p>
                <p className="mt-1 text-5xl font-black text-text">${service.price}</p>
                <div className="my-6 flex items-center gap-3 rounded-xl bg-[rgb(var(--accent)/0.08)] p-4">
                  <Clock className="h-5 w-5 text-accent" />
                  <span>
                    <span className="block text-xs text-muted">Turnaround</span>
                    <span className="font-bold text-text">{service.turnaround}</span>
                  </span>
                </div>
                <Link href={`/tenant-demo/contact?subject=${encodeURIComponent(service.title)}`}>
                  <PillCTA as="span" fullWidth size="lg" icon={MessageSquare}>Discuss this project</PillCTA>
                </Link>
                <p className="mt-4 text-center text-xs text-muted">Tell us about the song before booking.</p>
              </DribbbleCard>
            </aside>
          </div>
        </div>
      </section>
    </DemoStorefrontShell>
  )
}

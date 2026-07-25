'use client'

import { DemoStorefrontShell } from '@/components/tenant-demo/DemoStorefrontShell'
import { StorefrontPageHeader } from '@/components/tenant/storefront'
import { DribbbleCard, PillCTA } from '@/platform/ui'
import { CheckCircle2, Mail, MapPin, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'

export default function DemoContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    event.currentTarget.reset()
  }

  return (
    <DemoStorefrontShell>
      <StorefrontPageHeader
        eyebrow="Start with the song"
        title="TELL US WHAT YOU’RE MAKING"
        description="Share the stage of your project, the sound you are chasing, and where you need help."
        maxWidth="wide"
      />

      <section className="px-4 pb-20 lg:px-8">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[0.65fr_1.35fr]">
          <div className="space-y-4">
            <DribbbleCard padding="lg">
              <Mail className="mb-4 h-6 w-6 text-accent" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Email</p>
              <p className="mt-1 font-bold text-text">hello@demo-studio.test</p>
            </DribbbleCard>
            <DribbbleCard padding="lg">
              <MapPin className="mb-4 h-6 w-6 text-accent" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Studio</p>
              <p className="mt-1 font-bold text-text">Los Angeles · Remote worldwide</p>
            </DribbbleCard>
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Response window</p>
              <p className="mt-2 text-sm text-muted">Project requests are normally reviewed within one business day.</p>
            </div>
          </div>

          <DribbbleCard glow padding="lg">
            {submitted ? (
              <div className="flex min-h-[460px] flex-col items-center justify-center text-center" role="status">
                <CheckCircle2 className="h-14 w-14 text-accent" />
                <h2 className="mt-5 text-3xl font-black text-text">Message ready</h2>
                <p className="mt-2 max-w-md text-muted">
                  This is a safe demo, so nothing was sent. A live storefront would deliver this request to the producer.
                </p>
                <PillCTA variant="secondary" className="mt-6" onClick={() => setSubmitted(false)}>
                  Write another message
                </PillCTA>
              </div>
            ) : (
              <>
                <div className="mb-7 flex items-center gap-4">
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Project brief</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">
                      Name
                      <input
                        required
                        name="name"
                        className="mt-2 w-full rounded-xl border border-border bg-[rgb(var(--bg-2)/0.5)] px-4 py-3 text-base font-normal normal-case tracking-normal text-text outline-none transition-colors focus:border-accent"
                        placeholder="Your name"
                      />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">
                      Email
                      <input
                        required
                        type="email"
                        name="email"
                        className="mt-2 w-full rounded-xl border border-border bg-[rgb(var(--bg-2)/0.5)] px-4 py-3 text-base font-normal normal-case tracking-normal text-text outline-none transition-colors focus:border-accent"
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                    I need help with
                    <select
                      name="subject"
                      className="mt-2 w-full rounded-xl border border-border bg-[rgb(var(--bg-2)/0.5)] px-4 py-3 text-base font-normal normal-case tracking-normal text-text outline-none transition-colors focus:border-accent"
                    >
                      <option>Beat licensing</option>
                      <option>Mixing & mastering</option>
                      <option>Custom production</option>
                      <option>Vocal production</option>
                      <option>Something else</option>
                    </select>
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                    Project details
                    <textarea
                      required
                      name="message"
                      rows={7}
                      className="mt-2 w-full resize-none rounded-xl border border-border bg-[rgb(var(--bg-2)/0.5)] px-4 py-3 text-base font-normal normal-case tracking-normal text-text outline-none transition-colors focus:border-accent"
                      placeholder="Genre, references, deadline, and what is already recorded…"
                    />
                  </label>
                  <PillCTA type="submit" size="lg" icon={Send}>Send demo message</PillCTA>
                  <p className="text-xs text-muted">Demo only — this form does not transmit personal information.</p>
                </form>
              </>
            )}
          </DribbbleCard>
        </div>
      </section>
    </DemoStorefrontShell>
  )
}

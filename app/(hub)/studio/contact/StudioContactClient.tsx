'use client'

import { StudioHeader } from '@/components/hub/StudioHeader'
import { DribbbleCard, PillCTA } from '@/platform/ui'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { api } from 'convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const fieldClassName =
  'w-full rounded-xl border border-border bg-[rgb(var(--bg-2)/0.55)] px-4 py-3 text-text placeholder:text-muted focus:border-[rgb(var(--accent))]/60 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/15'

export function StudioContactClient() {
  const workspaces = useQuery(api.platform.workspaces.listUserWorkspaces)
  const workspace = workspaces?.[0]
  const updateContactDetails = useMutation(api.platform.workspaces.updateContactDetails)

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [responseTime, setResponseTime] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!workspace) return
    setEmail(workspace.contact?.email ?? '')
    setPhone(workspace.contact?.phone ?? '')
    setLocation(workspace.contact?.location ?? '')
    setResponseTime(workspace.contact?.responseTime ?? '')
  }, [workspace])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!workspace) return

    setIsSaving(true)
    setStatus('idle')
    setError('')

    try {
      await updateContactDetails({
        workspaceId: workspace._id,
        contact: { email, phone, location, responseTime },
      })
      setStatus('saved')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Contact details could not be saved.')
      setStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  if (workspaces === undefined) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] pt-24">
        <StudioHeader />
        <main className="mx-auto max-w-3xl px-6 py-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[rgb(var(--accent))]" />
        </main>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] pt-24">
        <StudioHeader />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <DribbbleCard padding="lg" className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
            <h1 className="text-xl font-bold">No storefront found</h1>
            <p className="mt-2 text-sm text-muted">
              Create your storefront before adding public contact details.
            </p>
            <Link href="/studio/workspace/new" className="mt-6 inline-block">
              <PillCTA variant="primary" size="md">Create storefront</PillCTA>
            </Link>
          </DribbbleCard>
        </main>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-[rgb(var(--bg))] p-6 pt-24"
      variants={dribbblePageEnter}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <StudioHeader />
      <main className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Storefront</p>
            <h1 className="text-3xl font-bold uppercase tracking-wide sm:text-4xl">Contact details</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Only completed fields appear publicly. Leave a field empty to hide it.
            </p>
          </div>
          <Link
            href={`/${workspace.slug}/contact`}
            target="_blank"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[rgb(var(--accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
          >
            View contact page
            <ExternalLink className="h-4 w-4" />
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <DribbbleCard padding="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold" htmlFor="contact-email">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[rgb(var(--accent))]" />
                    Email
                  </span>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setStatus('idle') }}
                    placeholder="hello@yourstudio.com"
                    className={fieldClassName}
                  />
                </label>

                <label className="space-y-2 text-sm font-semibold" htmlFor="contact-phone">
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[rgb(var(--accent))]" />
                    Phone
                  </span>
                  <input
                    id="contact-phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    value={phone}
                    onChange={(event) => { setPhone(event.target.value); setStatus('idle') }}
                    placeholder="+33 6 12 34 56 78"
                    className={fieldClassName}
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm font-semibold" htmlFor="contact-location">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[rgb(var(--accent))]" />
                  Location
                </span>
                <input
                  id="contact-location"
                  type="text"
                  autoComplete="address-level2"
                  maxLength={120}
                  value={location}
                  onChange={(event) => { setLocation(event.target.value); setStatus('idle') }}
                  placeholder="Paris, France"
                  className={fieldClassName}
                />
              </label>

              <label className="block space-y-2 text-sm font-semibold" htmlFor="contact-response-time">
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[rgb(var(--accent))]" />
                  Typical response time
                </span>
                <input
                  id="contact-response-time"
                  type="text"
                  maxLength={80}
                  value={responseTime}
                  onChange={(event) => { setResponseTime(event.target.value); setStatus('idle') }}
                  placeholder="Usually within 24 hours"
                  className={fieldClassName}
                />
              </label>

              {status === 'error' && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <PillCTA type="submit" variant="primary" size="md" disabled={isSaving}>
                  {isSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </span>
                  ) : 'Save changes'}
                </PillCTA>
                {status === 'saved' && (
                  <p role="status" className="inline-flex items-center gap-2 text-sm font-semibold text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Contact details saved
                  </p>
                )}
              </div>
            </form>
          </DribbbleCard>

          <DribbbleCard padding="lg" className="h-fit">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--accent))]">
              Public preview
            </p>
            <h2 className="mt-2 text-xl font-bold text-text">{workspace.name}</h2>
            <div className="mt-5 space-y-4 text-sm">
              {email && <p className="flex items-center gap-3 break-all text-muted"><Mail className="h-4 w-4 shrink-0 text-[rgb(var(--accent))]" />{email}</p>}
              {phone && <p className="flex items-center gap-3 text-muted"><Phone className="h-4 w-4 shrink-0 text-[rgb(var(--accent))]" />{phone}</p>}
              {location && <p className="flex items-center gap-3 text-muted"><MapPin className="h-4 w-4 shrink-0 text-[rgb(var(--accent))]" />{location}</p>}
              {responseTime && <p className="flex items-center gap-3 text-muted"><Clock3 className="h-4 w-4 shrink-0 text-[rgb(var(--accent))]" />{responseTime}</p>}
              {!email && !phone && !location && !responseTime && (
                <p className="rounded-xl border border-dashed border-border p-4 text-muted">
                  Add at least one detail to make it visible on your contact page.
                </p>
              )}
            </div>
          </DribbbleCard>
        </div>
      </main>
    </motion.div>
  )
}

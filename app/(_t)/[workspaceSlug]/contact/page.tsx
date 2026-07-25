'use client'

import { useWorkspace } from '@/components/tenant'
import { StorefrontFooter, StorefrontPageHeader } from '@/components/tenant/storefront'
import {
  DribbbleCard,
  DribbbleSectionEnter,
  PillCTA,
} from '@/platform/ui'
import { Mail, MapPin, Phone } from 'lucide-react'
import { useParams, useSearchParams } from 'next/navigation'

/**
 * Contact Page
 *
 * Displays contact information and a simple contact form.
 *
 * Requirements: 21.6 (contact page with provider contact info or simple form)
 */
export default function ContactPage() {
  const { workspace, isLoading } = useWorkspace()
  const params = useParams()
  const searchParams = useSearchParams()
  const workspaceSlug = params.workspaceSlug as string
  const requestedSubject = searchParams.get('subject')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  const workspaceName = workspace?.name?.toUpperCase() ?? workspaceSlug.toUpperCase()
  const contact = workspace?.contact
  const contactItems = [
    contact?.email
      ? { label: 'Email', value: contact.email, href: `mailto:${contact.email}`, icon: Mail }
      : null,
    contact?.phone
      ? { label: 'Phone', value: contact.phone, href: `tel:${contact.phone.replaceAll(/[^\d+]/g, '')}`, icon: Phone }
      : null,
    contact?.location
      ? { label: 'Location', value: contact.location, icon: MapPin }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!contact?.email) return

    const formData = new FormData(event.currentTarget)
    const senderName = String(formData.get('name') ?? '').trim()
    const senderEmail = String(formData.get('email') ?? '').trim()
    const subject = String(formData.get('subject') ?? 'General Inquiry')
    const message = String(formData.get('message') ?? '').trim()
    const body = [`From: ${senderName}`, `Reply to: ${senderEmail}`, '', message].join('\n')

    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <>
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        <StorefrontPageHeader
          eyebrow="Start with the song"
          title="TELL US WHAT YOU’RE MAKING"
          description="Share the stage of your project, the sound you are chasing, and where you need help."
          maxWidth="wide"
        />

        {/* Contact Content */}
        <section className="px-4 lg:px-8 py-12 pb-20">
          <div className="container mx-auto max-w-6xl">
            <DribbbleSectionEnter>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-4">
                  {contactItems.map(({ label, value, href, icon: Icon }, index) => (
                    <DribbbleCard key={label} padding="lg" hoverLift>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          index === 0
                            ? 'bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))]'
                            : 'bg-[rgb(var(--accent)/0.15)]'
                        }`}>
                          <Icon className={`w-6 h-6 ${index === 0 ? 'text-white' : 'text-accent'}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-text mb-1">{label}</h3>
                          {href ? (
                            <a href={href} className="break-words text-sm text-muted transition-colors hover:text-accent">
                              {value}
                            </a>
                          ) : (
                            <p className="break-words text-sm text-muted">{value}</p>
                          )}
                        </div>
                      </div>
                    </DribbbleCard>
                  ))}

                  {contactItems.length === 0 && !contact?.responseTime && (
                    <DribbbleCard padding="lg">
                      <p className="text-sm font-bold text-text">Contact details coming soon</p>
                      <p className="mt-1 text-sm text-muted">
                        This creator has not published their contact details yet.
                      </p>
                    </DribbbleCard>
                  )}

                  {contact?.responseTime && (
                    <div className="p-4 rounded-xl border border-[rgb(var(--accent)/0.2)] bg-[rgb(var(--accent)/0.05)]">
                      <p className="text-xs text-muted uppercase tracking-widest mb-1">Response Time</p>
                      <p className="text-sm font-bold text-text">{contact.responseTime}</p>
                    </div>
                  )}
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <DribbbleCard glow padding="lg">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-xs font-bold text-accent uppercase tracking-widest">SEND A MESSAGE</span>
                      <div className="h-px flex-1 bg-[rgb(var(--border)/0.5)]" />
                    </div>
                    {contact?.email ? (
                    <form className="space-y-5" onSubmit={handleContactSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="name" className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-2)/0.5)] border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-2)/0.5)] border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          defaultValue={requestedSubject ?? 'General Inquiry'}
                          className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-2)/0.5)] border border-border/50 text-text focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
                        >
                          {requestedSubject && ![
                            'General Inquiry',
                            'Beat Licensing',
                            'Service Booking',
                            'Custom Production',
                            'Technical Support',
                          ].includes(requestedSubject) && (
                            <option value={requestedSubject}>{requestedSubject}</option>
                          )}
                          <option>General Inquiry</option>
                          <option>Beat Licensing</option>
                          <option>Service Booking</option>
                          <option>Custom Production</option>
                          <option>Technical Support</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={6}
                          className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-2)/0.5)] border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
                          placeholder="Tell us about your project..."
                        />
                      </div>

                      <PillCTA type="submit" variant="primary" size="lg" className="w-full sm:w-auto cursor-pointer">
                        Send Message
                      </PillCTA>
                    </form>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border p-8 text-center">
                        <Mail className="mx-auto h-8 w-8 text-muted" />
                        <p className="mt-4 font-bold text-text">Message form unavailable</p>
                        <p className="mt-1 text-sm text-muted">
                          This creator has not published an email address yet.
                        </p>
                      </div>
                    )}
                  </DribbbleCard>
                </div>
              </div>
            </DribbbleSectionEnter>
          </div>
        </section>
      </div>

      <StorefrontFooter workspaceName={workspaceName} basePath={`/${workspaceSlug}`} />
    </>
  )
}

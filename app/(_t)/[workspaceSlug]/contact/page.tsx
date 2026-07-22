'use client'

import { useWorkspace } from '@/components/tenant'
import {
  DribbbleCard,
  DribbbleSectionEnter,
  GlassFooter,
  PillCTA,
  WavyLines,
} from '@/platform/ui'
import { Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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
  const workspaceSlug = params.workspaceSlug as string

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

  return (
    <>
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        {/* Page Header */}
        <section className="relative px-4 lg:px-8 pt-12 pb-8 overflow-hidden">
          <WavyLines className="right-0 top-0 w-[100px] h-full opacity-40" />
          <div className="container mx-auto max-w-4xl">
            <DribbbleSectionEnter>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-bold text-accent uppercase tracking-widest">03</span>
                <div className="h-px w-16 bg-[rgb(var(--border)/0.5)]" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-text mb-2 tracking-tight">GET IN TOUCH</h1>
              <p className="text-muted text-lg">
                Have questions about beats or services? We&apos;d love to hear from you.
              </p>
            </DribbbleSectionEnter>
          </div>
        </section>

        {/* Contact Content */}
        <section className="px-4 lg:px-8 py-12 pb-20">
          <div className="container mx-auto max-w-6xl">
            <DribbbleSectionEnter>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-4">
                  <DribbbleCard padding="lg" hoverLift>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text mb-1">Email</h3>
                        <p className="text-sm text-muted">contact@{workspace?.slug}.com</p>
                      </div>
                    </div>
                  </DribbbleCard>

                  <DribbbleCard padding="lg" hoverLift>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text mb-1">Phone</h3>
                        <p className="text-sm text-muted">+1 (555) 123-4567</p>
                      </div>
                    </div>
                  </DribbbleCard>

                  <DribbbleCard padding="lg" hoverLift>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text mb-1">Location</h3>
                        <p className="text-sm text-muted">Los Angeles, CA</p>
                      </div>
                    </div>
                  </DribbbleCard>

                  <div className="p-4 rounded-xl border border-[rgb(var(--accent)/0.2)] bg-[rgb(var(--accent)/0.05)]">
                    <p className="text-xs text-muted uppercase tracking-widest mb-1">Response Time</p>
                    <p className="text-sm font-bold text-text">Usually within 24 hours</p>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <DribbbleCard glow padding="lg">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-xs font-bold text-accent uppercase tracking-widest">SEND A MESSAGE</span>
                      <div className="h-px flex-1 bg-[rgb(var(--border)/0.5)]" />
                    </div>
                    <form className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="name" className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
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
                          className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-2)/0.5)] border border-border/50 text-text focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
                        >
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
                          rows={6}
                          className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--bg-2)/0.5)] border border-border/50 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
                          placeholder="Tell us about your project..."
                        />
                      </div>

                      <PillCTA variant="primary" size="lg" className="w-full sm:w-auto cursor-pointer">
                        Send Message
                      </PillCTA>
                    </form>
                  </DribbbleCard>
                </div>
              </div>
            </DribbbleSectionEnter>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <GlassFooter className="py-12 px-4 lg:px-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center text-white font-bold select-none">
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

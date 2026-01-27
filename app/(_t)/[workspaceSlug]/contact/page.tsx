'use client'

import { useWorkspace } from '@/components/tenant'
import {
    DribbbleCard,
    DribbbleSectionEnter,
    PillCTA,
} from '@/platform/ui'
import { Mail, MapPin, Phone } from 'lucide-react'

/**
 * Contact Page
 * 
 * Displays contact information and a simple contact form.
 * Placeholder implementation - will be replaced with real data.
 * 
 * Requirements: 21.6 (contact page with provider contact info or simple form)
 */
export default function ContactPage() {
  const { workspace, isLoading } = useWorkspace()

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

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <section className="px-4 lg:px-8 py-12">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-text mb-4">Get In Touch</h1>
          <p className="text-muted text-lg">
            Have questions about our beats or services? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="px-4 lg:px-8 py-12">
        <div className="container mx-auto max-w-6xl">
          <DribbbleSectionEnter>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="lg:col-span-1 space-y-6">
                <DribbbleCard padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text mb-1">Email</h3>
                      <p className="text-sm text-muted">contact@{workspace?.slug}.com</p>
                    </div>
                  </div>
                </DribbbleCard>

                <DribbbleCard padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text mb-1">Phone</h3>
                      <p className="text-sm text-muted">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </DribbbleCard>

                <DribbbleCard padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text mb-1">Location</h3>
                      <p className="text-sm text-muted">Los Angeles, CA</p>
                    </div>
                  </div>
                </DribbbleCard>

                <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
                  <p className="text-sm text-muted mb-2">Response Time</p>
                  <p className="text-sm text-text font-medium">Usually within 24 hours</p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <DribbbleCard glow padding="lg">
                  <h2 className="text-2xl font-bold text-text mb-6">Send a Message</h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                          Name
                        </label>
                        <DribbbleCard padding="sm">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full bg-transparent text-text placeholder:text-muted focus:outline-none"
                            placeholder="Your name"
                          />
                        </DribbbleCard>
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                          Email
                        </label>
                        <DribbbleCard padding="sm">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full bg-transparent text-text placeholder:text-muted focus:outline-none"
                            placeholder="your@email.com"
                          />
                        </DribbbleCard>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-text mb-2">
                        Subject
                      </label>
                      <DribbbleCard padding="sm">
                        <select
                          id="subject"
                          name="subject"
                          className="w-full bg-transparent text-text focus:outline-none"
                        >
                          <option>General Inquiry</option>
                          <option>Beat Licensing</option>
                          <option>Service Booking</option>
                          <option>Custom Production</option>
                          <option>Technical Support</option>
                        </select>
                      </DribbbleCard>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-text mb-2">
                        Message
                      </label>
                      <DribbbleCard padding="sm">
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          className="w-full bg-transparent text-text placeholder:text-muted focus:outline-none resize-none"
                          placeholder="Tell us about your project..."
                        />
                      </DribbbleCard>
                    </div>

                    <PillCTA variant="primary" size="lg" className="w-full md:w-auto">
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
  )
}

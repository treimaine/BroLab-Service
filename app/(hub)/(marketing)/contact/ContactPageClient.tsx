'use client'

import {
    DribbbleCard,
    DribbbleSectionEnter,
    DribbbleStaggerItem,
    MarketingPageShell,
    PillCTA,
    SectionHeader,
} from '@/platform/ui'
import {
    ArrowRight,
    Clock,
    Mail,
    MessageSquare,
    Music,
    Send,
    Sparkles,
    User,
    Users,
} from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'

// ============ Types ============

type RoleType = 'producer' | 'engineer' | 'artist' | 'brand' | ''

interface FormData {
  name: string
  email: string
  role: RoleType
  message: string
}

// ============ Data ============

const ROLES = [
  { value: 'producer', label: 'Producer', icon: Music },
  { value: 'engineer', label: 'Engineer', icon: Sparkles },
  { value: 'artist', label: 'Artist', icon: User },
  { value: 'brand', label: 'Brand', icon: Users },
] as const

const SUPPORT_INFO = {
  email: 'support@brolabentertainment.com',
  responseTime: '24-48 hours',
}

// ============ Components ============

function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (isSubmitted) {
    return (
      <DribbbleCard padding="lg" glow className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
          <Send className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-xl font-bold text-text mb-2">Message Sent!</h3>
        <p className="text-muted mb-6">
          Thanks for reaching out. We&apos;ll get back to you within {SUPPORT_INFO.responseTime}.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false)
            setFormData({ name: '', email: '', role: '', message: '' })
          }}
          className="text-accent hover:underline text-sm font-medium"
        >
          Send another message
        </button>
      </DribbbleCard>
    )
  }

  return (
    <DribbbleCard padding="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-[rgba(var(--bg),0.5)] border border-border text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            placeholder="Your name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-[rgba(var(--bg),0.5)] border border-border text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>

        {/* Role Selector */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-text mb-2">
            I am a...
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES.map((role) => {
              const isSelected = formData.role === role.value
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: role.value }))}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                    focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg))]
                    ${isSelected
                      ? 'bg-[rgba(var(--accent),0.15)] border-accent text-accent'
                      : 'bg-[rgba(var(--bg),0.5)] border-border text-muted hover:border-accent/50 hover:text-text'
                    }
                  `}
                >
                  <role.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{role.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-[rgba(var(--bg),0.5)] border border-border text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
            placeholder="How can we help you?"
          />
        </div>

        {/* Submit */}
        <PillCTA
          variant="primary"
          size="lg"
          className="w-full justify-center"
          icon={Send}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </PillCTA>
      </form>
    </DribbbleCard>
  )
}

function SupportInfoSection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Support */}
            <DribbbleStaggerItem>
              <DribbbleCard padding="lg" hoverLift className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(var(--accent),0.1)] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text mb-1">Email Support</h3>
                    <p className="text-muted text-sm mb-3">
                      Reach out directly for any questions or support needs.
                    </p>
                    <a
                      href={`mailto:${SUPPORT_INFO.email}`}
                      className="text-accent hover:underline text-sm font-medium inline-flex items-center gap-1"
                    >
                      {SUPPORT_INFO.email}
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </DribbbleCard>
            </DribbbleStaggerItem>

            {/* Response Time */}
            <DribbbleStaggerItem>
              <DribbbleCard padding="lg" hoverLift className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(var(--accent),0.1)] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text mb-1">Response Time</h3>
                    <p className="text-muted text-sm mb-3">
                      We aim to respond to all inquiries promptly.
                    </p>
                    <span className="text-accent text-sm font-medium">
                      Within {SUPPORT_INFO.responseTime}
                    </span>
                  </div>
                </div>
              </DribbbleCard>
            </DribbbleStaggerItem>
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

function ContactFormSection() {
  return (
    <section className="py-16 px-4 bg-[rgba(var(--bg-2),0.3)]">
      <div className="container mx-auto max-w-2xl">
        <DribbbleSectionEnter>
          <SectionHeader
            title="GET IN TOUCH"
            subtitle="Fill out the form below and we'll get back to you"
          />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter>
          <div className="mt-8">
            <ContactForm />
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

function FAQCTASection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <DribbbleSectionEnter>
          <DribbbleCard padding="lg" className="text-center relative overflow-hidden">
            {/* Decorative glows */}
            <div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(var(--accent),0.15) 0%, transparent 70%)' }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(var(--accent-2),0.15) 0%, transparent 70%)' }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-text mb-3">
                Have questions about pricing?
              </h2>
              <p className="text-muted mb-6 max-w-md mx-auto text-sm">
                Check out our pricing page for detailed plan comparisons and FAQs.
              </p>
              <Link href="/pricing">
                <PillCTA variant="secondary" size="md" icon={ArrowRight}>
                  View Pricing & FAQ
                </PillCTA>
              </Link>
            </div>
          </DribbbleCard>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

// ============ Main Page ============

export default function ContactPageClient() {
  return (
    <MarketingPageShell
      heroWord="CONTACT"
      seoTitle="Contact BroLab Entertainment - Get in Touch"
      eyebrow="Reach Out"
      subtitle="Questions, feedback, or partnership inquiries? We'd love to hear from you."
      variant="default"
      microItems={[
        { text: 'Quick response time' },
        { text: 'Dedicated support' },
        { text: 'Partnership opportunities' },
      ]}
    >
      {/* Support Info Cards */}
      <SupportInfoSection />

      {/* Contact Form */}
      <ContactFormSection />

      {/* FAQ CTA */}
      <FAQCTASection />
    </MarketingPageShell>
  )
}

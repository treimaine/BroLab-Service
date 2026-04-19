'use client'

/**
 * Interview Request Page Client Component
 *
 * Client-side wrapper for the interviews page with Framer Motion animations.
 */

import { InterviewRequestForm } from '@/components/interviews/InterviewRequestForm'
import { DribbbleCard } from '@/platform/ui'
import { motion } from 'framer-motion'

export function InterviewsPageClient() {
  return (
    <div className="min-h-screen bg-bg text-text py-16 px-4">
      <motion.div
        className="container mx-auto max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Join Our Feedback Loop
          </h1>
          <p className="text-lg text-muted">
            Help shape the future of BroLab by sharing your feedback in a quick 15-minute interview.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Clock,
              title: 'Only 15 Minutes',
              description: 'Quick and focused conversation',
            },
            {
              icon: MessageSquare,
              title: 'Your Voice Matters',
              description: 'Direct impact on product decisions',
            },
            {
              icon: Mail,
              title: 'Exclusive Updates',
              description: 'Get insider news about BroLab',
            },
          ].map((benefit) => {
            const Icon = benefit.icon
            return (
              <DribbbleCard key={benefit.title} padding="md" className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted">{benefit.description}</p>
              </DribbbleCard>
            )
          })}
        </div>

        {/* Form */}
        <InterviewRequestForm />

        {/* FAQ */}
        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>

          {[
            {
              q: "What will we talk about?",
              a: "We'll discuss your experience with BroLab, what's working well, and where we can improve. It's a relaxed conversation focused on your feedback.",
            },
            {
              q: "Do I need to prepare anything?",
              a: "No preparation needed! Just be ready to share your honest thoughts about your experience with BroLab.",
            },
            {
              q: "Will my feedback be kept confidential?",
              a: "Absolutely. Your feedback is confidential and used only to improve BroLab. We value your insights and privacy.",
            },
          ].map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <DribbbleCard padding="md">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted">{faq.a}</p>
              </DribbbleCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Icons
function Clock({ className }: Readonly<{ className?: string }>) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
}

function MessageSquare({ className }: Readonly<{ className?: string }>) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
}

function Mail({ className }: Readonly<{ className?: string }>) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
}

'use client'

import { DribbbleCard, DribbbleSectionEnter, DribbbleStaggerItem } from '@/platform/ui'
import { useState } from 'react'

const FAQS = [
  {
    question: 'Do I need a Stripe account?',
    answer: 'Yes, you\'ll connect your own Stripe account during onboarding. This allows artists to pay you directly—no middleman. BroLab uses Stripe Connect to route payments straight to your bank.',
  },
  {
    question: 'How are licenses delivered?',
    answer: 'Licenses are generated automatically as PDFs when an artist completes a purchase. They receive an email with a link to their dashboard where they can download both the audio files and the license document.',
  },
  {
    question: 'Can I sell both beats and services?',
    answer: 'Absolutely! Your storefront supports both beat sales (with tiered licensing: Basic, Premium, Unlimited) and service bookings (mixing, mastering, vocal tuning, etc.) all in one place.',
  },
  {
    question: 'What commission does BroLab take?',
    answer: 'For MVP, BroLab takes 0% commission on sales. You only pay the standard Stripe processing fees (around 2.9% + $0.30 per transaction). Your subscription covers platform access.',
  },
  {
    question: 'Can I use a custom domain?',
    answer: 'PRO subscribers can connect up to 2 custom domains to their storefront. BASIC plan users get a subdomain (yourname.brolabentertainment.com) which works great for most creators.',
  },
  {
    question: 'Is there a free plan?',
    answer: 'We offer a free trial to explore the platform. After that, BASIC starts at $9.99/month (or $59.99/year—50% off). PRO is $29.99/month (or $107.99/year—70% off) with unlimited tracks and custom domains.',
  },
] as const

const SectionHeader = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-center gap-4 mb-12">
    <span className="text-xs font-bold text-accent uppercase tracking-widest">{number}</span>
    <h2 className="text-sm font-bold text-muted uppercase tracking-widest">{title}</h2>
    <div className="h-px w-24 bg-[rgba(var(--border),0.5)]" />
  </div>
)

const FAQItem = ({ 
  faq, 
  isOpen, 
  onToggle 
}: { 
  faq: typeof FAQS[number]
  isOpen: boolean
  onToggle: () => void
}) => {
  const faqId = `faq-${faq.question.toLowerCase().replaceAll(/[^a-z0-9]/g, '-').slice(0, 30)}`
  
  return (
    <DribbbleCard 
      hoverLift={!isOpen} 
      padding="none" 
      className="overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-[rgba(var(--accent),0.03)]"
        aria-expanded={isOpen}
        aria-controls={`${faqId}-answer`}
      >
        <span className="text-sm font-bold text-text uppercase tracking-wide pr-4">
          {faq.question}
        </span>
        <span 
          className={`text-accent text-xl transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      
      <div
        id={`${faqId}-answer`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 pt-0">
          <p className="text-muted text-sm leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    </DribbbleCard>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="px-4 py-24 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter>
          <SectionHeader number="04" title="FAQ" />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter stagger>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <DribbbleStaggerItem key={faq.question}>
                <FAQItem
                  faq={faq}
                  isOpen={openIndex === idx}
                  onToggle={() => toggleFAQ(idx)}
                />
              </DribbbleStaggerItem>
            ))}
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

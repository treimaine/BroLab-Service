import type { Metadata } from 'next'
import PricingPageClient from './PricingPageClient'

/**
 * Pricing Page - ELECTRI-X Design Language
 * 
 * Uses MarketingPageShell for canonical hero.
 * Displays BASIC and PRO plan comparison with feature table,
 * FAQ section, and trust badges.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 3.9, 3.10, 31
 */

export const metadata: Metadata = {
  title: 'Pricing Plans - BroLab Entertainment',
  description: 'Choose the perfect plan for your music business. BASIC at $9.99/month or PRO at $29.99/month. No platform fees on your sales. Start selling beats and services today.',
  keywords: ['music producer pricing', 'beat selling platform', 'audio engineer pricing', 'music marketplace', 'beat store pricing'],
  openGraph: {
    title: 'Pricing Plans - BroLab Entertainment',
    description: 'Choose the perfect plan for your music business. BASIC at $9.99/month or PRO at $29.99/month. No platform fees on your sales.',
    url: 'https://brolabentertainment.com/pricing',
    siteName: 'BroLab Entertainment',
    type: 'website',
    images: [
      {
        url: '/og-pricing.png',
        width: 1200,
        height: 630,
        alt: 'BroLab Entertainment Pricing Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans - BroLab Entertainment',
    description: 'Choose the perfect plan for your music business. BASIC at $9.99/month or PRO at $29.99/month. No platform fees.',
    images: ['/og-pricing.png'],
  },
  alternates: {
    canonical: 'https://brolabentertainment.com/pricing',
  },
}

// FAQ data for JSON-LD schema
const FAQ_ITEMS = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure billing partner. All payments are processed securely via Stripe.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes! You can upgrade to PRO at any time and the price difference will be prorated. Downgrading takes effect at the end of your current billing period.',
  },
  {
    question: 'What happens to my tracks if I downgrade?',
    answer: 'Your existing tracks remain accessible, but you won\'t be able to publish new tracks until you\'re within the BASIC plan limits (25 published tracks, 1GB storage).',
  },
  {
    question: 'How do artist payments work?',
    answer: 'When artists purchase your beats or services, payments go directly to your connected Stripe account. We don\'t take any platform fee on your sales.',
  },
  {
    question: 'Can I use my own domain?',
    answer: 'PRO subscribers can connect up to 2 custom domains to their storefront. BASIC subscribers use a subdomain (yourname.brolabentertainment.com).',
  },
  {
    question: 'What\'s included in the license PDF?',
    answer: 'Each sale automatically generates a professional PDF license containing the buyer\'s info, license tier rights, usage limits, and publishing splits.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'We don\'t offer a free trial, but you can start with the BASIC plan at just $9.99/month. Annual plans offer significant savings (50-70% off).',
  },
  {
    question: 'What happens if I cancel?',
    answer: 'Your storefront remains accessible until the end of your billing period. After that, your storefront goes offline but your data is preserved for 30 days.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 14-day money-back guarantee for new subscribers. Contact support within 14 days of your first payment for a full refund.',
  },
  {
    question: 'How do I connect Stripe?',
    answer: 'During onboarding, you\'ll be guided through Stripe Connect setup. It takes about 5 minutes and requires basic business information.',
  },
]

// Generate FAQPage JSON-LD schema
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function PricingPage() {
  return (
    <>
      {/* FAQPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PricingPageClient />
    </>
  )
}

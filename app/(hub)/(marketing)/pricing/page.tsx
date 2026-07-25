import PricingPageClient from '@/components/hub/PricingPageClient'
import { GrowthTracker } from '@/components/growth/GrowthTracker'
import { PRICING_FAQ_ITEMS } from '@/components/hub/pricing-content'
import type { Metadata } from 'next'

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
    url: '/pricing',
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
    canonical: '/pricing',
  },
}

// Generate FAQPage JSON-LD schema
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PRICING_FAQ_ITEMS.map((item) => ({
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
      <GrowthTracker viewEvent="pricing_view" />
      {/* FAQPage JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PricingPageClient />
    </>
  )
}

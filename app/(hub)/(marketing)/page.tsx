import HubLandingPageClient from '@/components/hub/HubLandingPageClient'
import { GrowthTracker } from '@/components/growth/GrowthTracker'
import type { Metadata } from 'next'

/**
 * Hub Landing Page - ELECTRI-X Design Language
 * Based on Dribbble reference frames
 */

export const metadata: Metadata = {
  title: 'BroLab Entertainment - Your Music, Your Brand, Your Revenue',
  description: 'Launch your music storefront in minutes. Sell beats and services directly to artists with zero platform fees. Custom domains, automatic licensing, and direct Stripe payments.',
  keywords: ['music producer platform', 'sell beats online', 'audio engineer services', 'music marketplace', 'beat store', 'producer storefront', 'music licensing'],
  openGraph: {
    title: 'BroLab Entertainment - Your Music, Your Brand, Your Revenue',
    description: 'Launch your music storefront in minutes. Sell beats and services with zero platform fees.',
    url: '/',
    siteName: 'BroLab Entertainment',
    type: 'website',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'BroLab Entertainment - Music Producer Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BroLab Entertainment - Your Music, Your Brand, Your Revenue',
    description: 'Launch your music storefront in minutes. Sell beats and services with zero platform fees.',
    images: ['/og-home.png'],
    creator: '@brolabent',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const BASE_URL = 'https://brolabentertainment.com'

const FAQ_ITEMS = [
  {
    question: 'Do I need a Stripe account?',
    answer: "Yes, you'll connect your own Stripe account during onboarding. This allows artists to pay you directly—no middleman. BroLab uses Stripe Connect to route payments straight to your bank.",
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
    answer: 'Every account starts free for setup, then providers choose BASIC or PRO to publish and sell. New paid-plan subscriptions include one free month.',
  },
]

export default function HubLandingPage() {
  const graphSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'BroLab Entertainment',
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/logo.png`,
        },
        sameAs: ['https://twitter.com/brolabent'],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@brolabentertainment.com',
          contactType: 'customer support',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        name: 'BroLab Entertainment',
        url: BASE_URL,
        description: 'Launch your music storefront in minutes. Sell beats and services directly to artists with zero platform fees.',
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${BASE_URL}/#software`,
        name: 'BroLab Entertainment',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'Launch your music storefront in minutes. Sell beats and services directly to artists with zero platform fees. Custom domains, automatic licensing, and direct Stripe payments.',
        url: BASE_URL,
        offers: [
          {
            '@type': 'Offer',
            name: 'BASIC Plan',
            description: 'Perfect for getting started - 25 published tracks, 1GB storage, subdomain storefront',
            price: '9.99',
            priceCurrency: 'USD',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '9.99',
              priceCurrency: 'USD',
              referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' },
            },
          },
          {
            '@type': 'Offer',
            name: 'BASIC Plan (Annual)',
            description: 'Perfect for getting started - 25 published tracks, 1GB storage, subdomain storefront. Save 50% with annual billing.',
            price: '59.99',
            priceCurrency: 'USD',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '59.99',
              priceCurrency: 'USD',
              referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'ANN' },
            },
          },
          {
            '@type': 'Offer',
            name: 'PRO Plan',
            description: 'For serious creators - Unlimited tracks, 50GB storage, 2 custom domains, priority support',
            price: '29.99',
            priceCurrency: 'USD',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '29.99',
              priceCurrency: 'USD',
              referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'MON' },
            },
          },
          {
            '@type': 'Offer',
            name: 'PRO Plan (Annual)',
            description: 'For serious creators - Unlimited tracks, 50GB storage, 2 custom domains, priority support. Save 70% with annual billing.',
            price: '107.99',
            priceCurrency: 'USD',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '107.99',
              priceCurrency: 'USD',
              referenceQuantity: { '@type': 'QuantitativeValue', value: '1', unitCode: 'ANN' },
            },
          },
        ],
        featureList: [
          'Direct Stripe payments with 0% platform fee',
          'Automatic 30-second preview generation',
          'Professional license PDF generation',
          'Custom subdomain storefront',
          'Service listings for mixing, mastering, and more',
          'Multi-tier licensing (Basic, Premium, Unlimited)',
          'Real-time analytics dashboard',
          'Custom domain support (PRO)',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${BASE_URL}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  return (
    <>
      <GrowthTracker viewEvent="landing_view" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
      />
      <HubLandingPageClient />
    </>
  )
}

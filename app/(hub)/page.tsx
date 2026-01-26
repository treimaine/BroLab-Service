import HubLandingPageClient from '@/components/hub/HubLandingPageClient'
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
    url: 'https://brolabentertainment.com',
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
    canonical: 'https://brolabentertainment.com',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HubLandingPage() {
  // SoftwareApplication JSON-LD Schema for SEO
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BroLab Entertainment',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Launch your music storefront in minutes. Sell beats and services directly to artists with zero platform fees. Custom domains, automatic licensing, and direct Stripe payments.',
    url: 'https://brolabentertainment.com',
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
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitCode: 'MON',
          },
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
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitCode: 'ANN',
          },
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
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitCode: 'MON',
          },
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
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitCode: 'ANN',
          },
        },
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
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
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <HubLandingPageClient />
    </>
  )
}

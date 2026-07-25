import TermsPageClient from '@/components/hub/TermsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - BroLab Entertainment',
  description:
    'BroLab Entertainment Terms of Service. Read our terms and conditions for using the platform. Provider and Artist terms, licensing, payments, and more. Last updated January 10, 2026.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'user agreement',
    'platform terms',
    'legal terms',
  ],
  openGraph: {
    title: 'Terms of Service - BroLab Entertainment',
    description:
      'Read our terms and conditions for using the BroLab Entertainment platform.',
    url: '/terms',
    siteName: 'BroLab Entertainment',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service - BroLab Entertainment',
    description: 'Read our terms and conditions for using the platform.',
  },
  alternates: {
    canonical: '/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const TERMS_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Service - BroLab Entertainment',
  url: 'https://brolabentertainment.com/terms',
  description:
    'BroLab Entertainment Terms of Service. Read our terms and conditions for using the platform.',
  dateModified: '2026-01-10',
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: 'BroLab Entertainment',
    url: 'https://brolabentertainment.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'BroLab Entertainment',
    url: 'https://brolabentertainment.com',
  },
}

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(TERMS_PAGE_SCHEMA) }}
      />
      <TermsPageClient />
    </>
  )
}

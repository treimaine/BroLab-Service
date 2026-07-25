import PrivacyPageClient from '@/components/hub/PrivacyPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - BroLab Entertainment',
  description:
    'BroLab Entertainment Privacy Policy. Learn how we collect, use, and protect your personal information. GDPR and CCPA compliant. Last updated January 10, 2026.',
  keywords: [
    'privacy policy',
    'data protection',
    'GDPR',
    'CCPA',
    'user privacy',
    'data security',
  ],
  openGraph: {
    title: 'Privacy Policy - BroLab Entertainment',
    description:
      'Learn how we collect, use, and protect your personal information. GDPR and CCPA compliant.',
    url: '/privacy',
    siteName: 'BroLab Entertainment',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - BroLab Entertainment',
    description: 'Learn how we collect, use, and protect your personal information.',
  },
  alternates: {
    canonical: '/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const PRIVACY_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy - BroLab Entertainment',
  url: 'https://brolabentertainment.com/privacy',
  description:
    'BroLab Entertainment Privacy Policy. Learn how we collect, use, and protect your personal information.',
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

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRIVACY_PAGE_SCHEMA) }}
      />
      <PrivacyPageClient />
    </>
  )
}

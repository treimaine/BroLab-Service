import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

/**
 * Contact Page - ELECTRI-X Design Language
 * 
 * Simple contact form with role selector (Producer/Engineer/Artist/Brand).
 * Support email + response time. Social links (optional).
 * Uses MarketingPageShell with heroWord="CONTACT".
 * 
 * Requirements: 19 (Marketing Pages)
 */

export const metadata: Metadata = {
  title: 'Contact Us - BroLab Entertainment',
  description: 'Get in touch with BroLab Entertainment. Questions about our platform, pricing, or partnerships? We respond within 24-48 hours. Email: support@brolabentertainment.com',
  keywords: ['contact brolab', 'music platform support', 'beat selling help', 'producer support', 'audio engineer contact'],
  openGraph: {
    title: 'Contact Us - BroLab Entertainment',
    description: 'Get in touch with BroLab Entertainment. Questions, feedback, or partnership inquiries? We respond within 24-48 hours.',
    url: 'https://brolabentertainment.com/contact',
    siteName: 'BroLab Entertainment',
    type: 'website',
    images: [
      {
        url: '/og-contact.png',
        width: 1200,
        height: 630,
        alt: 'Contact BroLab Entertainment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - BroLab Entertainment',
    description: 'Get in touch with BroLab Entertainment. We respond within 24-48 hours.',
    images: ['/og-contact.png'],
  },
  alternates: {
    canonical: 'https://brolabentertainment.com/contact',
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}

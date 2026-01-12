import type { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'

/**
 * About Page - ELECTRI-X Design Language
 * 
 * Mission statement, problem/solution, what BroLab enables,
 * and optional roadmap section.
 * 
 * Requirements: 19 (Marketing Pages)
 */

export const metadata: Metadata = {
  title: 'About Us - BroLab Entertainment',
  description: 'BroLab Entertainment empowers music producers and audio engineers to build their brand and sell directly to artists. Zero platform fees, direct payments, your own storefront.',
  keywords: ['music producer platform', 'beat selling', 'audio engineer services', 'music marketplace', 'producer storefront'],
  openGraph: {
    title: 'About Us - BroLab Entertainment',
    description: 'Empowering music creators to build their brand and sell directly to artists. Zero platform fees on your sales.',
    url: 'https://brolabentertainment.com/about',
    siteName: 'BroLab Entertainment',
    type: 'website',
    images: [
      {
        url: '/og-about.png',
        width: 1200,
        height: 630,
        alt: 'About BroLab Entertainment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - BroLab Entertainment',
    description: 'Empowering music creators to build their brand and sell directly to artists. Zero platform fees.',
    images: ['/og-about.png'],
  },
  alternates: {
    canonical: 'https://brolabentertainment.com/about',
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}

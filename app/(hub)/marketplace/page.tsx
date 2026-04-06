import MarketplaceClient from '@/components/marketplace/MarketplaceClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Beat Marketplace | BroLab Entertainment',
  description: 'Discover premium beats from top producers. Browse, preview, and purchase exclusive beats for your next hit.',
  keywords: ['beat marketplace', 'buy beats online', 'producer beats', 'instrumental beats', 'music marketplace'],
  openGraph: {
    title: 'Beat Marketplace | BroLab Entertainment',
    description: 'Discover premium beats from top producers worldwide.',
    url: '/marketplace',
    siteName: 'BroLab Entertainment',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function MarketplacePage() {
  return <MarketplaceClient />
}

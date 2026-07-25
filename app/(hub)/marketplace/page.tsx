import MarketplaceClient from '@/components/marketplace/MarketplaceClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Beat Marketplace | BroLab Entertainment',
  description: 'Discover published beats from BroLab producers. Preview tracks, compare licenses, and purchase from each producer storefront.',
  keywords: ['beat marketplace', 'buy beats online', 'producer beats', 'instrumental beats', 'music marketplace'],
  openGraph: {
    title: 'Beat Marketplace | BroLab Entertainment',
    description: 'Preview published beats and compare licenses from BroLab producers.',
    url: '/marketplace',
    siteName: 'BroLab Entertainment',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Server Component - metadata is allowed here
export default function MarketplacePage() {
  return <MarketplaceClient />
}

import { MyPurchasesClient } from '@/components/artist/MyPurchasesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Purchases | BroLab Entertainment',
  description: 'View and download your purchased beats and licenses.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MyPurchasesPage() {
  return <MyPurchasesClient />
}

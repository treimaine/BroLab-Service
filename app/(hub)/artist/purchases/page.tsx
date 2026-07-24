import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'My Purchases | BroLab Entertainment',
  description: 'View and download your purchased beats and licenses.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MyPurchasesPage() {
  redirect('/artist')
}

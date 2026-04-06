import { CheckoutCancel } from '@/components/checkout/CheckoutCancel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout Cancelled | BroLab Entertainment',
  description: 'Your checkout was cancelled.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutCancelPage() {
  return <CheckoutCancel />
}

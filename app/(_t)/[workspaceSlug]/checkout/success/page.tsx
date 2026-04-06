import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Purchase Successful | BroLab Entertainment',
  description: 'Your purchase was successful. Download your beat and license.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutSuccessPage() {
  return <CheckoutSuccess />
}

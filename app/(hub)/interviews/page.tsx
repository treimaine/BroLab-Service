import { InterviewsPageClient } from '@/components/interviews/InterviewsPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free concierge onboarding | BroLab',
  description:
    'Launch your first beat or audio service storefront with BroLab in a free 15-minute assisted setup.'
}

export default function InterviewsPage() {
  return <InterviewsPageClient />
}

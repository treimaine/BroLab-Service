/**
 * Operational Health Dashboard
 *
 * Monitors platform health metrics for activation and payment status.
 * Requirements: BRO-50 - Operational dashboard for activation and payment health
 */

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { HealthDashboard } from '@/components/studio/HealthDashboard'

export default async function HealthPage() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const role = (sessionClaims?.unsafeMetadata as { role?: string })?.role

  // Only allow providers (producer/engineer) to access health dashboard
  if (role !== 'producer' && role !== 'engineer') {
    redirect('/artist')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Health</h1>
        <p className="text-muted-foreground">
          Monitor onboarding status, payment health, and recent activity
        </p>
      </div>

      <HealthDashboard />
    </div>
  )
}

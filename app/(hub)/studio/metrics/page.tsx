/**
 * Metrics Dashboard Page
 *
 * Protected route for team dashboard showing:
 * - Conversion metrics (signup → checkout → payment)
 * - Revenue metrics
 * - Timing metrics
 * - Abandonment analytics
 * - Feature adoption
 */

import { MetricsClient } from '@/components/hub/MetricsClient'

export default function MetricsPage() {
  return <MetricsClient />
}

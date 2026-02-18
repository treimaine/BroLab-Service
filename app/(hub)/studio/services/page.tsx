/**
 * Studio Services Page
 *
 * Provider dashboard for managing service listings.
 * Features:
 * - Service creation with form
 * - Active/inactive filtering
 * - Edit and delete controls
 * - Toggle active/inactive per service
 *
 * Requirements: 19.3
 */

import { StudioServicesClient } from './StudioServicesClient'

export const metadata = {
  title: 'Services | Studio | BroLab Entertainment',
  description: 'Manage your service listings',
}

export default function StudioServicesPage() {
  return <StudioServicesClient />
}

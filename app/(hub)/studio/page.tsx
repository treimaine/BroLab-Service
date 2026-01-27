/**
 * Studio Dashboard Page
 * 
 * Requirements: 2.3, 19, Task 5.10
 * 
 * Protected route for providers (producer/engineer)
 * Access controlled by proxy.ts middleware (at project root)
 * 
 * Uses Convex auth components via Client Component wrapper
 */

import { StudioDashboard } from '@/components/hub/StudioDashboard'

export default function StudioPage() {
  return <StudioDashboard />
}

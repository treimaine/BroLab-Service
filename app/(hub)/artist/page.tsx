/**
 * Artist Dashboard Page
 * 
 * Requirements: 2.4, 20, Task 5.10
 * 
 * Protected route for artists
 * Access controlled by proxy.ts middleware
 * 
 * Uses Convex auth components via Client Component wrapper
 */

import { ArtistDashboard } from '@/components/hub/ArtistDashboard'

export default function ArtistPage() {
  return <ArtistDashboard />
}

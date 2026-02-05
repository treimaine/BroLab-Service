/**
 * Studio Tracks Page
 * 
 * Provider dashboard for managing tracks (beats).
 * Features:
 * - Track upload with drag-and-drop
 * - Draft/published filtering
 * - Processing status indicators
 * - Preview generation controls
 * - Track list with management actions
 * 
 * Requirements: 19.2
 */

import { StudioTracksClient } from './StudioTracksClient'

export const metadata = {
  title: 'Tracks | Studio | BroLab Entertainment',
  description: 'Manage your beats and tracks',
}

export default function StudioTracksPage() {
  return <StudioTracksClient />
}

/**
 * Interview Management Dashboard
 *
 * Protected route for team members to manage interview requests and scheduling.
 * Accessible at /studio/interviews
 */

import { InterviewManagementClient } from '@/components/hub/InterviewManagementClient'

export default function InterviewManagementPage() {
  return <InterviewManagementClient />
}

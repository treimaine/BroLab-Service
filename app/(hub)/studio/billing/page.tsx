/**
 * Studio Billing Page
 * 
 * Requirements: 3.6, 19.1, 19.6, Task 7.2
 * 
 * Displays subscription status, Clerk Billing integration, and usage vs quota
 * Protected route for providers (producer/engineer)
 */

import { BillingManagement } from '@/components/hub/BillingManagement'

export default function BillingPage() {
  return <BillingManagement />
}

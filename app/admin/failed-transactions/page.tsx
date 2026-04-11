import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { FailedTransactionsDashboard } from '@/src/components/admin/FailedTransactionsDashboard';

/**
 * Admin Failed Transactions Dashboard Page
 * Requires admin authentication
 */
export default async function FailedTransactionsPage() {
  const session = await auth();

  // TODO: Implement proper admin role check
  // For now, just verify user is authenticated
  if (!session?.userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <FailedTransactionsDashboard />
    </div>
  );
}

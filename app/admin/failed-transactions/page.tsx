import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { FailedTransactionsDashboard } from '../../../src/components/admin/FailedTransactionsDashboard';

/**
 * Admin Failed Transactions Dashboard Page
 * Requires admin authentication
 */
export default async function FailedTransactionsPage() {
  const session = await auth();

  if (!session?.userId) {
    redirect('/sign-in');
  }

  // Verify admin role
  const user = await currentUser();
  if (user?.publicMetadata?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <FailedTransactionsDashboard />
    </div>
  );
}

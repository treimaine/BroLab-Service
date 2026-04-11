'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface FilterOptions {
  status?: string;
  workspaceId?: string;
}

interface FailedTransaction {
  _id: Id<'failedTransactions'>;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  reason: string;
  reasonMessage: string;
  status: 'pending_retry' | 'retry_in_progress' | 'retry_failed' | 'resolved' | 'support_ticket_created';
  retryCount: number;
  buyerEmail?: string;
  buyerClerkUserId?: string;
  createdAt: number;
  updatedAt: number;
  lastRetryAt?: number;
  supportTicketId?: string;
  notes?: string;
}

/**
 * Failed Transactions Monitor Dashboard
 * Real-time admin dashboard for monitoring and managing failed payments
 */
export function FailedTransactionsDashboard({ workspaceId }: { workspaceId?: string }) {
  const [selectedTransaction, setSelectedTransaction] = useState<FailedTransaction | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'pending_retry',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // Subscribe to real-time transaction updates
  const allTransactions = useQuery(api.failedTransactions.subscribeToFailedTransactions, {
    workspaceId: workspaceId as Id<'workspaces'> | undefined,
  }) || [];

  // Fetch stats
  const stats = useQuery(api.failedTransactions.getFailedTransactionStats, {
    workspaceId: workspaceId as Id<'workspaces'> | undefined,
  });

  // Apply local filtering
  const transactions = useMemo(() => {
    if (!allTransactions) return { transactions: [], hasMore: false };

    let filtered = [...allTransactions];

    // Filter by status if specified
    if (filters.status) {
      filtered = filtered.filter((tx) => tx.status === filters.status);
    }

    return {
      transactions: filtered.slice(0, 100),
      hasMore: filtered.length > 100,
    };
  }, [allTransactions, filters.status]);

  // Get filtered transactions from the already-filtered list
  const filteredTransactions = transactions.transactions;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_retry':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'retry_in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'retry_failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'support_ticket_created':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleRetry = async (transaction: FailedTransaction) => {
    setIsRetrying(true);
    try {
      // Call backend retry endpoint
      const response = await fetch('/api/admin/failed-transactions/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction._id,
          paymentIntentId: transaction.stripePaymentIntentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retry payment');
      }

      // Show success message
      alert('Retry initiated. Customer will receive retry link.');
      setShowDetails(false);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to retry'}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCreateTicket = async (transaction: FailedTransaction) => {
    setIsCreatingTicket(true);
    try {
      // Call backend to create support ticket
      const response = await fetch('/api/admin/failed-transactions/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction._id,
          buyerEmail: transaction.buyerEmail,
          amount: transaction.amount,
          currency: transaction.currency,
          reason: transaction.reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create support ticket');
      }

      // Show success message
      alert('Support ticket created and customer notified.');
      setShowDetails(false);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create ticket'}`);
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAmount = (amount: number, currency: string) => {
    const dollars = amount / 100;
    const symbols: Record<string, string> = { usd: '$', eur: '€', gbp: '£' };
    const symbol = symbols[currency.toLowerCase()] || currency.toUpperCase();
    return `${symbol}${dollars.toFixed(2)}`;
  };

  // Show loading state while fetching
  const isLoading = allTransactions === undefined || stats === undefined;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Failed Transactions Monitor</h1>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          {isLoading && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Total Failed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm">
            <p className="text-sm text-yellow-600">Pending Retry</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.pendingRetry}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
            <p className="text-sm text-red-600">Retry Failed</p>
            <p className="text-2xl font-bold text-red-800">{stats.retryFailed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
            <p className="text-sm text-green-600">Resolved</p>
            <p className="text-2xl font-bold text-green-800">{stats.resolved}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value || undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending_retry">Pending Retry</option>
          <option value="retry_in_progress">Retry In Progress</option>
          <option value="retry_failed">Retry Failed</option>
          <option value="resolved">Resolved</option>
          <option value="support_ticket_created">Support Ticket Created</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No failed transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx: FailedTransaction) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {tx.stripePaymentIntentId.slice(0, 12)}...
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatAmount(tx.amount, tx.currency)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs">
                        <p className="font-mono text-xs text-gray-500">{tx.reason}</p>
                        <p className="text-xs text-gray-600">{tx.reasonMessage}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          tx.status
                        )}`}
                      >
                        {getStatusLabel(tx.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{tx.retryCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(tx.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedTransaction(tx);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Intent ID</p>
                    <p className="font-mono text-sm text-gray-900">
                      {selectedTransaction.stripePaymentIntentId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold text-gray-900">
                      {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer Email</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.buyerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        selectedTransaction.status
                      )}`}
                    >
                      {getStatusLabel(selectedTransaction.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Details</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 font-mono font-semibold">
                    {selectedTransaction.reason}
                  </p>
                  <p className="text-sm text-red-700 mt-2">{selectedTransaction.reasonMessage}</p>
                </div>
              </div>

              {/* Retry Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Retry History</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Retry Count</p>
                    <p className="font-semibold text-gray-900">{selectedTransaction.retryCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Retry</p>
                    <p className="text-sm text-gray-900">
                      {selectedTransaction.lastRetryAt
                        ? formatDate(selectedTransaction.lastRetryAt)
                        : 'Not retried yet'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedTransaction.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedTransaction.notes}
                  </p>
                </div>
              )}

              {/* Support Ticket */}
              {selectedTransaction.supportTicketId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Support Ticket Created</p>
                  <p className="text-sm font-mono text-blue-900">{selectedTransaction.supportTicketId}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Created: {formatDate(selectedTransaction.createdAt)}</p>
                <p>Last Updated: {formatDate(selectedTransaction.updatedAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedTransaction.status === 'pending_retry' ||
                selectedTransaction.status === 'retry_failed' ? (
                  <button
                    onClick={() => handleRetry(selectedTransaction)}
                    disabled={isRetrying}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isRetrying ? 'Processing...' : 'Retry Payment'}
                  </button>
                ) : null}

                {selectedTransaction.status !== 'support_ticket_created' &&
                selectedTransaction.status !== 'resolved' ? (
                  <button
                    onClick={() => handleCreateTicket(selectedTransaction)}
                    disabled={isCreatingTicket}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isCreatingTicket ? 'Creating...' : 'Create Support Ticket'}
                  </button>
                ) : null}

                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

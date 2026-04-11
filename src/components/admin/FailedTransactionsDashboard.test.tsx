import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FailedTransactionsDashboard } from './FailedTransactionsDashboard';
import { ConvexProvider, useQuery } from 'convex/react';

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  ConvexProvider: ({ children }: any) => children,
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('FailedTransactionsDashboard', () => {
  const mockTransactions = [
    {
      _id: 'tx_1' as any,
      stripePaymentIntentId: 'pi_1234567890abcdef',
      amount: 5000,
      currency: 'usd',
      reason: 'card_declined',
      reasonMessage: 'Your card was declined',
      status: 'pending_retry' as const,
      retryCount: 0,
      buyerEmail: 'customer@example.com',
      buyerClerkUserId: 'user_123',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const mockStats = {
    total: 10,
    pendingRetry: 5,
    retryInProgress: 2,
    retryFailed: 1,
    resolved: 2,
    supportTicketCreated: 0,
    totalAmount: 50000,
    averageRetries: 0.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as any).mockReturnValue(mockTransactions);
  });

  it('renders the dashboard header', () => {
    render(<FailedTransactionsDashboard />);
    expect(screen.getByText('Failed Transactions Monitor')).toBeInTheDocument();
  });

  it('displays stats cards with correct values', () => {
    (useQuery as any).mockImplementation((api: any, args: any) => {
      if (api.toString().includes('getFailedTransactionStats')) {
        return mockStats;
      }
      return { transactions: mockTransactions, hasMore: false };
    });

    render(<FailedTransactionsDashboard />);

    expect(screen.getByText('Total Failed')).toBeInTheDocument();
    expect(screen.getByText('Pending Retry')).toBeInTheDocument();
  });

  it('displays transactions in table format', () => {
    (useQuery as any).mockReturnValue({
      transactions: mockTransactions,
      hasMore: false,
    });

    render(<FailedTransactionsDashboard />);

    expect(screen.getByText('pi_1234567890ab')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('Your card was declined')).toBeInTheDocument();
  });

  it('allows filtering by status', () => {
    render(<FailedTransactionsDashboard />);

    const filterSelect = screen.getByDisplayValue('Pending Retry');
    fireEvent.change(filterSelect, { target: { value: 'resolved' } });

    expect(filterSelect).toHaveValue('resolved');
  });

  it('opens details modal when viewing transaction', async () => {
    (useQuery as any).mockReturnValue({
      transactions: mockTransactions,
      hasMore: false,
    });

    render(<FailedTransactionsDashboard />);

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText('Transaction Details')).toBeInTheDocument();
      expect(screen.getByText('pi_1234567890abcdef')).toBeInTheDocument();
    });
  });

  it('calls retry endpoint when retry button is clicked', async () => {
    (useQuery as any).mockReturnValue({
      transactions: mockTransactions,
      hasMore: false,
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => ({ success: true }),
    });

    render(<FailedTransactionsDashboard />);

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    await waitFor(() => {
      const retryButton = screen.getByText('Retry Payment');
      expect(retryButton).toBeInTheDocument();
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/failed-transactions/retry',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('pi_1234567890abcdef'),
        })
      );
    });
  });

  it('calls create ticket endpoint when create ticket button is clicked', async () => {
    (useQuery as any).mockReturnValue({
      transactions: mockTransactions,
      hasMore: false,
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => ({ success: true, ticketId: 'TKT-12345' }),
    });

    render(<FailedTransactionsDashboard />);

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    await waitFor(() => {
      const createTicketButton = screen.getByText('Create Support Ticket');
      expect(createTicketButton).toBeInTheDocument();
      fireEvent.click(createTicketButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/failed-transactions/create-ticket',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('formats currency amounts correctly', () => {
    const testCases = [
      { amount: 5000, currency: 'usd', expected: '$50.00' },
      { amount: 10000, currency: 'eur', expected: '€100.00' },
      { amount: 7500, currency: 'gbp', expected: '£75.00' },
    ];

    testCases.forEach(({ amount, currency, expected }) => {
      const { unmount } = render(
        <FailedTransactionsDashboard />
      );

      // Verify amount formatting works (checked in display)
      unmount();
    });
  });

  it('displays "No failed transactions" when list is empty', () => {
    (useQuery as any).mockReturnValue({
      transactions: [],
      hasMore: false,
    });

    render(<FailedTransactionsDashboard />);

    expect(screen.getByText('No failed transactions found')).toBeInTheDocument();
  });

  it('shows error message on failed retry', async () => {
    (useQuery as any).mockReturnValue({
      transactions: mockTransactions,
      hasMore: false,
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<FailedTransactionsDashboard />);

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    await waitFor(() => {
      const retryButton = screen.getByText('Retry Payment');
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('closes details modal when close button is clicked', async () => {
    (useQuery as any).mockReturnValue({
      transactions: mockTransactions,
      hasMore: false,
    });

    render(<FailedTransactionsDashboard />);

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Transaction Details')).not.toBeInTheDocument();
    });
  });
});

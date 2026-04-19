# Failed Transactions Retry Scheduler Documentation

## Overview

The Failed Transactions Retry Scheduler is an automated system that monitors and retries failed payment transactions from Stripe. It's part of the May Phase conversion optimization initiative (BRO-135).

## Architecture

### Components

1. **Webhook Handler** (`convex/http.ts:handleChargeFailed`)
   - Listens for Stripe `charge.failed` events
   - Records failed transactions in the database
   - Sets initial status to `pending_retry`

2. **Retry Scheduler** (`convex/modules/retryScheduler.ts`)
   - Periodically queries transactions with `pending_retry` status
   - Attempts to retry payments via Stripe API
   - Updates transaction statuses based on retry results

3. **HTTP Trigger Endpoint** (`/api/failed-transactions/scheduler/trigger`)
   - Allows external cron services to trigger the scheduler
   - Supports optional authorization token for security

### Transaction Lifecycle

```
charge.failed webhook
         ↓
    create failed transaction
    (status: pending_retry)
         ↓
    retry scheduler runs
         ↓
    attempt Stripe payment retry
    ├─ success → status: resolved
    ├─ retryable error → increment retry count, keep pending_retry
    └─ non-retryable error or max retries reached → status: retry_failed
         ↓
    support team reviews failed transactions
    (status: support_ticket_created)
```

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Stripe configuration (already exists)
STRIPE_SECRET_KEY=sk_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# Scheduler security token (optional but recommended)
SCHEDULER_TRIGGER_TOKEN=your_secret_token_here
```

### Scheduler Constants

The following constants can be adjusted in `convex/modules/retryScheduler.ts`:

```typescript
const RETRY_BATCH_SIZE = 10;       // Transactions processed per scheduler run
const RETRY_DELAY_MS = 1000;       // Delay between retry attempts (ms)
const MAX_RETRIES = 3;             // Maximum retry attempts per transaction
```

## Deployment

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/retry-scheduler.yml`:

```yaml
name: Failed Transaction Retry Scheduler

on:
  schedule:
    # Run every 5 minutes
    - cron: '*/5 * * * *'
  # Allow manual trigger from Actions tab
  workflow_dispatch:

jobs:
  trigger-scheduler:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger failed transaction retry scheduler
        run: |
          curl -X POST https://your-deployment.vercel.app/api/failed-transactions/scheduler/trigger \
            -H "Content-Type: application/json" \
            -H "x-scheduler-token: ${{ secrets.SCHEDULER_TRIGGER_TOKEN }}" \
            -d '{}'
```

### Option 2: AWS Lambda + EventBridge

Create a Lambda function that calls the scheduler endpoint on a schedule:

```typescript
// lambda/retry-scheduler-trigger.ts
import https from 'https';

export const handler = async () => {
  const options = {
    hostname: 'your-deployment.vercel.app',
    path: '/api/failed-transactions/scheduler/trigger',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-scheduler-token': process.env.SCHEDULER_TRIGGER_TOKEN,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.end(JSON.stringify({}));
  });
};
```

Then set up an EventBridge rule to trigger the Lambda function every 5 minutes.

### Option 3: External Cron Service (e.g., Cron-job.org, EasyCron)

Set up a simple HTTP POST request:

```
URL: https://your-deployment.vercel.app/api/failed-transactions/scheduler/trigger
Method: POST
Headers: x-scheduler-token: your_secret_token_here
Body: {}
Schedule: Every 5 minutes
```

## Usage

### Trigger the Scheduler Manually

```bash
curl -X POST https://your-deployment.vercel.app/api/failed-transactions/scheduler/trigger \
  -H "Content-Type: application/json" \
  -H "x-scheduler-token: your_secret_token" \
  -d '{}'
```

### Query Failed Transactions

```bash
# List all pending_retry transactions
curl 'https://your-deployment.vercel.app/api/failed-transactions/list?status=pending_retry'

# Get a specific transaction
curl 'https://your-deployment.vercel.app/api/failed-transactions/[transactionId]'
```

### Manually Retry a Transaction

```bash
curl -X POST 'https://your-deployment.vercel.app/api/failed-transactions/[transactionId]/retry' \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Create a Support Ticket

```bash
curl -X POST 'https://your-deployment.vercel.app/api/failed-transactions/[transactionId]/support-ticket' \
  -H "Content-Type: application/json" \
  -d '{"notes": "Customer reported issue with payment"}'
```

## API Endpoints

### GET /api/failed-transactions/list

Lists failed transactions with filtering and pagination.

**Query Parameters:**
- `workspaceId` (optional): Filter by workspace ID
- `status` (optional): Filter by status (`pending_retry`, `retry_in_progress`, `retry_failed`, `resolved`, `support_ticket_created`)
- `limit` (optional): Maximum results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 45,
  "transactions": [
    {
      "_id": "...",
      "stripePaymentIntentId": "pi_...",
      "amount": 2999,
      "currency": "usd",
      "reason": "card_declined",
      "reasonMessage": "Your card was declined",
      "status": "pending_retry",
      "retryCount": 1,
      "createdAt": 1713607200000,
      "updatedAt": 1713607260000
    }
  ]
}
```

### GET /api/failed-transactions/:transactionId

Retrieves a single transaction's details.

**Response:**
```json
{
  "success": true,
  "transaction": { /* transaction object */ }
}
```

### POST /api/failed-transactions/:transactionId/retry

Manually triggers a retry for a specific transaction.

**Request Body:**
```json
{
  "paymentMethodId": "pm_..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Retry attempt queued",
  "transactionId": "...",
  "result": "..."
}
```

### POST /api/failed-transactions/:transactionId/support-ticket

Creates a support ticket for a failed transaction.

**Request Body:**
```json
{
  "notes": "Additional notes about the issue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Support ticket created",
  "ticketId": "TICKET-1713607200000-abc123",
  "transactionId": "..."
}
```

### POST /api/failed-transactions/scheduler/trigger

Triggers the retry scheduler to process pending transactions.

**Headers:**
- `x-scheduler-token` (required if `SCHEDULER_TRIGGER_TOKEN` is set)

**Response:**
```json
{
  "success": true,
  "message": "Retry scheduler triggered",
  "result": {
    "processed": 10,
    "succeeded": 8,
    "failed": 2,
    "duration": 5234
  }
}
```

## Retry Logic

### Retryable Failure Codes

The scheduler automatically retries payments for these Stripe failure codes:
- `rate_limit`: API rate limit hit
- `api_connection_error`: Temporary network issue
- `api_error`: Temporary API error
- `authentication_error`: Temporary auth issue
- `card_error`: Certain card-related errors

### Non-Retryable Failure Codes

These failures are immediately marked as `retry_failed` and will not be retried:
- Card permanently declined
- Expired card
- Lost or stolen card
- Insufficient funds (customer needs to use different payment method)
- Fraudulent charge blocked
- Card not supported

### Retry Strategy

1. **First Attempt**: Immediately when `charge.failed` webhook is received
2. **Subsequent Attempts**: Every 5 minutes via scheduler (up to 3 total attempts)
3. **Between Retries**: 1 second delay between payment requests to avoid rate limiting
4. **Max Duration**: Up to ~15 minutes total (3 retries with 5-minute intervals)

## Monitoring

### Logs

Monitor the Convex action logs for scheduler runs:

```bash
# View scheduler logs in Convex dashboard
# Dashboard → Functions → retryFailedTransactionsScheduled
```

### Metrics to Track

1. **Successful Retries**: Transactions moved to `resolved` status
2. **Failed Retries**: Transactions moved to `retry_failed` status
3. **Retry Rate**: (Successful retries) / (Total attempts)
4. **Scheduler Latency**: Time between when transaction fails and when retry succeeds
5. **Unresolved Transactions**: Count of transactions still in `pending_retry` after 24 hours

### Dashboard Queries

Query to find transactions that need attention:

```
SELECT * FROM failedTransactions 
WHERE status IN ('pending_retry', 'retry_failed')
AND updatedAt > now() - interval '24 hours'
ORDER BY updatedAt DESC
```

## Limitations & Known Issues

### Current Implementation

1. **Payment Method Storage**: The current implementation does not store payment methods from failed transactions. Retries are attempted on the original payment method, which may not be available after a failure.

2. **Customer Communication**: No automatic customer notifications are sent when a retry succeeds or fails. Support team must manually contact customers.

3. **Payment Method Update**: Customers cannot update their payment method through the API - manual support ticket process is required.

### Future Enhancements

1. **Email Notifications**: Notify customers when payment retry succeeds
2. **Self-Service Retry**: Allow customers to retry with updated payment method through dashboard
3. **Smart Retry Scheduling**: Exponential backoff instead of fixed 5-minute intervals
4. **Webhook Events**: Emit `transaction.retry_succeeded` and `transaction.retry_failed` events
5. **Dunning Management**: Implement full dunning flow for subscription/recurring charges

## Troubleshooting

### Scheduler Not Running

1. Verify the trigger endpoint is configured correctly
2. Check authorization token is correct (if configured)
3. Review Convex logs for errors in `retryFailedTransactionsScheduled` action

### Retries Not Succeeding

1. Check Stripe webhook configuration - ensure `charge.failed` events are being sent
2. Verify payment method still exists in Stripe
3. Check for non-retryable failure codes (see Retry Logic section above)

### High Failure Rate

1. Review most common failure codes in transaction records
2. Contact Stripe support if seeing API errors
3. Increase `RETRY_DELAY_MS` if hitting rate limits

## Security Considerations

1. **Authorization Token**: Always set `SCHEDULER_TRIGGER_TOKEN` in production
2. **API Endpoints**: Consider adding role-based access control (RBAC) for admin endpoints
3. **Webhook Verification**: Stripe webhook signature verification is implemented
4. **Error Logging**: Ensure sensitive payment data is not logged

## References

- [Stripe Payment Intents API](https://stripe.com/docs/api/payment_intents)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Failure Codes](https://stripe.com/docs/error-codes)
- [Convex Documentation](https://docs.convex.dev)

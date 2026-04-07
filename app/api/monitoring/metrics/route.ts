/**
 * Monitoring Metrics API
 * Provides real-time metrics for checkout and webhook health
 *
 * This is a placeholder that returns mock data.
 * In production, integrate with:
 * - Time-series database (InfluxDB, Prometheus)
 * - Analytics service (Datadog, New Relic)
 * - Custom metrics from Convex database events table
 */

import { NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  successRate?: number;
  failureRate?: number;
  lastError?: string;
  processedCount?: number;
  avgResponseTime?: number;
}

interface MetricsResponse {
  checkout: HealthStatus;
  webhook: HealthStatus;
  timestamp: number;
}

/**
 * Get current health metrics
 *
 * TODO: Implement real metrics collection:
 * 1. Query Convex database events table for recent events
 * 2. Calculate success rates, failure rates, and response times
 * 3. Compare against alert thresholds
 * 4. Return aggregated metrics
 */
export async function GET(): Promise<NextResponse> {
  const now = Date.now();

  // Mock metrics - in production, calculate from real data
  const metrics: MetricsResponse = {
    checkout: {
      status: 'healthy',
      successRate: 0.9875, // 98.75%
      avgResponseTime: 1240, // milliseconds
      lastError: undefined,
    },
    webhook: {
      status: 'healthy',
      processedCount: 1247,
      failureRate: 0.0025, // 0.25%
      lastError: undefined,
    },
    timestamp: now,
  };

  // Check alert thresholds
  if (metrics.checkout.successRate && metrics.checkout.successRate < 0.9) {
    metrics.checkout.status = 'unhealthy';
    metrics.checkout.lastError = 'Success rate below 90%';
  } else if (metrics.checkout.successRate && metrics.checkout.successRate < 0.95) {
    metrics.checkout.status = 'degraded';
    metrics.checkout.lastError = 'Success rate below 95%';
  }

  if (metrics.webhook.failureRate && metrics.webhook.failureRate > 0.05) {
    metrics.webhook.status = 'unhealthy';
    metrics.webhook.lastError = 'Failure rate above 5%';
  } else if (metrics.webhook.failureRate && metrics.webhook.failureRate > 0.02) {
    metrics.webhook.status = 'degraded';
    metrics.webhook.lastError = 'Failure rate above 2%';
  }

  return NextResponse.json(metrics);
}

/**
 * POST /api/monitoring/metrics - Record a new metric
 *
 * This endpoint is called by the Stripe webhook and checkout handlers
 * to record structured metrics for monitoring.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const metric = await request.json();

    // TODO: Store metric in time-series database
    // For now, just log it
    console.log('[METRIC-RECORDED]', JSON.stringify({
      timestamp: new Date().toISOString(),
      ...metric,
    }));

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to record metric:', error);
    return NextResponse.json(
      { error: 'Failed to record metric' },
      { status: 400 }
    );
  }
}

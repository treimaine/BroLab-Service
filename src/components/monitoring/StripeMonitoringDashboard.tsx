'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  successRate?: number;
  failureRate?: number;
  lastError?: string;
  processedCount?: number;
  avgResponseTime?: number;
}

interface DashboardMetrics {
  checkout: HealthStatus;
  webhook: HealthStatus;
  timestamp: number;
}

/**
 * Stripe Production Monitoring Dashboard
 * Real-time visibility into checkout and webhook health
 */
export function StripeMonitoringDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/monitoring/metrics');
        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.statusText}`);
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'degraded':
        return '!';
      case 'unhealthy':
        return '✕';
    }
  };

  if (loading && !metrics) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-800">Error loading metrics: {error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No metrics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Stripe Production Monitoring</h2>
        <div className="text-sm text-gray-600">
          Updated: {new Date(metrics.timestamp).toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checkout Health */}
        <div className={`p-6 rounded-lg border-2 ${getStatusColor(metrics.checkout.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Checkout Endpoint</h3>
            <span className="text-3xl font-bold">{getStatusIcon(metrics.checkout.status)}</span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium opacity-75">Status</p>
              <p className="text-lg font-semibold capitalize">{metrics.checkout.status}</p>
            </div>

            {metrics.checkout.successRate !== undefined && (
              <div>
                <p className="text-sm font-medium opacity-75">Success Rate</p>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold">
                    {(metrics.checkout.successRate * 100).toFixed(1)}%
                  </p>
                  <div className="flex-1 bg-gray-300 rounded-full h-2 max-w-xs">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${metrics.checkout.successRate * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {metrics.checkout.avgResponseTime !== undefined && (
              <div>
                <p className="text-sm font-medium opacity-75">Avg Response Time</p>
                <p className="text-lg font-semibold">{metrics.checkout.avgResponseTime}ms</p>
              </div>
            )}

            {metrics.checkout.lastError && (
              <div>
                <p className="text-sm font-medium opacity-75">Last Error</p>
                <p className="text-sm font-mono bg-black bg-opacity-10 p-2 rounded">
                  {metrics.checkout.lastError}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-current border-opacity-20">
            <Link
              href="/admin/monitoring/checkout"
              className="text-sm font-semibold hover:opacity-75 transition-opacity"
            >
              View Details →
            </Link>
          </div>
        </div>

        {/* Webhook Health */}
        <div className={`p-6 rounded-lg border-2 ${getStatusColor(metrics.webhook.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Webhook Processing</h3>
            <span className="text-3xl font-bold">{getStatusIcon(metrics.webhook.status)}</span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium opacity-75">Status</p>
              <p className="text-lg font-semibold capitalize">{metrics.webhook.status}</p>
            </div>

            {metrics.webhook.processedCount !== undefined && (
              <div>
                <p className="text-sm font-medium opacity-75">Events Processed</p>
                <p className="text-lg font-semibold">{metrics.webhook.processedCount}</p>
              </div>
            )}

            {metrics.webhook.failureRate !== undefined && (
              <div>
                <p className="text-sm font-medium opacity-75">Failure Rate</p>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold">
                    {(metrics.webhook.failureRate * 100).toFixed(2)}%
                  </p>
                  <div className="flex-1 bg-gray-300 rounded-full h-2 max-w-xs">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        metrics.webhook.failureRate > 0.05 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(metrics.webhook.failureRate * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {metrics.webhook.lastError && (
              <div>
                <p className="text-sm font-medium opacity-75">Last Error</p>
                <p className="text-sm font-mono bg-black bg-opacity-10 p-2 rounded">
                  {metrics.webhook.lastError}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-current border-opacity-20">
            <Link
              href="/admin/monitoring/webhooks"
              className="text-sm font-semibold hover:opacity-75 transition-opacity"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>

        <div className="space-y-3">
          {metrics.checkout.status === 'unhealthy' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-semibold">🔴 Checkout System Unhealthy</p>
              <p className="text-sm mt-1">
                Success rate is below 90%. Check logs for errors.
              </p>
            </div>
          )}

          {metrics.webhook.status === 'unhealthy' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-semibold">🔴 Webhook Processing Unhealthy</p>
              <p className="text-sm mt-1">
                Failure rate is above 5%. Check Convex logs.
              </p>
            </div>
          )}

          {metrics.checkout.status === 'healthy' && metrics.webhook.status === 'healthy' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
              <p className="font-semibold">✓ All Systems Operational</p>
              <p className="text-sm mt-1">
                Checkout and webhook processing are running normally.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Control */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="text-sm font-medium text-gray-700">
          Refresh Interval (seconds):
        </label>
        <select
          value={refreshInterval / 1000}
          onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value={10}>10s</option>
          <option value={30}>30s</option>
          <option value={60}>60s</option>
          <option value={300}>5m</option>
        </select>
      </div>
    </div>
  );
}

export default StripeMonitoringDashboard;

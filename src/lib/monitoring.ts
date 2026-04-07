/**
 * Production Monitoring & Observability
 * Structured logging, metrics, and alerting for Stripe checkout and webhooks
 */

import { SITE_CONFIG } from './env';

// ============================================================================
// Types
// ============================================================================

export interface MonitoringEvent {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  service: 'checkout' | 'webhook' | 'convex';
  eventType: string;
  userId?: string;
  workspaceId?: string;
  sessionId?: string;
  orderId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  duration?: number;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

export interface CheckoutMetrics {
  totalAttempts: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgResponseTime: number;
  errorCodes: Record<string, number>;
  lastUpdated: number;
}

export interface WebhookMetrics {
  totalEvents: number;
  processedCount: number;
  failedCount: number;
  duplicateCount: number;
  avgProcessingTime: number;
  eventTypeBreakdown: Record<string, number>;
  errorCodes: Record<string, number>;
  lastUpdated: number;
}

// ============================================================================
// Structured Logging
// ============================================================================

/**
 * Log structured monitoring event
 */
export function logMonitoringEvent(event: MonitoringEvent): void {
  const logEntry = {
    ...event,
    timestamp: new Date(event.timestamp).toISOString(),
    env: process.env.NODE_ENV,
    url: SITE_CONFIG.url,
  };

  if (event.level === 'error') {
    console.error('[MONITORING-ERROR]', JSON.stringify(logEntry));
  } else if (event.level === 'warn') {
    console.warn('[MONITORING-WARN]', JSON.stringify(logEntry));
  } else {
    console.log('[MONITORING-INFO]', JSON.stringify(logEntry));
  }

  // In production, send to monitoring service (DataDog, New Relic, etc)
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoringService(logEntry);
  }
}

/**
 * Log checkout session creation attempt
 */
export function logCheckoutAttempt(params: {
  userId: string;
  workspaceId: string;
  itemType: 'track' | 'service';
  itemId: string;
  licenseTier?: string;
  startTime: number;
}): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'info',
    service: 'checkout',
    eventType: 'checkout_attempt_started',
    userId: params.userId,
    workspaceId: params.workspaceId,
    message: `Checkout attempt started for ${params.itemType}`,
    metadata: {
      itemType: params.itemType,
      itemId: params.itemId,
      licenseTier: params.licenseTier,
      startTime: params.startTime,
    },
  });
}

/**
 * Log checkout session creation success
 */
export function logCheckoutSuccess(params: {
  userId: string;
  workspaceId: string;
  sessionId: string;
  itemType: 'track' | 'service';
  itemId: string;
  priceInCents: number;
  currency: string;
  duration: number;
}): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'info',
    service: 'checkout',
    eventType: 'checkout_success',
    userId: params.userId,
    workspaceId: params.workspaceId,
    sessionId: params.sessionId,
    message: 'Checkout session created successfully',
    duration: params.duration,
    metadata: {
      itemType: params.itemType,
      itemId: params.itemId,
      priceInCents: params.priceInCents,
      currency: params.currency,
    },
  });
}

/**
 * Log checkout failure
 */
export function logCheckoutFailure(params: {
  userId?: string;
  workspaceId?: string;
  itemType?: 'track' | 'service';
  itemId?: string;
  errorCode: string;
  errorMessage: string;
  duration?: number;
  stack?: string;
}): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'error',
    service: 'checkout',
    eventType: 'checkout_failure',
    userId: params.userId,
    workspaceId: params.workspaceId,
    message: 'Checkout session creation failed',
    duration: params.duration,
    error: {
      code: params.errorCode,
      message: params.errorMessage,
      stack: params.stack,
    },
    metadata: {
      itemType: params.itemType,
      itemId: params.itemId,
    },
  });
}

/**
 * Log webhook event received
 */
export function logWebhookReceived(params: {
  eventId: string;
  eventType: string;
  signature: boolean;
}): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'info',
    service: 'webhook',
    eventType: 'webhook_received',
    message: `Webhook event received: ${params.eventType}`,
    metadata: {
      eventId: params.eventId,
      eventType: params.eventType,
      signatureValid: params.signature,
    },
  });
}

/**
 * Log webhook processing success
 */
export function logWebhookSuccess(params: {
  eventId: string;
  eventType: string;
  orderId?: string;
  workspaceId?: string;
  duration: number;
}): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'info',
    service: 'webhook',
    eventType: 'webhook_success',
    message: `Webhook processed: ${params.eventType}`,
    duration: params.duration,
    orderId: params.orderId,
    workspaceId: params.workspaceId,
    metadata: {
      eventId: params.eventId,
      eventType: params.eventType,
    },
  });
}

/**
 * Log webhook processing failure
 */
export function logWebhookFailure(params: {
  eventId: string;
  eventType: string;
  errorCode: string;
  errorMessage: string;
  duration?: number;
  stack?: string;
}): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'error',
    service: 'webhook',
    eventType: 'webhook_failure',
    message: `Webhook processing failed: ${params.eventType}`,
    duration: params.duration,
    error: {
      code: params.errorCode,
      message: params.errorMessage,
      stack: params.stack,
    },
    metadata: {
      eventId: params.eventId,
      eventType: params.eventType,
    },
  });
}

/**
 * Log webhook duplicate detected
 */
export function logWebhookDuplicate(eventId: string, eventType: string): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'warn',
    service: 'webhook',
    eventType: 'webhook_duplicate',
    message: `Duplicate webhook event detected: ${eventType}`,
    metadata: {
      eventId,
      eventType,
    },
  });
}

/**
 * Log signature verification failure
 */
export function logSignatureVerificationFailure(reason: string): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'error',
    service: 'webhook',
    eventType: 'signature_verification_failed',
    message: 'Stripe webhook signature verification failed',
    error: {
      code: 'SIGNATURE_VERIFICATION_FAILED',
      message: reason,
    },
  });
}

/**
 * Log order creation success
 */
export function logOrderCreation(params: {
  orderId: string;
  workspaceId: string;
  buyerClerkUserId: string;
  itemType: 'track' | 'service';
  amountCents: number;
  currency: string;
}): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'info',
    service: 'convex',
    eventType: 'order_created',
    orderId: params.orderId,
    workspaceId: params.workspaceId,
    userId: params.buyerClerkUserId,
    message: 'Order created successfully',
    metadata: {
      itemType: params.itemType,
      amountCents: params.amountCents,
      currency: params.currency,
    },
  });
}

/**
 * Log delivery completion
 */
export function logDeliveryCompletion(params: {
  orderId: string;
  workspaceId: string;
  itemType: 'track' | 'service';
  deliveryType: 'download' | 'booking' | 'entitlement';
}): void {
  logMonitoringEvent({
    timestamp: Date.now(),
    level: 'info',
    service: 'convex',
    eventType: 'delivery_completed',
    orderId: params.orderId,
    workspaceId: params.workspaceId,
    message: 'Order delivery completed',
    metadata: {
      itemType: params.itemType,
      deliveryType: params.deliveryType,
    },
  });
}

// ============================================================================
// Monitoring Service Integration
// ============================================================================

/**
 * Send monitoring event to external service
 * Integrates with DataDog, New Relic, or custom endpoint
 */
async function sendToMonitoringService(logEntry: unknown): Promise<void> {
  const endpoint = process.env.MONITORING_ENDPOINT;
  const apiKey = process.env.MONITORING_API_KEY;

  if (!endpoint || !apiKey) {
    return; // Silently fail if not configured
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(logEntry),
    }).catch(() => {
      // Silently fail if monitoring service is unavailable
      // Don't let monitoring failures break the application
    });
  } catch {
    // Ignore monitoring service errors
  }
}

// ============================================================================
// Health Check Helpers
// ============================================================================

/**
 * Generate current health metrics (in-memory from logs)
 * For production, integrate with time-series database
 */
export function getCheckoutHealthStatus(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  successRate: number;
  lastError?: string;
} {
  // This is a simplified in-memory implementation
  // In production, query metrics from database/monitoring service
  return {
    status: 'healthy',
    successRate: 0.95, // Placeholder - fetch from monitoring
    lastError: undefined,
  };
}

export function getWebhookHealthStatus(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  processedCount: number;
  failureRate: number;
  lastError?: string;
} {
  // This is a simplified in-memory implementation
  // In production, query metrics from database/monitoring service
  return {
    status: 'healthy',
    processedCount: 0, // Placeholder - fetch from monitoring
    failureRate: 0.02,
    lastError: undefined,
  };
}

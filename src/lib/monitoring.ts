import type {
    CheckoutAttemptParams,
    CheckoutFailureParams,
    CheckoutSuccessParams,
    DeliveryCompletionParams,
    MonitoringEvent,
    OrderCreationParams,
    WebhookFailureParams,
    WebhookReceivedParams,
    WebhookSuccessParams
} from '@/shared/types/monitoring';
import { SITE_CONFIG } from './env';
import { captureServerEvent } from './posthog-server';
import { after } from 'next/server';

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

  const distinctId = event.userId ?? event.workspaceId ?? `system:${event.service}`;
  after(async () => {
    try {
      await captureServerEvent(event.eventType, distinctId, {
        ...logEntry,
        error: event.error
          ? { code: event.error.code, message: event.error.message }
          : undefined,
      });
    } catch (error) {
      console.error('[POSTHOG-DELIVERY-ERROR]', error);
    }
  });
}

export function logCheckoutAttempt(params: CheckoutAttemptParams): void {
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

export function logCheckoutSuccess(params: CheckoutSuccessParams): void {
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

export function logCheckoutFailure(params: CheckoutFailureParams): void {
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

export function logWebhookReceived(params: WebhookReceivedParams): void {
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

export function logWebhookSuccess(params: WebhookSuccessParams): void {
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

export function logWebhookFailure(params: WebhookFailureParams): void {
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

export function logOrderCreation(params: OrderCreationParams): void {
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

export function logDeliveryCompletion(params: DeliveryCompletionParams): void {
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

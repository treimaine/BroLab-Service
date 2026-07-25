/**
 * Convex Monitoring & Observability
 * Structured logging for Convex actions and mutations
 */


// Note: Import types from shared when available in Convex context
// For now, we define minimal types needed for Convex functions

// ============================================================================
// Structured Logging
// ============================================================================

/**
 * Log webhook success
 */
export function logWebhookSuccess(params: {
  eventId: string;
  eventType: string;
  orderId?: string;
  workspaceId?: string;
  duration: number;
}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'webhook',
    eventType: 'webhook_success',
    eventId: params.eventId,
    webhookType: params.eventType,
    orderId: params.orderId,
    workspaceId: params.workspaceId,
    duration: params.duration,
  };

  console.log('[WEBHOOK-SUCCESS]', JSON.stringify(logEntry));
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
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    service: 'webhook',
    eventType: 'webhook_failure',
    eventId: params.eventId,
    webhookType: params.eventType,
    errorCode: params.errorCode,
    errorMessage: params.errorMessage,
    duration: params.duration,
    stack: params.stack,
  };

  console.error('[WEBHOOK-FAILURE]', JSON.stringify(logEntry));
}

/**
 * Log webhook duplicate detected
 */
export function logWebhookDuplicate(eventId: string, eventType: string): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    service: 'webhook',
    eventType: 'webhook_duplicate',
    eventId,
    webhookType: eventType,
  };

  console.warn('[WEBHOOK-DUPLICATE]', JSON.stringify(logEntry));
}

/**
 * Log signature verification failure
 */
export function logSignatureVerificationFailure(reason: string): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    service: 'webhook',
    eventType: 'signature_verification_failed',
    reason,
  };

  console.error('[SIGNATURE-VERIFICATION-FAILED]', JSON.stringify(logEntry));
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
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'convex',
    eventType: 'order_created',
    orderId: params.orderId,
    workspaceId: params.workspaceId,
    userId: params.buyerClerkUserId,
    itemType: params.itemType,
    amountCents: params.amountCents,
    currency: params.currency,
  };

  console.log('[ORDER-CREATED]', JSON.stringify(logEntry));
}

/**
 * Log entitlement creation
 */
export function logEntitlementCreation(params: {
  workspaceId: string;
  buyerClerkUserId: string;
  trackId: string;
  licenseTier: string;
}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'convex',
    eventType: 'entitlement_created',
    workspaceId: params.workspaceId,
    userId: params.buyerClerkUserId,
    trackId: params.trackId,
    licenseTier: params.licenseTier,
  };

  console.log('[ENTITLEMENT-CREATED]', JSON.stringify(logEntry));
}

/**
 * Log booking creation
 */
export function logBookingCreation(params: {
  workspaceId: string;
  buyerClerkUserId: string;
  serviceId: string;
}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'convex',
    eventType: 'booking_created',
    workspaceId: params.workspaceId,
    userId: params.buyerClerkUserId,
    serviceId: params.serviceId,
  };

  console.log('[BOOKING-CREATED]', JSON.stringify(logEntry));
}

/**
 * Log email notification sent
 */
export function logEmailNotification(params: {
  type:
    | 'purchase_confirmation'
    | 'booking_confirmation'
    | 'subscription_status'
    | 'seller_sale_alert'
    | 'welcome'
    | 'trial_reminder'
    | 'abandonment_recovery'
    | 'weekly_digest';
  recipientEmail: string;
  success: boolean;
  error?: string;
}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: params.success ? 'info' : 'error',
    service: 'email',
    eventType: 'email_notification',
    notificationType: params.type,
    recipientEmail: params.recipientEmail,
    success: params.success,
    error: params.error,
  };

  if (params.success) {
    console.log('[EMAIL-SENT]', JSON.stringify(logEntry));
  } else {
    console.error('[EMAIL-FAILED]', JSON.stringify(logEntry));
  }
}

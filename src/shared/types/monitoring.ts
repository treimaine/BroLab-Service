/**
 * Shared Monitoring Types
 * Used by both Next.js API routes and Convex functions
 */

// ============================================================================
// Core Types
// ============================================================================

export type LogLevel = 'info' | 'warn' | 'error';

export type ServiceType = 'checkout' | 'webhook' | 'convex' | 'email';

export type ItemType = 'track' | 'service';

export type LicenseTier = 'basic' | 'premium' | 'unlimited';

export type DeliveryType = 'download' | 'booking' | 'entitlement';

export type EmailNotificationType = 
  | 'purchase_confirmation' 
  | 'booking_confirmation' 
  | 'subscription_status';

// ============================================================================
// Event Interfaces
// ============================================================================

export interface MonitoringEvent {
  timestamp: number;
  level: LogLevel;
  service: ServiceType;
  eventType: string;
  userId?: string;
  workspaceId?: string;
  sessionId?: string;
  orderId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  duration?: number;
  error?: ErrorDetails;
}

export interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
}

// ============================================================================
// Metrics Interfaces
// ============================================================================

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

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  successRate?: number;
  processedCount?: number;
  failureRate?: number;
  lastError?: string;
}

// ============================================================================
// Log Parameter Interfaces
// ============================================================================

export interface CheckoutAttemptParams {
  userId: string;
  workspaceId: string;
  itemType: ItemType;
  itemId: string;
  licenseTier?: LicenseTier;
  startTime: number;
}

export interface CheckoutSuccessParams {
  userId: string;
  workspaceId: string;
  sessionId: string;
  itemType: ItemType;
  itemId: string;
  priceInCents: number;
  currency: string;
  duration: number;
}

export interface CheckoutFailureParams {
  userId?: string;
  workspaceId?: string;
  itemType?: ItemType;
  itemId?: string;
  errorCode: string;
  errorMessage: string;
  duration?: number;
  stack?: string;
}

export interface WebhookReceivedParams {
  eventId: string;
  eventType: string;
  signature: boolean;
}

export interface WebhookSuccessParams {
  eventId: string;
  eventType: string;
  orderId?: string;
  workspaceId?: string;
  duration: number;
}

export interface WebhookFailureParams {
  eventId: string;
  eventType: string;
  errorCode: string;
  errorMessage: string;
  duration?: number;
  stack?: string;
}

export interface OrderCreationParams {
  orderId: string;
  workspaceId: string;
  buyerClerkUserId: string;
  itemType: ItemType;
  amountCents: number;
  currency: string;
}

export interface DeliveryCompletionParams {
  orderId: string;
  workspaceId: string;
  itemType: ItemType;
  deliveryType: DeliveryType;
}

export interface EntitlementCreationParams {
  workspaceId: string;
  buyerClerkUserId: string;
  trackId: string;
  licenseTier: string;
}

export interface BookingCreationParams {
  workspaceId: string;
  buyerClerkUserId: string;
  serviceId: string;
}

export interface EmailNotificationParams {
  type: EmailNotificationType;
  recipientEmail: string;
  success: boolean;
  error?: string;
}

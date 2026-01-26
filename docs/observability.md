# Observability System

This document describes the observability system for BroLab Entertainment, which provides audit logging and event tracking capabilities.

## Overview

The observability system consists of two main components:

1. **Audit Logs** (`auditLogs.ts`) - Track provider admin actions
2. **Events** (`events.ts`) - Record lifecycle events

## Requirements

- **Requirement 9.1**: Log provider admin actions (publish, upload, domain connect, service create, preview retry)
- **Requirement 9.2**: Store audit log data (workspaceId, actorClerkUserId, action, entityType, entityId, meta, createdAt)
- **Requirement 9.3**: Record lifecycle events (checkout success, preview generated, domain verified, payments connected)
- **Requirement 9.4**: Store event data (workspaceId, type, meta, createdAt)

## Audit Logs

### Purpose

Audit logs track **provider admin actions** for security, compliance, and debugging purposes. They answer the question: "Who did what, when, and to which entity?"

### Logged Actions

- `track_upload` - Provider uploads a new track
- `track_publish` - Provider publishes a track
- `track_unpublish` - Provider unpublishes a track
- `track_delete` - Provider deletes a track
- `preview_generate` - Provider generates a preview
- `preview_retry` - Provider retries failed preview generation
- `service_create` - Provider creates a service
- `service_update` - Provider updates a service
- `service_delete` - Provider deletes a service
- `domain_connect` - Provider connects a custom domain
- `domain_verify` - Provider verifies a domain
- `domain_disconnect` - Provider disconnects a domain

### Usage

#### From a mutation (using helper):

```typescript
import { logAuditHelper } from "./platform/auditLogs";

export const publishTrack = mutation({
  handler: async (ctx, args) => {
    // Business logic
    await ctx.db.patch(trackId, { status: "published" });
    
    // Log audit
    await logAuditHelper(ctx, {
      workspaceId,
      actorClerkUserId,
      action: "track_publish",
      entityType: "track",
      entityId: trackId,
      meta: { title: "My Beat" }
    });
  }
});
```

#### From client (using mutation):

```typescript
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

const logAudit = useMutation(api.platform.auditLogs.logAudit);

await logAudit({
  workspaceId,
  actorClerkUserId,
  action: "track_publish",
  entityType: "track",
  entityId: trackId,
  meta: { title: "My Beat" }
});
```

### Queries

- `getAuditLogs(workspaceId, limit?)` - Get all audit logs for a workspace
- `getAuditLogsByEntity(workspaceId, entityType, entityId, limit?)` - Get logs for a specific entity
- `getAuditLogsByAction(workspaceId, action, limit?)` - Get logs by action type

## Events

### Purpose

Events track **lifecycle events** that occur in the system. They answer the question: "What happened in the system and when?"

Unlike audit logs (which track user actions), events track system-level occurrences that may or may not be triggered by user actions.

### Event Types

**Checkout Events:**
- `checkout_success` - Artist successfully purchased an item
- `checkout_failed` - Checkout failed

**Preview Events:**
- `preview_generated` - Preview successfully generated
- `preview_failed` - Preview generation failed

**Domain Events:**
- `domain_verified` - Custom domain verified
- `domain_verification_failed` - Domain verification failed

**Payment Events:**
- `payments_connected` - Stripe Connect account connected
- `payments_disconnected` - Stripe Connect account disconnected

**Workspace Events:**
- `workspace_created` - New workspace created

**Subscription Events:**
- `subscription_activated` - Provider subscription activated
- `subscription_canceled` - Provider subscription canceled

**License Events:**
- `license_pdf_generated` - License PDF successfully generated
- `license_pdf_failed` - License PDF generation failed

### Usage

#### From a mutation (using helper):

```typescript
import { recordEventHelper } from "./platform/events";

export const completeCheckout = mutation({
  handler: async (ctx, args) => {
    // Business logic
    await ctx.db.patch(orderId, { status: "completed" });
    
    // Record event
    await recordEventHelper(ctx, {
      workspaceId,
      type: "checkout_success",
      meta: {
        orderId,
        amountCents: 2999,
        itemType: "track"
      }
    });
  }
});
```

#### From client (using mutation):

```typescript
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

const recordEvent = useMutation(api.platform.events.recordEvent);

await recordEvent({
  workspaceId,
  type: "checkout_success",
  meta: { orderId, amountCents: 2999 }
});
```

### Queries

- `getEvents(workspaceId, limit?)` - Get all events for a workspace
- `getEventsByType(workspaceId, type, limit?)` - Get events by type
- `getRecentEvents(limit?)` - Get recent events across all workspaces (admin only)
- `countEventsByType(workspaceId, type)` - Count events by type

## When to Use Audit Logs vs Events

### Use Audit Logs when:
- ✅ A **provider** performs an **admin action**
- ✅ You need to track **who** did something
- ✅ The action is **intentional** and **user-initiated**
- ✅ You need an audit trail for compliance or debugging

**Examples:**
- Provider publishes a track
- Provider creates a service
- Provider connects a domain

### Use Events when:
- ✅ A **system-level occurrence** happens
- ✅ The event may be **triggered by the system** (not just users)
- ✅ You need to track **what happened** (not necessarily who did it)
- ✅ You need analytics or monitoring data

**Examples:**
- Checkout succeeds (triggered by Stripe webhook)
- Preview generation completes (triggered by worker)
- Domain verification succeeds (triggered by DNS check)

### Use Both when:
- ✅ An admin action triggers a system event

**Example:**
```typescript
// Provider clicks "Generate Preview" button
await logAuditHelper(ctx, {
  action: "preview_generate",
  // ... (tracks WHO initiated it)
});

// Later, when preview completes
await recordEventHelper(ctx, {
  type: "preview_generated",
  // ... (tracks WHAT happened)
});
```

## Best Practices

1. **Always log audit trails for provider actions** - This is required for compliance and debugging
2. **Record events for important system occurrences** - This helps with monitoring and analytics
3. **Include relevant metadata** - The `meta` field should contain useful context
4. **Use helpers in mutations** - Prefer `logAuditHelper` and `recordEventHelper` over direct mutations
5. **Keep meta objects simple** - Avoid storing large objects or sensitive data
6. **Use consistent action/event names** - Follow the naming conventions defined in the types

## Example Scenarios

### Scenario 1: Track Upload and Publish

```typescript
// 1. Provider uploads track
await logAuditHelper(ctx, {
  action: "track_upload",
  entityType: "track",
  entityId: trackId,
  meta: { title, fileSize }
});

// 2. Provider publishes track
await logAuditHelper(ctx, {
  action: "track_publish",
  entityType: "track",
  entityId: trackId,
  meta: { title }
});
```

### Scenario 2: Preview Generation

```typescript
// 1. Provider initiates preview generation
await logAuditHelper(ctx, {
  action: "preview_generate",
  entityType: "job",
  entityId: jobId,
  meta: { trackId }
});

// 2. Worker completes preview generation
await recordEventHelper(ctx, {
  type: "preview_generated",
  meta: { trackId, jobId, duration: 30 }
});
```

### Scenario 3: Checkout Flow

```typescript
// 1. Artist completes checkout (Stripe webhook)
await recordEventHelper(ctx, {
  type: "checkout_success",
  meta: {
    orderId,
    buyerClerkUserId,
    itemType: "track",
    amountCents: 2999
  }
});

// No audit log needed - this is not a provider action
```

## Monitoring and Analytics

### Provider Dashboard

Providers can view their audit logs to see:
- Recent actions performed
- History of a specific track or service
- Who made changes (if multiple team members)

### Platform Admin Dashboard

Platform admins can view:
- Recent events across all workspaces
- Event counts by type (for monitoring)
- System health indicators

### Example Queries

```typescript
// Get recent track publishes
const logs = await getAuditLogsByAction({
  workspaceId,
  action: "track_publish",
  limit: 10
});

// Get all checkout successes
const events = await getEventsByType({
  workspaceId,
  type: "checkout_success",
  limit: 50
});

// Count failed previews
const failedCount = await countEventsByType({
  workspaceId,
  type: "preview_failed"
});
```

## Future Enhancements

- Add time-range filtering for queries
- Add aggregation queries (e.g., events per day)
- Add export functionality for compliance
- Add real-time notifications for critical events
- Add retention policies for old logs/events

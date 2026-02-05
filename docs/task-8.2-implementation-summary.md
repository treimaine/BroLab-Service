# Task 8.2 Implementation Summary: Preview Generation Job Handler

## Overview

Implemented preview generation job handler mutations in `convex/modules/beats.ts` to support provider-controlled preview generation with manual retry capabilities.

## Implementation Details

### 1. Generate Preview Mutation (`generatePreview`)

**Purpose**: Allows providers to manually generate previews for tracks uploaded without preview generation enabled.

**Features**:
- Validates track ownership and active subscription
- Checks if preview already exists (prevents duplicate generation)
- Checks if preview generation is already in progress
- Enqueues a `preview_generation` job with trackId and fullStorageId
- Updates track `processingStatus` to "processing"
- Updates `previewPolicy` from "manual" to "none"
- Creates audit log for tracking

**Requirements Satisfied**: 10.2, 10.3, 10.4, 11.1

### 2. Retry Preview Generation Mutation (`retryPreviewGeneration`)

**Purpose**: Allows providers to retry failed preview generation.

**Features**:
- Validates track ownership and active subscription
- Checks if track is in "failed" state
- Enqueues a new `preview_generation` job
- Clears previous error message
- Updates `processingStatus` to "processing"
- Creates audit log with previous error for debugging

**Requirements Satisfied**: 10.6, 10.7, 11.5, 11.6

### 3. Complete Preview Generation Mutation (`completePreviewGeneration`)

**Purpose**: Called by the external worker to mark preview generation as complete.

**Features**:
- Updates track with `previewStorageId`
- Sets `processingStatus` to "completed"
- Clears any error messages
- Records "preview_generated" event for observability

**Requirements Satisfied**: 11.3, 11.4

### 4. Fail Preview Generation Mutation (`failPreviewGeneration`)

**Purpose**: Called by the external worker when preview generation fails.

**Features**:
- Updates `processingStatus` to "failed"
- Records error message in `processingError` field
- Allows provider to retry via `retryPreviewGeneration`

**Requirements Satisfied**: 11.7

### 5. Query Functions

Added two query functions for UI support:

- `getTracksByWorkspace`: Returns all tracks for a workspace with optional status filter
- `getTrack`: Returns a single track by ID

## Provider-Controlled Preview Generation

The implementation supports the "Generate preview now" option as specified:

1. **Default ON**: When uploading a track with `generatePreview: true`, a job is automatically enqueued (implemented in Task 8.1)
2. **Manual OFF**: When uploading with `generatePreview: false`, `previewPolicy` is set to "manual" and no job is enqueued
3. **Manual Generation**: Providers can call `generatePreview` mutation to generate preview for tracks with `previewPolicy: "manual"`
4. **Retry Failed**: Providers can call `retryPreviewGeneration` for tracks with `processingStatus: "failed"`

## Job Payload Structure

```typescript
{
  trackId: Id<"tracks">,
  fullStorageId: Id<"_storage">
}
```

This payload provides the worker with:
- Track ID to update after processing
- Storage ID to download the full audio file

## Processing Status Flow

```
idle → processing → completed
  ↓         ↓
  └─────→ failed → (retry) → processing
```

## Audit Logs

The following actions are logged:
- `preview_generate`: When provider manually generates preview
- `preview_retry`: When provider retries failed generation (includes previous error)

## Events

The following events are recorded:
- `preview_generated`: When preview generation completes successfully

## Next Steps

Task 8.3 will implement the external worker that:
1. Polls for pending `preview_generation` jobs
2. Downloads the full audio file
3. Uses ffmpeg to extract 30-second preview
4. Uploads preview to Convex Storage
5. Calls `completePreviewGeneration` or `failPreviewGeneration`

## Testing Recommendations

1. Test manual preview generation for tracks uploaded without preview
2. Test retry functionality for failed jobs
3. Test that preview generation is blocked when already in progress
4. Test that preview generation is blocked when preview already exists
5. Verify audit logs are created correctly
6. Verify events are recorded on successful completion

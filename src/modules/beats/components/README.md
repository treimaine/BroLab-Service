# Beats Module UI Components

This directory contains UI components for track upload and preview generation management.

## Components

### ProcessingStatusBadge

Displays the processing status of a track's preview generation with visual indicators.

**Props:**
- `status`: 'idle' | 'processing' | 'completed' | 'failed'
- `error?`: Error message (shown on hover for failed status)
- `className?`: Additional CSS classes

**States:**
- **idle**: Gray badge with clock icon - "No Preview"
- **processing**: Blue badge with spinning loader - "Generating Preview..."
- **completed**: Green badge with checkmark - "Preview Ready"
- **failed**: Red badge with X icon - "Preview Failed"

**Usage:**
```tsx
<ProcessingStatusBadge 
  status={track.processingStatus}
  error={track.processingError}
/>
```

### TrackUploadForm

Form for uploading tracks with preview generation option.

**Props:**
- `workspaceId`: ID of the workspace
- `onSuccess?`: Callback when upload succeeds (receives trackId)
- `onError?`: Callback when upload fails (receives error message)

**Features:**
- File upload with validation (WAV, MP3, max 1GB)
- "Generate Preview" checkbox (default ON)
- Track metadata fields (title, BPM, key, tags)
- License tier pricing (Basic, Premium, Unlimited)
- Auto-fills title from filename
- Shows file size after selection

**Usage:**
```tsx
<TrackUploadForm
  workspaceId={workspaceId}
  onSuccess={(trackId) => console.log('Uploaded:', trackId)}
  onError={(error) => console.error('Error:', error)}
/>
```

### TrackListItem

Displays a single track with preview generation controls.

**Props:**
- `track`: Track object with all metadata
- `onError?`: Callback for error messages
- `onSuccess?`: Callback for success messages

**Features:**
- Shows track info (title, BPM, key, tags, status)
- Processing status badge
- Play button (when preview is ready)
- Retry button (when preview generation failed)
- Generate Preview button (when no preview exists)

**Usage:**
```tsx
<TrackListItem
  track={track}
  onError={(msg) => showError(msg)}
  onSuccess={(msg) => showSuccess(msg)}
/>
```

### TrackList

Container component that displays a list of tracks.

**Props:**
- `workspaceId`: ID of the workspace
- `status?`: Filter by 'draft' or 'published'

**Features:**
- Loads tracks from Convex
- Shows loading state
- Empty state with helpful message
- Success/error message display (auto-dismiss after 5s)
- Track count footer

**Usage:**
```tsx
<TrackList workspaceId={workspaceId} status="draft" />
```

## Integration Example

```tsx
'use client'

import { useState } from 'react'
import { TrackUploadForm, TrackList } from '@/modules/beats/components'
import { Id } from '../../../../convex/_generated/dataModel'

export function TracksPage({ workspaceId }: { workspaceId: Id<'workspaces'> }) {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tracks</h1>
        <button onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel' : 'Upload Track'}
        </button>
      </div>

      {showUpload && (
        <TrackUploadForm
          workspaceId={workspaceId}
          onSuccess={() => {
            setShowUpload(false)
            // Track list will auto-refresh via Convex real-time
          }}
          onError={(error) => alert(error)}
        />
      )}

      <TrackList workspaceId={workspaceId} />
    </div>
  )
}
```

## Requirements Implemented

- **10.6**: Processing status indicator (idle, processing, completed, failed)
- **10.7**: Retry button for failed preview generation jobs
- **11.5**: "Generate Preview" checkbox on upload (default ON)
- **11.6**: "Generate preview" action for tracks without preview

## Convex Mutations Used

- `api.modules.beats.generateUploadUrl` - Generate upload URL
- `api.modules.beats.createTrack` - Create track record
- `api.modules.beats.generatePreview` - Generate preview for existing track
- `api.modules.beats.retryPreviewGeneration` - Retry failed preview generation
- `api.modules.beats.getTracksByWorkspace` - Query tracks

## Styling

All components use Tailwind CSS with dark mode support. They follow the project's design system with:
- Glass morphism effects
- Consistent spacing and typography
- Responsive design
- Accessible color contrast
- Loading states with spinners
- Hover and focus states

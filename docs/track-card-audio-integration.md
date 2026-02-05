# Beat Cards Audio Player Integration

## Overview

Beat cards use `DribbbleCard` primitives directly (NOT a separate TrackCard component) to maintain design system consistency. Audio playback is integrated via `useAudioStore` hooks directly in the page JSX.

**IMPORTANT:** The PlayerBar must be mounted in `app/layout.tsx` to be visible globally across all pages.

## Architecture Decision

❌ **DO NOT create** a separate `TrackCard` component in `src/modules/beats/components/`  
✅ **DO use** `DribbbleCard` from `@/platform/ui` directly in pages  
✅ **DO integrate** audio logic inline using `useAudioStore` hooks

**Reason:** Prevents design system drift. All card styling must come from Dribbble primitives to maintain visual consistency.

## Implementation Details

### Root Layout Configuration

**File:** `app/layout.tsx`

The PlayerBar is mounted at the app root level to ensure it's visible on all pages:

```tsx
import { EnhancedGlobalAudioPlayer } from "@/components/audio/EnhancedGlobalAudioPlayer";
import { PlayerBar } from "@/components/audio/PlayerBar";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConvexClientProvider>
          <ThemeProvider>
            {/* Headless audio engine */}
            <EnhancedGlobalAudioPlayer />
            {children}
            {/* PlayerBar - visible UI, sticky at bottom */}
            <PlayerBar />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

**Key Points:**
- `EnhancedGlobalAudioPlayer` is the headless engine (no UI)
- `PlayerBar` is the visible UI component (sticky at bottom)
- Both must be mounted at app root for global functionality
- PlayerBar appears after `{children}` to ensure proper z-index layering

## Beat Card Implementation Pattern

**File:** `app/tenant-demo/page.tsx`

Beat cards use `DribbbleCard` directly with inline audio integration:

```tsx
import { DribbbleCard, PillCTA } from '@/platform/ui'
import { useAudioStore } from '@/stores/audio-store'
import { Play } from 'lucide-react'

export default function TenantDemoPage() {
  const play = useAudioStore((state) => state.play)
  
  const featuredBeats = [
    { 
      id: 1, 
      title: 'MIDNIGHT DRIVE', 
      bpm: 140, 
      key: 'Am', 
      tags: ['Trap', 'Dark'], 
      price: 29,
      previewUrl: 'https://example.com/preview.mp3'
    },
    // ... more beats
  ]
  
  const handlePlayBeat = (beat: typeof featuredBeats[0]) => {
    play({
      id: `demo-track-${beat.id}`,
      title: `${beat.title} - Preview`,
      artistName: 'Demo Studio',
      previewUrl: beat.previewUrl,
      bpm: beat.bpm,
      trackKey: beat.key,
      duration: 30,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredBeats.map((beat) => (
        <DribbbleCard key={beat.id} glow>
          <button
            onClick={() => handlePlayBeat(beat)}
            aria-label={`Play ${beat.title}`}
            className="w-full"
          >
            <Play className="w-12 h-12" />
          </button>
          <h3>{beat.title}</h3>
          <p>{beat.bpm} BPM • {beat.key}</p>
          <div className="flex gap-2">
            {beat.tags.map(tag => <span key={tag}>{tag}</span>)}
          </div>
          <PillCTA>${beat.price}</PillCTA>
        </DribbbleCard>
      ))}
    </div>
  )
}
```

**Key Points:**
- Use `DribbbleCard` from `@/platform/ui` (NOT a custom TrackCard component)
- Integrate audio logic inline using `useAudioStore` hooks
- Create `handlePlayBeat` function in the page component
- Pass beat data directly to `store.play()`
- This prevents design system drift

## User Experience

### Playing a Beat
1. User clicks play button on a beat card (using `DribbbleCard`)
2. If beat has preview available:
   - Beat loads into global audio player via `store.play()`
   - PlayerBar updates with beat info
   - Audio plays through the global player

### Switching Beats
1. User clicks play on a different beat
2. Previous beat stops automatically
3. New beat loads and plays
4. PlayerBar updates with new beat info

### Pausing
1. User clicks pause button in PlayerBar
2. Playback pauses
3. Beat card remains in default state (no special "paused" indicator)

## Visual States (Using DribbbleCard)

Beat cards use standard `DribbbleCard` styling:
- Glass morphism background
- Optional glow effect
- Hover states handled by DribbbleCard
- No custom "currently playing" visual states on cards
- PlayerBar shows which track is playing

## Testing

### Current Implementation - All Beats Working ✅

**Status:** Task 8.10 completed. All three beats in `tenant-demo` now have working play buttons using `DribbbleCard` primitives.

**What Was Fixed:**
- Root cause: `handlePlayDemoTrack` was hardcoded to only play MIDNIGHT DRIVE
- Solution: 
  - Added `previewUrl` property to each beat in `featuredBeats` array
  - Created generic `handlePlayBeat(beat)` function that accepts any beat object
  - Updated all play buttons (large card and small cards) to call `handlePlayBeat` with correct beat
  - Added proper `aria-label` attributes with beat titles

**Verified with Playwright MCP:**
1. NEON NIGHTS play button → PlayerBar shows "NEON NIGHTS - Preview", "128 BPM", "Fm" ✅
2. URBAN PULSE play button → PlayerBar shows "URBAN PULSE - Preview", "85 BPM", "Gm" ✅
3. MIDNIGHT DRIVE play button → PlayerBar shows "MIDNIGHT DRIVE - Preview", "140 BPM", "Am" ✅
4. Track switching works correctly (previous track button becomes inactive, new track button becomes active) ✅

**Screenshot:** `docs/screenshots/tenant-demo-all-beats-working.png`

### Integration with Convex Data

When Convex beat data is available, use the same pattern with `DribbbleCard`:

```tsx
import { DribbbleCard, PillCTA } from '@/platform/ui'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function BeatsPage() {
  const beats = useQuery(api.modules.beats.list)
  const play = useAudioStore((state) => state.play)
  
  const handlePlayBeat = (beat: Beat) => {
    play({
      id: beat._id,
      title: beat.title,
      artistName: beat.artistName,
      previewUrl: beat.previewUrl,
      bpm: beat.bpm,
      trackKey: beat.key,
      duration: beat.duration,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {beats?.map((beat) => (
        <DribbbleCard key={beat._id} glow>
          {/* Beat card content with play button */}
          <button onClick={() => handlePlayBeat(beat)}>
            Play
          </button>
        </DribbbleCard>
      ))}
    </div>
  )
}
```

## Architecture Integration

This implementation follows the established audio architecture using Dribbble design system primitives:

```
User clicks play on DribbbleCard → handlePlayBeat() calls store.play() → 
Global store updates → EnhancedGlobalAudioPlayer syncs → 
HTML5 audio element plays → PlayerBar displays info
```

### Key Components

1. **DribbbleCard** (UI Primitive from Design System)
   - Standard glass morphism card from `@/platform/ui`
   - Contains beat info and play button
   - NO custom TrackCard component needed

2. **Audio Store** (State Management)
   - Manages playback state
   - Provides selector hooks
   - Persists volume/mute preferences

3. **EnhancedGlobalAudioPlayer** (Headless Engine)
   - Syncs store state with audio element
   - Handles browser audio events
   - Mounted at app root

4. **PlayerBar** (UI Component)
   - Displays current track info
   - Provides playback controls
   - Sticky at bottom of page

## Requirements Satisfied

- **Requirement 12.2**: Audio Preview Playback
  - Play button triggers global player ✅
  - PlayerBar shows currently playing track ✅
  - Seamless playback across navigation ✅

## Design System Compliance

✅ **DO:**
- Use `DribbbleCard` from `@/platform/ui` for beat cards
- Integrate audio logic inline in page components
- Use `useAudioStore` hooks directly
- Follow glass morphism design language

❌ **DON'T:**
- Create custom `TrackCard` component in `src/modules/`
- Duplicate card styling outside of `@/platform/ui`
- Use Tailwind `backdrop-blur-*` directly in JSX
- Deviate from Dribbble primitives

**Reason:** Prevents design system drift and maintains visual consistency across the entire application.

## Related Files

- `src/platform/ui/dribbble/DribbbleCard.tsx` - Card primitive used for beat cards
- `src/stores/audio-store.ts` - Global audio state
- `src/components/audio/EnhancedGlobalAudioPlayer.tsx` - Headless engine
- `src/components/audio/PlayerBar.tsx` - Player UI
- `app/layout.tsx` - Root layout with PlayerBar mounted
- `app/tenant-demo/page.tsx` - Demo page showing DribbbleCard + audio integration pattern

## Key Learnings

**Architecture Decision:** Do NOT create separate TrackCard components. Use DribbbleCard primitives directly with inline audio logic.

**Why?**
1. Prevents design system drift
2. Maintains single source of truth for card styling (`@/platform/ui/dribbble/`)
3. Enforces glass morphism consistency
4. Follows established "Chrome vs Surface" rules
5. Keeps audio logic simple and transparent

**Pattern:**
```tsx
// ✅ CORRECT - Use DribbbleCard directly
<DribbbleCard glow>
  <button onClick={() => handlePlayBeat(beat)}>Play</button>
</DribbbleCard>

// ❌ WRONG - Don't create custom TrackCard
<TrackCard beat={beat} onPlay={handlePlay} />
```

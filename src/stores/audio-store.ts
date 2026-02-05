/**
 * Global Audio Store
 * 
 * Zustand store for managing audio player state across the application.
 * Uses persist middleware to save volume and mute preferences to localStorage.
 * 
 * Architecture Pattern: Headless audio engine + Global Zustand store + Connected UI components
 * - Store Location: src/stores/audio-store.ts
 * - Headless Component: src/components/audio/EnhancedGlobalAudioPlayer.tsx (mounted in app/layout.tsx)
 * - UI Component: src/components/audio/PlayerBar.tsx (uses store selectors, NOT props)
 * 
 * State Flow:
 * User action → Store action → Headless component updates audio element → Audio events update store → UI re-renders
 * 
 * Requirements: 12.2, 12.3, 12.4, 12.7, 12.8
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Track information for the audio player
 */
export interface AudioTrack {
  /** Unique track ID */
  id: string
  /** Track title */
  title: string
  /** Artist/producer name */
  artistName: string
  /** Preview audio URL (from Convex storage) */
  previewUrl: string
  /** Cover art URL (optional) */
  coverUrl?: string
  /** Track BPM (optional) */
  bpm?: number
  /** Track key (optional) */
  trackKey?: string
  /** Track duration in seconds (optional, will be set when audio loads) */
  duration?: number
}

/**
 * Audio player state
 */
export interface AudioState {
  // Playback state
  /** Currently loaded track */
  currentTrack: AudioTrack | null
  /** Whether audio is currently playing */
  isPlaying: boolean
  /** Current playback time in seconds */
  currentTime: number
  /** Total duration in seconds */
  duration: number
  /** Whether audio is loading */
  isLoading: boolean
  /** Error message if playback failed */
  error: string | null

  // Volume state (persisted)
  /** Volume level (0-1) */
  volume: number
  /** Whether audio is muted */
  isMuted: boolean

  // Actions
  /** Load and play a track */
  play: (track: AudioTrack) => void
  /** Pause playback */
  pause: () => void
  /** Toggle play/pause */
  togglePlayPause: () => void
  /** Seek to a specific time (0-1 normalized) */
  seek: (progress: number) => void
  /** Set volume (0-1) */
  setVolume: (volume: number) => void
  /** Toggle mute */
  toggleMute: () => void
  /** Update current time (called by audio element) */
  updateTime: (time: number) => void
  /** Update duration (called by audio element) */
  updateDuration: (duration: number) => void
  /** Set loading state */
  setLoading: (loading: boolean) => void
  /** Set error state */
  setError: (error: string | null) => void
  /** Reset player state */
  reset: () => void
}

/**
 * Initial state for the audio player
 */
const initialState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
  volume: 1, // 100% volume by default
  isMuted: false,
}

/**
 * Global audio store with persist middleware for volume/mute preferences
 * 
 * Persisted state: volume, isMuted
 * Transient state: currentTrack, isPlaying, currentTime, duration, isLoading, error
 */
export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      ...initialState,

      play: (track: AudioTrack) => {
        const currentTrack = get().currentTrack

        // If same track, just resume playback
        if (currentTrack?.id === track.id) {
          set({ isPlaying: true, error: null })
        } else {
          // New track - reset state and load
          set({
            currentTrack: track,
            isPlaying: true,
            currentTime: 0,
            duration: track.duration || 0,
            isLoading: true,
            error: null,
          })
        }
      },

      pause: () => {
        set({ isPlaying: false })
      },

      togglePlayPause: () => {
        const { isPlaying, currentTrack } = get()
        
        // Can't toggle if no track loaded
        if (!currentTrack) return

        set({ isPlaying: !isPlaying })
      },

      seek: (progress: number) => {
        const { duration } = get()
        const newTime = progress * duration
        set({ currentTime: newTime })
      },

      setVolume: (volume: number) => {
        // Clamp volume between 0 and 1
        const clampedVolume = Math.max(0, Math.min(1, volume))
        set({ volume: clampedVolume, isMuted: false })
      },

      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }))
      },

      updateTime: (time: number) => {
        set({ currentTime: time })
      },

      updateDuration: (duration: number) => {
        set({ duration })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false })
      },

      reset: () => {
        set({
          currentTrack: null,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          isLoading: false,
          error: null,
          // Keep volume and mute preferences (persisted)
        })
      },
    }),
    {
      name: 'audio-player-storage', // localStorage key
      // Only persist volume and mute preferences
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
      }),
    }
  )
)

/**
 * Selector hooks for optimized re-renders
 * Use these in components instead of the full store
 */

/** Get current track */
export const useCurrentTrack = () => useAudioStore((state) => state.currentTrack)

/** Get playback state */
export const useIsPlaying = () => useAudioStore((state) => state.isPlaying)

/** Get current time */
export const useCurrentTime = () => useAudioStore((state) => state.currentTime)

/** Get duration */
export const useDuration = () => useAudioStore((state) => state.duration)

/** Get volume */
export const useVolume = () => useAudioStore((state) => state.volume)

/** Get mute state */
export const useIsMuted = () => useAudioStore((state) => state.isMuted)

/** Get loading state */
export const useIsLoading = () => useAudioStore((state) => state.isLoading)

/** Get error state */
export const useError = () => useAudioStore((state) => state.error)

/** Get all playback actions */
export const useAudioActions = () =>
  useAudioStore((state) => ({
    play: state.play,
    pause: state.pause,
    togglePlayPause: state.togglePlayPause,
    seek: state.seek,
    setVolume: state.setVolume,
    toggleMute: state.toggleMute,
    reset: state.reset,
  }))

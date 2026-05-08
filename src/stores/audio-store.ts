import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AudioTrack {
  id: string
  title: string
  artistName: string
  previewUrl: string
  coverUrl?: string
  bpm?: number
  trackKey?: string
  duration?: number
}

export interface AudioState {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoading: boolean
  error: string | null
  volume: number
  isMuted: boolean
  play: (track: AudioTrack) => void
  pause: () => void
  togglePlayPause: () => void
  seek: (progress: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  updateTime: (time: number) => void
  updateDuration: (duration: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

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

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      ...initialState,

      play: (track: AudioTrack) => {
        const currentTrack = get().currentTrack

        if (currentTrack?.id === track.id) {
          set({ isPlaying: true, error: null })
        } else {
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
        
        if (!currentTrack) return

        set({ isPlaying: !isPlaying })
      },

      seek: (progress: number) => {
        const { duration } = get()
        const newTime = progress * duration
        set({ currentTime: newTime })
      },

      setVolume: (volume: number) => {
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
        })
      },
    }),
    {
      name: 'audio-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
      }),
    }
  )
)

export const useCurrentTrack = () => useAudioStore((state) => state.currentTrack)
export const useIsPlaying = () => useAudioStore((state) => state.isPlaying)
export const useCurrentTime = () => useAudioStore((state) => state.currentTime)
export const useDuration = () => useAudioStore((state) => state.duration)
export const useVolume = () => useAudioStore((state) => state.volume)
export const useIsMuted = () => useAudioStore((state) => state.isMuted)
export const useIsLoading = () => useAudioStore((state) => state.isLoading)
export const useError = () => useAudioStore((state) => state.error)

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

/**
 * EnhancedGlobalAudioPlayer - Headless Audio Engine
 * 
 * This component manages the real HTML <audio> element and syncs it with the global Zustand store.
 * It should be mounted once at the app root (inside ConvexClientProvider in app/layout.tsx).
 * 
 * Architecture Pattern: Headless audio engine + Global Zustand store + Connected UI components
 * - This component is the "headless engine" - no UI, just audio logic
 * - Syncs store state → audio element (play, pause, seek, volume)
 * - Syncs audio events → store updates (timeupdate, ended, error, loadstart)
 * - Handles loading states and errors
 * 
 * State Flow:
 * User action → Store action → This component updates audio element → Audio events update store → UI re-renders
 * 
 * Requirements: 12.2, 12.3, 12.7, 12.8
 */

'use client'

import { useAudioStore } from '@/stores/audio-store'
import { useEffect, useRef } from 'react'

export function EnhancedGlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)

  // Subscribe to store state
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const volume = useAudioStore((state) => state.volume)
  const isMuted = useAudioStore((state) => state.isMuted)
  const currentTime = useAudioStore((state) => state.currentTime)

  // Get store actions
  const updateTime = useAudioStore((state) => state.updateTime)
  const updateDuration = useAudioStore((state) => state.updateDuration)
  const setLoading = useAudioStore((state) => state.setLoading)
  const setError = useAudioStore((state) => state.setError)
  const pause = useAudioStore((state) => state.pause)

  // Sync audio source when track changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (currentTrack) {
      // Load new track
      audio.src = currentTrack.previewUrl
      audio.load()
      setLoading(true)
      setError(null)
    } else {
      // No track - clear audio
      audio.src = ''
      audio.load()
    }
  }, [currentTrack, setLoading, setError])

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      const playPromise = audio.play()
      
      // Handle play promise (required for autoplay policies)
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Audio playback failed:', error)
          setError('Playback failed. Please try again.')
          pause()
        })
      }
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack, setError, pause])

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
  }, [volume])

  // Sync mute
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = isMuted
  }, [isMuted])

  // Sync seek (when store currentTime changes externally)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    // Only seek if the difference is significant (> 0.5s) to avoid feedback loops
    const timeDiff = Math.abs(audio.currentTime - currentTime)
    if (timeDiff > 0.5) {
      audio.currentTime = currentTime
    }
  }, [currentTime, currentTrack])

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Time update - sync current time to store
    const handleTimeUpdate = () => {
      updateTime(audio.currentTime)
    }

    // Duration change - sync duration to store
    const handleDurationChange = () => {
      if (!Number.isNaN(audio.duration) && Number.isFinite(audio.duration)) {
        updateDuration(audio.duration)
      }
    }

    // Loaded metadata - audio is ready to play
    const handleLoadedMetadata = () => {
      setLoading(false)
      if (!Number.isNaN(audio.duration) && Number.isFinite(audio.duration)) {
        updateDuration(audio.duration)
      }
    }

    // Can play - audio has buffered enough to start
    const handleCanPlay = () => {
      setLoading(false)
    }

    // Waiting - audio is buffering
    const handleWaiting = () => {
      setLoading(true)
    }

    // Playing - audio started playing
    const handlePlaying = () => {
      setLoading(false)
    }

    // Ended - audio finished playing
    const handleEnded = () => {
      pause()
      updateTime(0)
    }

    // Error - audio failed to load or play
    const handleError = () => {
      const error = audio.error
      let errorMessage = 'Audio playback error'

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Playback aborted'
            break
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio'
            break
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding error'
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported'
            break
        }
      }

      // Only log error if it's not a format issue (which is expected for demo data)
      if (error?.code !== MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        console.error('Audio error:', errorMessage, error)
      }
      
      setError(errorMessage)
      setLoading(false)
      pause()
    }

    // Load start - audio started loading
    const handleLoadStart = () => {
      setLoading(true)
      setError(null)
    }

    // Attach event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)

    // Cleanup
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
    }
  }, [updateTime, updateDuration, setLoading, setError, pause])

  // Render the audio element (hidden, no controls)
  // Note: This is a headless audio engine for instrumental music (beats)
  // - Empty captions track satisfies accessibility linters (instrumental audio has no speech to caption)
  // - aria-hidden + tabIndex=-1 ensures it's not exposed to assistive tech
  // - All user interaction happens through connected UI components (PlayerBar)
  return (
    <audio
      ref={audioRef}
      preload="metadata"
      style={{ display: 'none' }}
      aria-hidden="true"
      tabIndex={-1}
      aria-label="Background audio player"
    >
      <track kind="captions" label="No captions available" default />
    </audio>
  )
}

EnhancedGlobalAudioPlayer.displayName = 'EnhancedGlobalAudioPlayer'

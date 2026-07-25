'use client'

import { DemoLicenseModal } from '@/components/tenant/DemoLicenseModal'
import { StorefrontBeatCard } from '@/components/tenant/storefront'
import { useAudioStore } from '@/stores/audio-store'
import { useState } from 'react'
import type { DemoBeat } from './demo-data'

export function DemoBeatCard({ beat }: Readonly<{ beat: DemoBeat }>) {
  const play = useAudioStore((state) => state.play)
  const pause = useAudioStore((state) => state.pause)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const [showLicense, setShowLicense] = useState(false)

  const trackId = `demo-track-${beat.id}`
  const isCurrent = currentTrack?.id === trackId
  const isBeatPlaying = isCurrent && isPlaying

  const handlePlay = () => {
    if (isBeatPlaying) {
      pause()
      return
    }
    play({
      id: trackId,
      title: beat.title,
      artistName: 'Demo Studio',
      previewUrl: beat.previewUrl,
      bpm: beat.bpm,
      trackKey: beat.key,
      duration: 24,
    })
  }

  return (
    <>
      <StorefrontBeatCard
        title={beat.title}
        bpm={beat.bpm}
        trackKey={beat.key}
        tags={beat.tags}
        mood={beat.mood}
        description={beat.description}
        price={beat.price}
        detailHref={`/tenant-demo/beats/${beat.slug}`}
        isPlaying={isBeatPlaying}
        onPlay={handlePlay}
        onAction={() => setShowLicense(true)}
      />
      <DemoLicenseModal beat={showLicense ? beat : null} onClose={() => setShowLicense(false)} />
    </>
  )
}

'use client'

import { DemoLicenseModal } from '@/components/tenant/DemoLicenseModal'
import { DemoStorefrontShell } from '@/components/tenant-demo/DemoStorefrontShell'
import { getDemoBeat } from '@/components/tenant-demo/demo-data'
import { DribbbleCard, PillCTA, WaveformPlaceholder } from '@/platform/ui'
import { useAudioStore } from '@/stores/audio-store'
import { ArrowLeft, Check, Clock, Music, Pause, Play, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function DemoBeatDetailPage() {
  const params = useParams<{ id: string }>()
  const beat = getDemoBeat(params.id)
  const play = useAudioStore((state) => state.play)
  const pause = useAudioStore((state) => state.pause)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const [showLicense, setShowLicense] = useState(false)

  if (!beat) {
    return (
      <DemoStorefrontShell>
        <section className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-black text-text">Beat not found</h1>
            <p className="mt-2 text-muted">This demo beat is no longer in the catalog.</p>
            <Link href="/tenant-demo/beats" className="mt-6 inline-block">
              <PillCTA as="span" variant="secondary">Back to beats</PillCTA>
            </Link>
          </div>
        </section>
      </DemoStorefrontShell>
    )
  }

  const trackId = `demo-track-${beat.id}`
  const isBeatPlaying = currentTrack?.id === trackId && isPlaying

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
    <DemoStorefrontShell>
      <section className="px-4 py-6 lg:px-8">
        <div className="container mx-auto">
          <Link href="/tenant-demo/beats" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-text">
            <ArrowLeft className="h-4 w-4" />
            Back to the beat vault
          </Link>
        </div>
      </section>

      <section className="px-4 pb-20 pt-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">24-second preview</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-text md:text-6xl">{beat.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{beat.description}</p>

              <DribbbleCard glow padding="lg" className="mt-8 overflow-hidden">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] text-white shadow-[0_10px_30px_rgb(var(--accent)/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={isBeatPlaying ? `Pause ${beat.title}` : `Play ${beat.title}`}
                  >
                    {isBeatPlaying ? <Pause className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[rgb(var(--accent)/0.1)] px-3 py-1 text-xs font-bold text-accent">{beat.bpm} BPM</span>
                      <span className="rounded-full bg-[rgb(var(--accent)/0.1)] px-3 py-1 text-xs font-bold text-accent">Key {beat.key}</span>
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted">{beat.mood}</span>
                    </div>
                    <WaveformPlaceholder barCount={56} isPlaying={isBeatPlaying} size="lg" variant="gradient" />
                    <p className="mt-2 text-xs text-muted">Use the global player to seek, pause, and control volume.</p>
                  </div>
                </div>
              </DribbbleCard>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { icon: Music, label: 'Files', value: 'MP3 + WAV' },
                  { icon: ShieldCheck, label: 'Rights', value: 'Commercial' },
                  { icon: Clock, label: 'Delivery', value: 'Instant' },
                ].map(({ icon: Icon, label, value }) => (
                  <DribbbleCard key={label} padding="md">
                    <Icon className="mb-4 h-5 w-5 text-accent" />
                    <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
                    <p className="mt-1 font-bold text-text">{value}</p>
                  </DribbbleCard>
                ))}
              </div>
            </div>

            <aside>
              <DribbbleCard glow padding="lg" className="sticky top-24">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Non-exclusive license</p>
                <p className="mt-3 text-sm text-muted">Starting at</p>
                <p className="text-5xl font-black text-text">${beat.price}</p>
                <ul className="my-7 space-y-3">
                  {['Commercial release rights', 'Instant audio delivery', 'Generated license PDF', 'Secure Stripe checkout'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted">
                      <Check className="h-4 w-4 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
                <PillCTA fullWidth size="lg" onClick={() => setShowLicense(true)}>
                  Choose your license
                </PillCTA>
                <p className="mt-4 text-center text-xs text-muted">Demo flow — no payment is initiated.</p>
              </DribbbleCard>
            </aside>
          </div>
        </div>
      </section>

      <DemoLicenseModal beat={showLicense ? beat : null} onClose={() => setShowLicense(false)} />
    </DemoStorefrontShell>
  )
}

'use client'

import { DribbbleCard, DribbbleSectionEnter, PillCTA } from '@/platform/ui'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, FileText, Headphones, Play, Search, Tag } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

/**
 * StorefrontDemoSection - Section 03 "See it in action"
 *
 * An auto-advancing, interactive walkthrough of what a customer actually does
 * on a creator's storefront: browse → preview → buy + receive the license.
 *
 * Mirrors the real /tenant-demo surface (same fields: title, BPM, key, tags,
 * tiered price) so the landing page shows the product rather than a generic
 * dashboard mockup.
 */

const STEPS = [
  {
    id: 'browse',
    icon: Search,
    label: 'Browse the catalog',
    description: 'Artists land on your branded storefront and filter your beats by genre, BPM and key.',
  },
  {
    id: 'preview',
    icon: Headphones,
    label: 'Preview before buying',
    description: 'A 30-second preview is generated automatically for every upload. No player to configure.',
  },
  {
    id: 'license',
    icon: FileText,
    label: 'Buy and get licensed',
    description: 'They pick a license tier, pay straight into your Stripe, get the audio immediately, and receive the generated PDF in their dashboard.',
  },
] as const

type StepId = (typeof STEPS)[number]['id']

const BEATS = [
  { id: 1, title: 'MIDNIGHT DRIVE', bpm: 140, musicalKey: 'Am', tags: ['Trap', 'Dark'], price: 29 },
  { id: 2, title: 'NEON NIGHTS', bpm: 128, musicalKey: 'Fm', tags: ['Synthwave'], price: 35 },
  { id: 3, title: 'URBAN PULSE', bpm: 85, musicalKey: 'Gm', tags: ['Hip-Hop'], price: 25 },
] as const

const LICENSE_TIERS: ReadonlyArray<{
  name: string
  detail: string
  price: number
  recommended?: boolean
}> = [
  { name: 'Basic', detail: 'MP3 · 5 000 streams', price: 29 },
  { name: 'Premium', detail: 'WAV + stems · 100 000 streams', price: 79, recommended: true },
  { name: 'Unlimited', detail: 'Full rights · unlimited', price: 199 },
]

const STEP_DURATION_MS = 5200

/** Fixed pseudo-random waveform so server and client render identically */
const WAVEFORM = [
  38, 62, 45, 78, 92, 55, 40, 70, 88, 51, 34, 66, 95, 72, 48, 60,
  82, 44, 58, 90, 67, 39, 75, 86, 52, 43, 69, 97, 61, 47, 80, 56,
]

function BrowserChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <DribbbleCard padding="none" hoverLift={false} className="overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[rgb(var(--bg)/0.95)]">
        <div className="flex gap-1.5 shrink-0" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 mx-2 sm:mx-4 min-w-0">
          <div className="bg-[rgb(var(--bg)/0.8)] border border-border rounded-md px-3 py-1 text-[11px] text-muted text-center truncate">
            demostudio.brolabentertainment.com
          </div>
        </div>
      </div>
      {children}
    </DribbbleCard>
  )
}

function StorefrontHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold text-text uppercase tracking-widest truncate">Demo Studio</p>
        <p className="text-[10px] text-muted">Producer · Los Angeles</p>
      </div>
      <span className="text-[10px] font-bold text-accent uppercase tracking-wider border border-accent/40 rounded-full px-2 py-0.5 shrink-0">
        50+ beats
      </span>
    </div>
  )
}

function BeatRow({ beat, active }: Readonly<{ beat: (typeof BEATS)[number]; active?: boolean }>) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
        active
          ? 'border-accent/50 bg-[rgb(var(--accent)/0.10)]'
          : 'border-border bg-[rgb(var(--card)/0.6)]'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
          active ? 'bg-accent' : 'bg-[rgb(var(--accent)/0.15)]'
        }`}
      >
        <Play
          className={`w-4 h-4 ${active ? 'text-[rgb(var(--bg))]' : 'text-accent'}`}
          fill="currentColor"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-text truncate">{beat.title}</p>
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span>{beat.bpm} BPM</span>
          <span aria-hidden="true">·</span>
          <span>{beat.musicalKey}</span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            {beat.tags[0]}
          </span>
        </div>
      </div>

      <span className="text-[11px] font-bold text-accent shrink-0">${beat.price}</span>
    </div>
  )
}

function BrowseStep() {
  return (
    <div className="space-y-3">
      <StorefrontHeader />
      <div className="flex items-center gap-2 rounded-lg border border-border bg-[rgb(var(--bg)/0.6)] px-2.5 py-2">
        <Search className="w-3.5 h-3.5 text-muted shrink-0" />
        <span className="text-[11px] text-muted">Search beats…</span>
        <div className="ml-auto flex gap-1.5">
          <span className="text-[10px] rounded-full border border-accent/40 text-accent px-2 py-0.5">Trap</span>
          <span className="hidden sm:inline text-[10px] rounded-full border border-border text-muted px-2 py-0.5">140 BPM</span>
        </div>
      </div>
      <div className="space-y-2">
        {BEATS.map((beat, i) => (
          <motion.div
            key={beat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <BeatRow beat={beat} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PreviewStep({ animate }: Readonly<{ animate: boolean }>) {
  return (
    <div className="space-y-3">
      <StorefrontHeader />
      <BeatRow beat={BEATS[0]} active />

      {/* Waveform */}
      <div className="flex items-end gap-[3px] h-14 px-1" aria-hidden="true">
        {WAVEFORM.map((height, i) => (
          <motion.div
            key={`bar-${i}`}
            className={`flex-1 rounded-full ${i < WAVEFORM.length * 0.4 ? 'bg-accent' : 'bg-[rgb(var(--text)/0.15)]'}`}
            style={{ height: `${height}%` }}
            animate={
              animate && i < WAVEFORM.length * 0.4
                ? { scaleY: [1, 0.6, 1.1, 0.85, 1] }
                : undefined
            }
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.04, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Player bar */}
      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[rgb(var(--accent)/0.12)] border border-accent/30">
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
          <Play className="w-3 h-3 text-[rgb(var(--bg))]" fill="currentColor" />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-[10px] font-bold text-text truncate">MIDNIGHT DRIVE — 30s preview</p>
          <div className="h-1 rounded-full bg-[rgb(var(--text)/0.12)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: '0%' }}
              animate={{ width: animate ? '100%' : '40%' }}
              transition={animate ? { duration: 4.6, ease: 'linear' } : { duration: 0 }}
            />
          </div>
        </div>
        <span className="text-[10px] text-muted shrink-0 tabular-nums">0:30</span>
      </div>

      <p className="text-[10px] text-muted text-center">
        Preview auto-generated on upload — the full file stays locked until purchase.
      </p>
    </div>
  )
}

function LicenseStep() {
  return (
    <div className="space-y-3">
      <StorefrontHeader />
      <p className="text-[11px] font-bold text-text uppercase tracking-wide">Choose a license</p>

      <div className="space-y-2">
        {LICENSE_TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={`flex items-center gap-3 rounded-lg border p-2.5 ${
              tier.recommended
                ? 'border-accent/50 bg-[rgb(var(--accent)/0.10)]'
                : 'border-border bg-[rgb(var(--card)/0.6)]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                tier.recommended ? 'border-accent bg-accent' : 'border-[rgb(var(--text)/0.25)]'
              }`}
            >
              {tier.recommended && <Check className="w-2.5 h-2.5 text-[rgb(var(--bg))]" strokeWidth={4} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-text">{tier.name}</p>
              <p className="text-[10px] text-muted truncate">{tier.detail}</p>
            </div>
            <span className="text-[11px] font-bold text-accent shrink-0">${tier.price}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.35 }}
        className="flex items-center gap-2.5 rounded-lg border border-accent/30 bg-[rgb(var(--accent)/0.10)] p-2.5"
      >
        <FileText className="w-4 h-4 text-accent shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-text">License PDF delivered</p>
          <p className="text-[10px] text-muted truncate">Paid to your Stripe · BroLab took $0</p>
        </div>
      </motion.div>
    </div>
  )
}

export function StorefrontDemoSection() {
  const [activeStep, setActiveStep] = useState<StepId>('browse')
  const [paused, setPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const advance = useCallback(() => {
    setActiveStep((current) => {
      const index = STEPS.findIndex((s) => s.id === current)
      return STEPS[(index + 1) % STEPS.length].id
    })
  }, [])

  useEffect(() => {
    // No carousel for users who asked for reduced motion, or while interacting
    if (prefersReducedMotion || paused) return
    const timer = setInterval(advance, STEP_DURATION_MS)
    return () => clearInterval(timer)
  }, [advance, paused, prefersReducedMotion])

  return (
    <section className="px-4 py-16 lg:py-20 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter>
          <div className="flex items-center gap-4 mb-10">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">03</span>
            <h2 className="text-sm font-bold text-muted uppercase tracking-widest">See it in action</h2>
            <div className="h-px flex-1 max-w-24 bg-[rgb(var(--border)/0.4)]" />
          </div>
        </DribbbleSectionEnter>

        <DribbbleSectionEnter>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* Narrative + step controls */}
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold text-text">
                What your customer sees
              </h3>
              <p className="text-muted">
                This is the actual flow on a BroLab storefront — from landing on your page
                to walking away with the files and a versioned license agreement.
              </p>

              <ul className="space-y-2">
                {STEPS.map((step, index) => {
                  const isActive = step.id === activeStep
                  const Icon = step.icon
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStep(step.id)
                          setPaused(true)
                        }}
                        aria-current={isActive ? 'step' : undefined}
                        className={`w-full text-left rounded-xl border p-4 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          isActive
                            ? 'border-accent/50 bg-[rgb(var(--accent)/0.08)]'
                            : 'border-border bg-[rgb(var(--card)/0.5)] hover:border-accent/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-accent' : 'bg-[rgb(var(--accent)/0.15)]'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[rgb(var(--bg))]' : 'text-accent'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text">
                              <span className="text-accent tabular-nums mr-2">0{index + 1}</span>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted mt-1 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/tenant-demo">
                  <PillCTA variant="primary" size="lg" className="group">
                    <span>Open the live demo</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </PillCTA>
                </Link>
              </div>
            </div>

            {/* The storefront itself */}
            <div
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <BrowserChrome>
                {/* min-height prevents the frame resizing between steps */}
                <div className="p-4 sm:p-5 bg-[rgb(var(--bg-2)/0.4)] min-h-[340px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {activeStep === 'browse' && <BrowseStep />}
                      {activeStep === 'preview' && <PreviewStep animate={!prefersReducedMotion && !paused} />}
                      {activeStep === 'license' && <LicenseStep />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </BrowserChrome>

              <div
                className="absolute -inset-4 -z-10 rounded-2xl pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, rgb(var(--accent)/0.12) 0%, transparent 70%)' }}
                aria-hidden="true"
              />
            </div>

          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

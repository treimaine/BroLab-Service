'use client'

import {
    ConstellationDots,
    CyanOrb,
    EditionBadge,
    MicroInfoModule,
    OrganicBlob,
    OutlineStackTitle,
    PillCTA,
    WavyLines
} from '@/platform/ui'
import Link from 'next/link'

const PLATFORM_INFO: Array<{ text: string }> = [
  { text: 'Keep 100% of your revenue' },
  { text: 'Instant payouts to your bank' },
  { text: 'Licenses sent automatically' },
  { text: 'Your storefront, your brand' },
]

/**
 * The oversized pixel word carries the DIFFERENTIATOR, not the verb.
 * It used to read "LAUNCH", which restated the <h1> word-for-word and spent the
 * most valuable area of the page on zero information.
 * Press Start 2P at hero size fits ~7 characters.
 */
const HERO_PIXEL_WORD = '0% FEES'

const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 flex flex-col justify-center">
      {Array.from({ length: 8 }, (_, row) => (
        <div
          key={`music-row-${row}`}
          // Token-based: `text-white` was invisible on the light background
          className="whitespace-nowrap text-[clamp(100px,18vw,220px)] font-black tracking-[0.15em] text-[rgb(var(--text)/0.016)] dark:text-[rgb(var(--text)/0.03)] leading-[0.85]"
          style={{ transform: `translateX(${(row % 2) * -120}px)` }}
        >
          MUSIC MUSIC MUSIC MUSIC
        </div>
      ))}
    </div>
  </div>
)

const HeroTitle = () => (
  <div className="relative z-20">
    <OutlineStackTitle
      // `span`, not the default `h1` — the real <h1> is the sentence below.
      as="span"
      size="hero"
      layers={3}
      offset={2}
      className="block text-[clamp(40px,8vw,104px)] font-black tracking-[0.05em]"
      style={{
        fontFamily: '"Press Start 2P", monospace',
        textShadow: '0 0 60px rgb(var(--glow)/0.30), 0 0 120px rgb(var(--glow)/0.15)',
      }}
    >
      {HERO_PIXEL_WORD}
    </OutlineStackTitle>

    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-20" style={{ top: '35%' }} />
      <div className="absolute w-full h-px bg-[rgb(var(--text))] opacity-10" style={{ top: '65%' }} />
    </div>
  </div>
)

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[rgb(var(--bg))] pt-28 pb-16 lg:pt-32 lg:pb-24">
      <BackgroundPattern />

      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)/0.08) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <WavyLines className="right-0 top-0 w-[180px] h-full" />

      <div
        className="absolute right-[15%] top-0 bottom-0 w-px hidden lg:block pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, rgb(var(--accent)) 0px, rgb(var(--accent)) 4px, transparent 4px, transparent 14px)',
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      <ConstellationDots className="top-[10%] right-[20%] w-[150px] h-[150px] hidden lg:block" />

      <div className="absolute bottom-0 right-[5%] hidden lg:block z-0 pointer-events-none" aria-hidden="true">
        <OrganicBlob className="w-[180px] h-[140px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        {/*
          Grid, not absolute positioning: the info module used to be `absolute`
          and overlapped the <h1> between ~1280px and ~1500px, clipping
          "Sell your music". In flow it can never collide.
        */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-12 items-center">

          <div className="space-y-10 text-center xl:text-left">
            <HeroTitle />

            <div className="space-y-6 max-w-2xl mx-auto xl:mx-0">
              <p className="text-xs font-bold text-accent uppercase tracking-widest">
                For producers &amp; audio engineers
              </p>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text leading-tight text-balance">
                Launch your store. Sell your music. Get paid directly.
              </h1>

              <p className="text-base text-muted max-w-xl mx-auto xl:mx-0">
                Beats and mixing services on one storefront under your own brand.
                You keep <span className="text-text font-semibold">100%</span> of every sale —
                we never take a commission.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center xl:justify-start">
                <Link
                  href="/sign-up?plan=pro&period=month&source=landing"
                  data-growth-cta
                >
                  <PillCTA variant="primary" size="lg">
                    Start My Storefront
                  </PillCTA>
                </Link>
                <Link href="/tenant-demo">
                  <PillCTA variant="secondary" size="lg">
                    View Demo
                  </PillCTA>
                </Link>
              </div>

              <p className="text-xs text-muted">
                1 month free on BASIC and PRO • Cancel anytime
              </p>
            </div>

            {/* In flow — used to be absolute and covered the reassurance line on mobile */}
            <div className="flex items-end gap-5 justify-center xl:justify-start pt-4">
              <EditionBadge title="BROLAB" subtitle="Edition" />
              <CyanOrb size={70} className="hidden sm:block" />
            </div>
          </div>

          <div className="hidden xl:block">
            <MicroInfoModule items={PLATFORM_INFO} />
          </div>

        </div>
      </div>
    </section>
  )
}

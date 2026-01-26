'use client'

import {
  ChromeSurface,
  ConstellationDots,
  CyanOrb,
  EditionBadge,
  MicroInfoModule,
  OrganicBlob,
  OutlineStackTitle,
  PillCTA,
  WavyLines
} from '@/platform/ui'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const PLATFORM_INFO: Array<{ text: string }> = [
  { text: 'Powered by Clerk Billing (subscriptions)' },
  { text: 'One-time payments via Stripe' },
  { text: 'Licenses generated automatically' },
  { text: 'Sell beats + services in one storefront' },
]

const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 flex flex-col justify-center">
      {Array.from({ length: 8 }, (_, row) => (
        <div 
          key={`music-row-${row}`}
          className="whitespace-nowrap text-[clamp(100px,18vw,220px)] font-black tracking-[0.15em] opacity-[0.025] text-white leading-[0.85]"
          style={{ transform: `translateX(${(row % 2) * -120}px)` }}
        >
          MUSIC MUSIC MUSIC MUSIC
        </div>
      ))}
    </div>
  </div>
)

const HeroTitle = ({ className }: { className?: string }) => (
  <div className="relative z-20">
    <OutlineStackTitle 
      size="hero" 
      layers={3}
      offset={2}
      className={className}
      style={{
        fontFamily: '"Press Start 2P", monospace',
        textShadow: '0 0 60px rgba(0,255,255,0.3), 0 0 120px rgba(0,255,255,0.15)',
      }}
    >
      EXPLORE
    </OutlineStackTitle>
    
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-20" style={{ top: '35%' }} />
      <div className="absolute w-full h-[1px] bg-white opacity-10" style={{ top: '65%' }} />
    </div>
  </div>
)

const HeroCopy = () => (
  <div className="space-y-6 max-w-2xl mx-auto">
    <div className="text-xs font-bold text-accent uppercase tracking-widest">
      FOR PRODUCERS & AUDIO ENGINEERS
    </div>
    
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text leading-tight">
      Sell beats. Book sessions. Get paid directly.
    </h1>
    
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link href="/sign-up">
        <PillCTA variant="primary" size="lg">
          Get Started Free
        </PillCTA>
      </Link>
      <Link href="/tenant-demo">
        <PillCTA variant="secondary" size="lg">
          View Demo
        </PillCTA>
      </Link>
    </div>
    
    <p className="text-xs text-muted">
      No credit card • Cancel anytime
    </p>
  </div>
)

export function HeroSection() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[rgb(var(--bg))]">
      <BackgroundPattern />

      <div 
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent), 0.08) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <WavyLines className="right-0 top-0 w-[180px] h-full" />

      <div 
        className="absolute right-[15%] top-0 bottom-0 w-px hidden lg:block"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, rgb(var(--accent)) 0px, rgb(var(--accent)) 4px, transparent 4px, transparent 14px)',
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      <ConstellationDots className="top-[10%] right-[20%] w-[150px] h-[150px] hidden lg:block" />

      <ChromeSurface
        as="header"
        blur="sm"
        mode={isScrolled ? 'elevated' : 'transparent'}
        className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-6 transition-[background-color,backdrop-filter] duration-300"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-1 flex items-center">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 text-muted hover:text-text transition-colors"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}
          </div>
          
          <Link href="/" className="text-sm font-medium text-muted uppercase tracking-[0.4em] hover:text-text transition-colors">
            BROLAB
          </Link>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            <Link
              href="/sign-in"
              className="hidden sm:block text-sm font-medium text-muted hover:text-text transition-colors"
            >
              Sign In
            </Link>
            <Link href="/sign-up">
              <PillCTA variant="primary" size="sm" className="group">
                <span>Explore</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </PillCTA>
            </Link>
          </div>
        </div>
      </ChromeSurface>

      <div className="relative z-10 container mx-auto px-4 lg:px-8 min-h-screen flex items-center">
        <div className="w-full">
          <div className="relative min-h-[75vh] flex flex-col justify-center">
            
            <div className="hidden lg:block">
              <div className="space-y-12 text-center">
                <HeroTitle className="text-[clamp(80px,14vw,180px)] font-black tracking-[0.05em]" />
                <HeroCopy />
              </div>
            </div>
            
            <div className="lg:hidden space-y-12">
              <div className="text-center">
                <HeroTitle className="text-[clamp(48px,12vw,160px)] font-black tracking-[0.05em]" />
              </div>
              <div className="text-center">
                <HeroCopy />
              </div>
            </div>

            <div className="absolute bottom-12 left-0 z-30 flex items-end gap-5">
              <EditionBadge title="BROLAB" subtitle="Edition" />
              <CyanOrb size={70} className="hidden sm:block" />
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-0 xl:right-[5%] hidden xl:block z-30">
              <MicroInfoModule items={PLATFORM_INFO} />
            </div>

            <div className="absolute bottom-0 right-[5%] hidden lg:block z-20 pointer-events-none">
              <OrganicBlob className="w-[180px] h-[140px]" />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

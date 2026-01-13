'use client'

import {
  ChromeSurface,
  ConstellationDots,
  CyanOrb,
  DribbbleCard,
  DribbbleSectionEnter,
  DribbbleStaggerItem,
  EditionBadge,
  MicroInfoModule,
  OrganicBlob,
  OutlineStackTitle,
  PillCTA,
  WavyLines
} from '@/platform/ui'
import {
  Headphones,
  Music,
  Sparkles,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Info items for MicroInfoModule
const platformInfo = [
  { text: 'Powered by Clerk Billing (subscriptions)' },
  { text: 'One-time payments via Stripe' },
  { text: 'Licenses generated automatically' },
  { text: 'Sell beats + services in one storefront' },
]

// Hero Section - ELECTRI-X Style
function HeroSection() {
  const [isDark, setIsDark] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark')
    globalThis.localStorage?.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  // Detect scroll to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[rgb(var(--bg))]">
      {/* Background Pattern - MUSIC repeated */}
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

      {/* Radial glow - top right */}
      <div 
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(var(--accent), 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Wavy Lines - Right side */}
      <WavyLines className="right-0 top-0 w-[180px] h-full" />

      {/* Dotted vertical line */}
      <div 
        className="absolute right-[15%] top-0 bottom-0 w-px hidden lg:block"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, rgb(var(--accent)) 0px, rgb(var(--accent)) 4px, transparent 4px, transparent 14px)',
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      {/* Constellation - top right area */}
      <ConstellationDots className="top-[10%] right-[20%] w-[150px] h-[150px] hidden lg:block" />

      {/* Header - Transparent at top, opaque on scroll */}
      <ChromeSurface
        as="header"
        blur="sm"
        mode={isScrolled ? 'elevated' : 'transparent'}
        className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-6 transition-[background-color,backdrop-filter] duration-300"
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Left: Theme toggle */}
          <div className="flex-1 flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-text transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          
          {/* Center: Brand */}
          <Link href="/" className="text-sm font-medium text-muted uppercase tracking-[0.4em] hover:text-text transition-colors">
            BROLAB
          </Link>
          
          {/* Right: Sign In + CTA */}
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

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 min-h-screen flex items-center">
        <div className="w-full lg:pl-24">
          <div className="relative min-h-[75vh] flex flex-col justify-center">
            
            {/* Outline Stack Title - ELECTRI-X signature */}
            <div className="relative z-20 text-center lg:text-left">
              <OutlineStackTitle 
                size="hero" 
                layers={3}
                offset={2}
                className="text-[clamp(48px,12vw,160px)] font-black tracking-[0.05em]"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  textShadow: '0 0 60px rgba(0,255,255,0.3), 0 0 120px rgba(0,255,255,0.15)',
                }}
              >
                EXPLORE
              </OutlineStackTitle>
              
              {/* Glitch/scan lines */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-20" style={{ top: '35%' }} />
                <div className="absolute w-full h-[1px] bg-white opacity-10" style={{ top: '65%' }} />
              </div>
            </div>

            {/* Edition Badge + Orb - Bottom Left */}
            <div className="absolute bottom-12 left-0 z-30 flex items-end gap-5">
              <EditionBadge title="BROLAB" subtitle="Edition" />
              <CyanOrb size={70} className="hidden sm:block" />
            </div>

            {/* Info Module - Right side */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 lg:right-[5%] hidden lg:block z-30">
              <MicroInfoModule items={platformInfo} />
            </div>

            {/* Organic Blob - Bottom Right */}
            <div className="absolute bottom-0 right-[5%] hidden lg:block z-20 pointer-events-none">
              <OrganicBlob className="w-[180px] h-[140px]" />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}


// Mobile Info Section
function MobileInfoSection() {
  return (
    <section className="px-4 py-12 lg:hidden bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-md">
        <MicroInfoModule items={platformInfo} className="mx-auto" />
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  return (
    <section className="px-4 py-16 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/sign-up?role=producer">
            <PillCTA variant="primary" size="lg" icon={Music}>
              Start as Producer
            </PillCTA>
          </Link>
          <Link href="/sign-up?role=engineer">
            <PillCTA variant="secondary" size="lg" icon={Headphones}>
              Start as Engineer
            </PillCTA>
          </Link>
          <Link href="/sign-up?role=artist">
            <PillCTA variant="ghost" size="lg" icon={Users}>
              I&apos;m an Artist
            </PillCTA>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  return (
    <section className="px-4 py-24 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter>
          <div className="flex items-center gap-4 mb-12">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">01</span>
            <h2 className="text-sm font-bold text-muted uppercase tracking-widest">WHAT WE OFFER</h2>
            <div className="h-px w-24 bg-[rgba(var(--border),0.5)]" />
          </div>
        </DribbbleSectionEnter>

        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <DribbbleStaggerItem className="lg:col-span-7">
              <DribbbleCard glow hoverLift padding="lg" className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center flex-shrink-0">
                    <Music className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text mb-2">SELL YOUR BEATS</h3>
                    <p className="text-muted text-sm">Upload your productions, set tiered pricing, and let artists preview before they buy.</p>
                  </div>
                </div>
              </DribbbleCard>
            </DribbbleStaggerItem>

            <div className="lg:col-span-5 space-y-6">
              <DribbbleStaggerItem>
                <DribbbleCard hoverLift padding="md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text uppercase">OFFER SERVICES</h4>
                      <p className="text-xs text-muted">Mixing, mastering, vocal tuning</p>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>

              <DribbbleStaggerItem>
                <DribbbleCard hoverLift padding="md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text uppercase">AUTO LICENSES</h4>
                      <p className="text-xs text-muted">PDF generated for every sale</p>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>

              <DribbbleStaggerItem>
                <DribbbleCard hoverLift padding="md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text uppercase">DIRECT PAYMENTS</h4>
                      <p className="text-xs text-muted">Straight to your Stripe</p>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>
            </div>
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

// Final CTA
function FinalCTASection() {
  return (
    <section className="px-4 py-24 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter>
          <DribbbleCard glow padding="lg" className="text-center relative overflow-hidden">
            {/* Decorative glows - using radial gradient instead of blur filter for performance */}
            <div 
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none" 
              style={{ background: 'radial-gradient(circle, rgba(var(--accent),0.15) 0%, transparent 70%)' }}
            />
            <div 
              className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(var(--accent-2),0.15) 0%, transparent 70%)' }}
            />
            <div className="relative z-10">
              <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">GET STARTED</span>
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">READY TO LAUNCH?</h2>
              <p className="text-muted text-sm mb-8 max-w-md mx-auto">Join creators who are already growing their brand with BroLab.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/sign-up"><PillCTA variant="primary" size="lg">Start Free</PillCTA></Link>
                <Link href="/pricing"><PillCTA variant="secondary" size="lg">View Pricing</PillCTA></Link>
              </div>
            </div>
          </DribbbleCard>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

// Main Page
export default function HubLandingPageClient() {
  return (
    <main>
      <HeroSection />
      <MobileInfoSection />
      <CTASection />
      <FeaturesSection />
      <FinalCTASection />
    </main>
  )
}

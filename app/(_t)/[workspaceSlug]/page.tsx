'use client'

import { useWorkspace } from '@/components/tenant'
import {
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
    WavyLines,
} from '@/platform/ui'
import { Headphones, Music, Play } from 'lucide-react'
import Link from 'next/link'

/**
 * Tenant Storefront Home Page
 * 
 * Main landing page for a provider's storefront.
 * Displays hero section, featured beats, and services.
 * 
 * Requirements: 21.1 (storefront home with hero, latest drops, featured services)
 */
export default function TenantHomePage() {
  const { workspace, isLoading, error } = useWorkspace()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading workspace...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text mb-4">Workspace Not Found</h1>
          <p className="text-muted mb-8">{error || 'This workspace does not exist.'}</p>
          <Link href="/">
            <PillCTA variant="primary">Return to Home</PillCTA>
          </Link>
        </div>
      </div>
    )
  }

  const workspaceName = workspace.name
  const workspaceType = workspace.type === 'producer' ? 'PRODUCER' : 'ENGINEER'

  // Placeholder stats
  const stats = [
    { text: '50+ Premium Beats' },
    { text: '1000+ Sales Worldwide' },
    { text: 'Professional Quality' },
    { text: '24h Delivery' },
  ]

  return (
    <>
      {/* HERO SECTION - ELECTRI-X STYLE */}
      <section className="relative min-h-[80vh] overflow-hidden bg-[rgb(var(--bg))]">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 flex flex-col justify-center">
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.025] text-white leading-[0.85]">
              BEATS BEATS BEATS BEATS
            </div>
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.025] text-white leading-[0.85]" style={{ transform: 'translateX(-100px)' }}>
              BEATS BEATS BEATS BEATS
            </div>
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.025] text-white leading-[0.85]">
              BEATS BEATS BEATS BEATS
            </div>
          </div>
        </div>

        {/* Radial glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(var(--accent), 0.08) 0%, transparent 70%)' }} aria-hidden="true" />

        {/* Wavy Lines */}
        <WavyLines className="right-0 top-0 w-[150px] h-full" />

        {/* Dotted vertical line */}
        <div className="absolute right-[12%] top-0 bottom-0 w-px hidden lg:block" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgb(var(--accent)) 0px, rgb(var(--accent)) 4px, transparent 4px, transparent 14px)', opacity: 0.4 }} aria-hidden="true" />

        {/* Constellation */}
        <ConstellationDots className="top-[15%] right-[18%] w-[120px] h-[120px] hidden lg:block" />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8 min-h-[80vh] flex items-center">
          <div className="w-full">
            <div className="relative min-h-[60vh] flex flex-col justify-center">
              
              {/* Title */}
              <div className="relative z-20 mb-6">
                <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">{workspaceType}</span>
                <OutlineStackTitle 
                  size="hero"
                  layers={3}
                  offset={2}
                  className="text-[clamp(36px,10vw,120px)] font-black tracking-[0.05em]"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    textShadow: '0 0 60px rgba(0,255,255,0.3), 0 0 120px rgba(0,255,255,0.15)',
                  }}
                >
                  {workspaceName.toUpperCase()}
                </OutlineStackTitle>
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                  <div className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-20" style={{ top: '35%' }} />
                  <div className="absolute w-full h-[1px] bg-white opacity-10" style={{ top: '65%' }} />
                </div>
              </div>

              <p className="text-lg text-muted max-w-md mb-8 text-center lg:text-left mx-auto lg:mx-0">
                Premium beats and professional services. Crafting sounds that define the future of music.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <PillCTA variant="primary" size="lg" icon={Music}>Browse Beats</PillCTA>
                <PillCTA variant="secondary" size="lg" icon={Headphones}>View Services</PillCTA>
              </div>

              {/* Edition Badge + Orb */}
              <div className="absolute bottom-8 left-0 z-30 flex items-end gap-4">
                <EditionBadge title={workspaceName} subtitle="Studio" />
                <CyanOrb size={60} className="hidden sm:block" />
              </div>

              {/* Info Module */}
              <div className="absolute top-1/2 -translate-y-1/2 right-0 lg:right-[5%] hidden lg:block z-30">
                <MicroInfoModule items={stats} />
              </div>

              {/* Organic Blob */}
              <div className="absolute bottom-0 right-[5%] hidden lg:block z-20 pointer-events-none">
                <OrganicBlob className="w-[150px] h-[120px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Info */}
      <section className="px-4 py-12 lg:hidden bg-[rgb(var(--bg))]">
        <MicroInfoModule items={stats} className="mx-auto max-w-md" />
      </section>

      {/* FEATURED BEATS PLACEHOLDER */}
      <section className="px-4 lg:px-8 py-20 bg-[rgb(var(--bg))]">
        <div className="container mx-auto">
          <DribbbleSectionEnter>
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">01</span>
              <h2 className="text-sm font-bold text-muted uppercase tracking-widest">FEATURED BEATS</h2>
              <div className="h-px w-24 bg-[rgba(var(--border),0.5)]" />
            </div>
          </DribbbleSectionEnter>

          <DribbbleSectionEnter stagger>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <DribbbleStaggerItem key={i}>
                  <DribbbleCard hoverLift padding="lg" className="h-full">
                    <div className="flex items-start gap-4">
                      <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </button>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-text mb-1">Beat Title {i}</h3>
                        <p className="text-xs text-muted mb-3">140 BPM • Am</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-text">$29</span>
                          <PillCTA variant="ghost" size="sm">Preview</PillCTA>
                        </div>
                      </div>
                    </div>
                  </DribbbleCard>
                </DribbbleStaggerItem>
              ))}
            </div>
          </DribbbleSectionEnter>

          <div className="text-center mt-12">
            <PillCTA variant="primary" size="lg" icon={Music}>View All Beats</PillCTA>
          </div>
        </div>
      </section>

      {/* SERVICES PLACEHOLDER */}
      <section className="px-4 lg:px-8 py-20 bg-[rgb(var(--bg))]">
        <div className="container mx-auto">
          <DribbbleSectionEnter>
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">02</span>
              <h2 className="text-sm font-bold text-muted uppercase tracking-widest">PROFESSIONAL SERVICES</h2>
              <div className="h-px w-24 bg-[rgba(var(--border),0.5)]" />
            </div>
          </DribbbleSectionEnter>

          <DribbbleSectionEnter stagger>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DribbbleStaggerItem>
                <DribbbleCard glow hoverLift padding="lg" className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text mb-2">MIXING & MASTERING</h3>
                      <p className="text-muted text-sm mb-4">Professional mixing and mastering services. Radio-ready sound guaranteed.</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-text">From $99</span>
                        <PillCTA variant="ghost" size="sm">Learn More</PillCTA>
                      </div>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>

              <DribbbleStaggerItem>
                <DribbbleCard hoverLift padding="lg" className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center flex-shrink-0">
                      <Music className="w-7 h-7 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text mb-2">CUSTOM PRODUCTION</h3>
                      <p className="text-muted text-sm mb-4">Exclusive beats tailored to your vision. Full commercial rights included.</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-text">From $299</span>
                        <PillCTA variant="ghost" size="sm">Get Quote</PillCTA>
                      </div>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>
            </div>
          </DribbbleSectionEnter>

          <div className="text-center mt-12">
            <PillCTA variant="primary" size="lg" icon={Headphones}>View All Services</PillCTA>
          </div>
        </div>
      </section>
    </>
  )
}

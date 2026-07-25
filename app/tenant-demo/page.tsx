'use client'

import { TenantLayout, type NavItem } from '@/components/tenant'
import {
  ConstellationDots,
  DribbbleCard,
  DribbbleSectionEnter,
  DribbbleStaggerItem,
  GlassFooter,
  MicroInfoModule,
  OrganicBlob,
  OutlineStackTitle,
  PillCTA,
  WavyLines,
} from '@/platform/ui'
import { useAudioStore } from '@/stores/audio-store'
import { DemoLicenseModal } from '@/components/tenant/DemoLicenseModal'
import { demoBeats, type DemoBeat } from '@/components/tenant-demo/demo-data'
import { Headphones, Mail, Music, Pause, Play, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const featuredBeats = demoBeats

export default function TenantDemoPage() {
  const play = useAudioStore((state) => state.play)
  const pause = useAudioStore((state) => state.pause)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const [selectedBeat, setSelectedBeat] = useState<DemoBeat | null>(null)
  
  const navItems: NavItem[] = [
    { id: 'beats', icon: Music, label: 'Beats', href: '/tenant-demo/beats', isActive: true },
    { id: 'services', icon: Headphones, label: 'Services', href: '/tenant-demo/services' },
    { id: 'contact', icon: Mail, label: 'Contact', href: '/tenant-demo/contact' },
  ]

  const producerStats = [
    { text: '50+ Premium Beats' },
    { text: '1000+ Sales Worldwide' },
    { text: 'Grammy Nominated Producer' },
    { text: '24h Delivery Guarantee' },
  ]

  const handlePlayBeat = (beat: DemoBeat) => {
    const trackId = `demo-track-${beat.id}`
    if (currentTrack?.id === trackId && isPlaying) {
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

  const isBeatPlaying = (beat: DemoBeat) =>
    currentTrack?.id === `demo-track-${beat.id}` && isPlaying

  return (
    <TenantLayout 
      navItems={navItems} 
      workspaceName="DEMO STUDIO"
      basePath="/tenant-demo"
      showPlayerBar={true}
      secondaryAction={{ label: 'Dashboard', href: '/dashboard' }}
    >
      {/* HERO SECTION - ELECTRI-X STYLE */}
      <section className="relative min-h-[560px] lg:min-h-[640px] overflow-hidden bg-[rgb(var(--bg))]">
        {/* Background Pattern - BEATS repeated */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 flex flex-col justify-center">
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.06] text-white leading-[0.85]">BEATS BEATS BEATS BEATS</div>
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.06] text-white leading-[0.85]" style={{ transform: 'translateX(-100px)' }}>BEATS BEATS BEATS BEATS</div>
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.06] text-white leading-[0.85]">BEATS BEATS BEATS BEATS</div>
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.06] text-white leading-[0.85]" style={{ transform: 'translateX(-100px)' }}>BEATS BEATS BEATS BEATS</div>
          </div>
        </div>

        {/* Radial glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgb(var(--accent)/0.08) 0%, transparent 70%)' }} aria-hidden="true" />

        {/* Wavy Lines */}
        <WavyLines className="right-0 top-0 w-[150px] h-full" />

        {/* Dotted vertical line */}
        <div className="absolute right-[12%] top-0 bottom-0 w-px hidden lg:block" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgb(var(--accent)) 0px, rgb(var(--accent)) 4px, transparent 4px, transparent 14px)', opacity: 0.4 }} aria-hidden="true" />

        {/* Constellation */}
        <ConstellationDots className="top-[15%] right-[18%] w-[120px] h-[120px] hidden lg:block" />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8 min-h-[560px] lg:min-h-[640px] flex items-center">
          <div className="w-full">
            <div className="relative min-h-[500px] lg:min-h-[560px] flex flex-col justify-center">
              
              {/* Title */}
              <div className="relative z-20 mb-6">
                <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">PRODUCER</span>
                <OutlineStackTitle 
                  size="hero"
                  layers={3}
                  offset={2}
                  className="text-[clamp(36px,10vw,128px)] font-black tracking-[0.05em] drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    textShadow: '0 0 40px rgba(0,255,255,0.3), 0 0 80px rgba(0,255,255,0.15)',
                  }}
                >
                  BEATS
                </OutlineStackTitle>
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                  <div className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-20" style={{ top: '35%' }} />
                  <div className="absolute w-full h-px bg-white opacity-10" style={{ top: '65%' }} />
                </div>
              </div>

              <p className="text-lg text-muted max-w-md mb-3 text-center lg:text-left mx-auto lg:mx-0">Premium beats and professional mixing services. Crafting sounds that define the future of music.</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-8 text-center lg:text-left">
                Play any track · 24-second instant preview
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href="/tenant-demo/beats">
                  <PillCTA as="span" variant="primary" size="lg" icon={Music}>Browse Beats</PillCTA>
                </Link>
                <Link href="/tenant-demo/services">
                  <PillCTA as="span" variant="secondary" size="lg" icon={Headphones}>Book Service</PillCTA>
                </Link>
              </div>

              {/* Info Module */}
              <div className="absolute top-1/2 -translate-y-1/2 right-0 lg:right-[5%] hidden lg:block z-30">
                <MicroInfoModule items={producerStats} />
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
        <MicroInfoModule items={producerStats} className="mx-auto max-w-md" />
      </section>

      {/* FEATURED BEATS */}
      <section id="beats" className="scroll-mt-20 px-4 lg:px-8 py-16 lg:py-20 bg-[rgb(var(--bg))]">
        <div className="container mx-auto">
          <DribbbleSectionEnter>
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">01</span>
              <h2 className="text-sm font-bold text-muted uppercase tracking-widest">FEATURED BEATS</h2>
              <div className="h-px w-24 bg-[rgb(var(--border)/0.5)]" />
            </div>
          </DribbbleSectionEnter>

          <DribbbleSectionEnter stagger>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <DribbbleStaggerItem className="lg:col-span-7">
                <DribbbleCard glow hoverLift padding="lg" className="h-full">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => handlePlayBeat(featuredBeats[0])}
                      className="w-16 h-16 rounded-2xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                      aria-label={`Play ${featuredBeats[0].title}`}
                    >
                      {isBeatPlaying(featuredBeats[0]) ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text mb-1">{featuredBeats[0].title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted mb-3">
                        <span>{featuredBeats[0].bpm} BPM</span>
                        <span>•</span>
                        <span>{featuredBeats[0].key}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {featuredBeats[0].tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs bg-[rgb(var(--accent)/0.1)] text-accent rounded-md">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-text">${featuredBeats[0].price}</span>
                        <PillCTA variant="primary" size="sm" onClick={() => setSelectedBeat(featuredBeats[0])}>
                          License Now
                        </PillCTA>
                      </div>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>

              <div className="lg:col-span-5 space-y-6">
                {featuredBeats.slice(1).map((beat) => (
                  <DribbbleStaggerItem key={beat.id}>
                    <DribbbleCard hoverLift padding="md">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handlePlayBeat(beat)}
                          className="w-10 h-10 rounded-xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center hover:bg-[rgb(var(--accent)/0.25)] transition-colors"
                          aria-label={`Play ${beat.title}`}
                        >
                          {isBeatPlaying(beat) ? (
                            <Pause className="w-4 h-4 text-accent" />
                          ) : (
                            <Play className="w-4 h-4 text-accent ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-text truncate">{beat.title}</h3>
                          <p className="text-xs text-muted">{beat.bpm} BPM • {beat.key}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedBeat(beat)}
                          className="rounded-full border border-border px-3 py-2 text-xs font-bold text-text transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          ${beat.price} · License
                        </button>
                      </div>
                    </DribbbleCard>
                  </DribbbleStaggerItem>
                ))}
              </div>
            </div>
          </DribbbleSectionEnter>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-20 px-4 lg:px-8 py-20 bg-[rgb(var(--bg))]">
        <div className="container mx-auto">
          <DribbbleSectionEnter>
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">02</span>
              <h2 className="text-sm font-bold text-muted uppercase tracking-widest">PROFESSIONAL SERVICES</h2>
              <div className="h-px w-24 bg-[rgb(var(--border)/0.5)]" />
            </div>
          </DribbbleSectionEnter>

          <DribbbleSectionEnter stagger>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DribbbleStaggerItem>
                <DribbbleCard glow hoverLift padding="lg" className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center shrink-0">
                      <Headphones className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text mb-2">MIXING & MASTERING</h3>
                      <p className="text-muted text-sm mb-4">Professional mixing and mastering services. Radio-ready sound guaranteed.</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-text">From $99</span>
                        <Link href="/tenant-demo/services/mixing-mastering">
                          <PillCTA as="span" variant="ghost" size="sm">Learn More</PillCTA>
                        </Link>
                      </div>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>

              <DribbbleStaggerItem>
                <DribbbleCard hoverLift padding="lg" className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center shrink-0">
                      <Star className="w-7 h-7 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text mb-2">CUSTOM PRODUCTION</h3>
                      <p className="text-muted text-sm mb-4">Exclusive beats tailored to your vision. Full commercial rights included.</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-text">From $299</span>
                        <Link href="/tenant-demo/services/custom-production">
                          <PillCTA as="span" variant="ghost" size="sm">Get Quote</PillCTA>
                        </Link>
                      </div>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>
            </div>
          </DribbbleSectionEnter>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="scroll-mt-20 px-4 lg:px-8 py-20 bg-[rgb(var(--bg))]">
        <div className="container mx-auto max-w-4xl">
          <DribbbleSectionEnter>
            <DribbbleCard glow padding="lg" className="text-center relative overflow-hidden">
              {/* Decorative glows - using radial gradient instead of blur filter for performance */}
              <div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none" 
                style={{ background: 'radial-gradient(circle, rgb(var(--accent)/0.15) 0%, transparent 70%)' }}
              />
              <div 
                className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgb(var(--accent-2)/0.15) 0%, transparent 70%)' }}
              />
              <div className="relative z-10">
                <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">GET STARTED</span>
                <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">READY TO CREATE?</h2>
                <p className="text-muted text-sm mb-8 max-w-md mx-auto">Join thousands of artists who trust Demo Studio for their sound.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/tenant-demo/beats">
                    <PillCTA as="span" variant="primary" size="lg" icon={Music}>Browse All Beats</PillCTA>
                  </Link>
                  <Link href="/tenant-demo/contact">
                    <PillCTA as="span" variant="secondary" size="lg" icon={Users}>Contact Producer</PillCTA>
                  </Link>
                </div>
              </div>
            </DribbbleCard>
          </DribbbleSectionEnter>
        </div>
      </section>

      <GlassFooter className="py-12 px-4 lg:px-8 border-t border-border/20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center text-white font-bold select-none">
              D
            </div>
            <div>
              <p className="font-bold text-text">DEMO STUDIO</p>
              <p className="text-xs text-muted">Powered by BroLab Entertainment</p>
            </div>
          </div>
          <nav className="flex gap-8 text-sm text-muted" aria-label="Footer navigation">
            <Link href="/tenant-demo/beats" className="hover:text-text transition-colors">Beats</Link>
            <Link href="/tenant-demo/services" className="hover:text-text transition-colors">Services</Link>
            <Link href="/tenant-demo/contact" className="hover:text-text transition-colors">Contact</Link>
          </nav>
          <p className="text-xs text-muted">© 2026 Demo Studio. All rights reserved.</p>
        </div>
      </GlassFooter>

      <DemoLicenseModal
        beat={selectedBeat}
        onClose={() => setSelectedBeat(null)}
      />
    </TenantLayout>
  )
}

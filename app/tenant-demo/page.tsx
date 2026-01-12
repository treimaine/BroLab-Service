'use client'

import { TenantLayout, type NavItem } from '@/components/tenant'
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
import { Headphones, Mail, Music, Play, Star, Users } from 'lucide-react'
import { useState } from 'react'

export default function TenantDemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(35)
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)

  const navItems: NavItem[] = [
    { id: 'beats', icon: <Music className="w-5 h-5" />, label: 'Beats', href: '/tenant-demo', isActive: true },
    { id: 'services', icon: <Headphones className="w-5 h-5" />, label: 'Services', href: '#' },
    { id: 'contact', icon: <Mail className="w-5 h-5" />, label: 'Contact', href: '#' },
  ]

  const producerStats = [
    { text: '50+ Premium Beats' },
    { text: '1000+ Sales Worldwide' },
    { text: 'Grammy Nominated Producer' },
    { text: '24h Delivery Guarantee' },
  ]

  const featuredBeats = [
    { id: 1, title: 'MIDNIGHT DRIVE', bpm: 140, key: 'Am', tags: ['Trap', 'Dark'], price: 29 },
    { id: 2, title: 'NEON NIGHTS', bpm: 128, key: 'Fm', tags: ['Synthwave', 'Retro'], price: 35 },
    { id: 3, title: 'URBAN PULSE', bpm: 85, key: 'Gm', tags: ['Hip-Hop', 'Modern'], price: 25 },
  ]

  return (
    <TenantLayout 
      navItems={navItems} 
      workspaceName="DEMO STUDIO"
      showPlayerBar={true}
      playerBarProps={{
        trackTitle: 'MIDNIGHT DRIVE - Preview',
        isPlaying,
        onPlayPause: () => setIsPlaying(!isPlaying),
        progress,
        onSeek: setProgress,
        volume,
        onVolumeChange: setVolume,
        isMuted,
        onMuteToggle: () => setIsMuted(!isMuted),
      }}
    >
      {/* HERO SECTION - ELECTRI-X STYLE */}
      <section className="relative min-h-[80vh] overflow-hidden bg-[rgb(var(--bg))]">
        {/* Background Pattern - BEATS repeated */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 flex flex-col justify-center">
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.025] text-white leading-[0.85]">BEATS BEATS BEATS BEATS</div>
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.025] text-white leading-[0.85]" style={{ transform: 'translateX(-100px)' }}>BEATS BEATS BEATS BEATS</div>
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.025] text-white leading-[0.85]">BEATS BEATS BEATS BEATS</div>
            <div className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.025] text-white leading-[0.85]" style={{ transform: 'translateX(-100px)' }}>BEATS BEATS BEATS BEATS</div>
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
                <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">PRODUCER</span>
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
                  BEATS
                </OutlineStackTitle>
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                  <div className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-20" style={{ top: '35%' }} />
                  <div className="absolute w-full h-[1px] bg-white opacity-10" style={{ top: '65%' }} />
                </div>
              </div>

              <p className="text-lg text-muted max-w-md mb-8 text-center lg:text-left mx-auto lg:mx-0">Premium beats and professional mixing services. Crafting sounds that define the future of music.</p>

              <div className="flex flex-wrap gap-4 justify-center">
                <PillCTA variant="primary" size="lg" icon={Music}>Browse Beats</PillCTA>
                <PillCTA variant="secondary" size="lg" icon={Headphones}>Book Service</PillCTA>
              </div>

              {/* Edition Badge + Orb */}
              <div className="absolute bottom-8 left-0 z-30 flex items-end gap-4">
                <EditionBadge title="DEMO" subtitle="Studio" />
                <CyanOrb size={60} className="hidden sm:block" />
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <DribbbleStaggerItem className="lg:col-span-7">
                <DribbbleCard glow hoverLift padding="lg" className="h-full">
                  <div className="flex items-start gap-4">
                    <button className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" />
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
                          <span key={tag} className="px-2 py-1 text-xs bg-[rgba(var(--accent),0.1)] text-accent rounded-md">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-text">${featuredBeats[0].price}</span>
                        <PillCTA variant="primary" size="sm">License Now</PillCTA>
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
                        <button className="w-10 h-10 rounded-xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center hover:bg-[rgba(var(--accent),0.25)] transition-colors">
                          <Play className="w-4 h-4 text-accent ml-0.5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-text truncate">{beat.title}</h4>
                          <p className="text-xs text-muted">{beat.bpm} BPM • {beat.key}</p>
                        </div>
                        <span className="text-sm font-bold text-text">${beat.price}</span>
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
                      <Star className="w-7 h-7 text-accent" />
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
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 lg:px-8 py-20 bg-[rgb(var(--bg))]">
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
                <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">READY TO CREATE?</h2>
                <p className="text-muted text-sm mb-8 max-w-md mx-auto">Join thousands of artists who trust Demo Studio for their sound.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <PillCTA variant="primary" size="lg" icon={Music}>Browse All Beats</PillCTA>
                  <PillCTA variant="secondary" size="lg" icon={Users}>Contact Producer</PillCTA>
                </div>
              </div>
            </DribbbleCard>
          </DribbbleSectionEnter>
        </div>
      </section>
    </TenantLayout>
  )
}

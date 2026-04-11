'use client'

import { useWorkspace } from '@/components/tenant'
import {
  ConstellationDots,
  CyanOrb,
  DribbbleCard,
  DribbbleSectionEnter,
  DribbbleStaggerItem,
  EditionBadge,
  GlassFooter,
  MicroInfoModule,
  OrganicBlob,
  OutlineStackTitle,
  PillCTA,
  WavyLines
} from '@/platform/ui'
import { useAudioStore } from '@/stores/audio-store'
import { useQuery } from 'convex/react'
import { Headphones, Music, Play, Users } from 'lucide-react'
import Link from 'next/link'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'

/**
 * Tenant Storefront Home Page
 *
 * Main landing page for a provider's storefront.
 * Displays hero section, latest drops (real tracks), and featured services (real data).
 *
 * Requirements: 21.1 (storefront home with hero, latest drops, featured services, sticky player)
 */
export default function TenantHomePage() {
  const { workspace, isLoading, error } = useWorkspace()
  const play = useAudioStore((s) => s.play)
  const currentTrack = useAudioStore((s) => s.currentTrack)
  const isPlaying = useAudioStore((s) => s.isPlaying)
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause)

  // Fetch published tracks (latest 6 for home page)
  const tracks = useQuery(
    api.modules.beats.getPublishedTracks,
    workspace ? { workspaceId: workspace._id as Id<'workspaces'> } : 'skip'
  )

  // Fetch active services
  const services = useQuery(
    api.modules.services.getActiveServices,
    workspace ? { workspaceId: workspace._id as Id<'workspaces'> } : 'skip'
  )

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
  const latestTracks = tracks?.slice(0, 6) ?? []
  const featuredServices = services?.slice(0, 2) ?? []

  const stats = [
    { text: `${tracks?.length ?? 0}+ Premium Beats` },
    { text: `${services?.length ?? 0} Services Available` },
    { text: 'Professional Quality' },
    { text: '24h Delivery' },
  ]

  const handlePlay = (track: typeof latestTracks[number]) => {
    if (!track.previewUrl) return
    if (currentTrack?.id === track._id) {
      togglePlayPause()
      return
    }
    play({
      id: track._id,
      title: track.title,
      artistName: workspaceName,
      previewUrl: track.previewUrl,
      bpm: track.bpm,
      trackKey: track.key,
    })
  }

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] overflow-hidden bg-[rgb(var(--bg))]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 flex flex-col justify-center">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={`bg-row-${i}`}
                className="whitespace-nowrap text-[clamp(80px,15vw,180px)] font-black tracking-[0.15em] opacity-[0.06] text-white leading-[0.85]"
                style={i % 2 === 1 ? { transform: 'translateX(-100px)' } : undefined}
              >
                BEATS BEATS BEATS BEATS
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(var(--accent), 0.08) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <WavyLines className="right-0 top-0 w-[150px] h-full" />

        <div
          className="absolute right-[12%] top-0 bottom-0 w-px hidden lg:block"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgb(var(--accent)) 0px, rgb(var(--accent)) 4px, transparent 4px, transparent 14px)', opacity: 0.4 }}
          aria-hidden="true"
        />

        <ConstellationDots className="top-[15%] right-[18%] w-[120px] h-[120px] hidden lg:block" />

        <div className="relative z-10 container mx-auto px-4 lg:px-8 min-h-[80vh] flex items-center">
          <div className="w-full">
            <div className="relative min-h-[60vh] flex flex-col justify-center">
              {/* Content */}
              <div className="relative z-20 mb-6">
                <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">{workspaceType}</span>
                <OutlineStackTitle
                  size="hero"
                  layers={3}
                  offset={2}
                  className="text-[clamp(36px,10vw,120px)] font-black tracking-[0.05em] drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    textShadow: '0 0 60px rgba(0,255,255,0.3), 0 0 120px rgba(0,255,255,0.15)',
                  }}
                >
                  {workspaceName.toUpperCase()}
                </OutlineStackTitle>
              </div>

              <p className="text-lg text-muted max-w-md mb-8 text-center lg:text-left mx-auto lg:mx-0">
                Premium beats and professional services. Crafting sounds that define the future of music.
              </p>

              <div className="flex flex-wrap gap-4 justify-center mb-20">
                <Link href={`/${workspace.slug}/beats`}>
                  <PillCTA variant="primary" size="lg" icon={Music}>Browse Beats</PillCTA>
                </Link>
                <Link href={`/${workspace.slug}/services`}>
                  <PillCTA variant="secondary" size="lg" icon={Headphones}>View Services</PillCTA>
                </Link>
              </div>

              {/* Edition Badge + Orb — absolute like tenant-demo */}
              <div className="absolute bottom-8 left-0 z-30 flex items-end gap-4">
                <EditionBadge title={workspaceName} subtitle="Studio" />
                <CyanOrb size={60} className="hidden sm:block" />
              </div>

              {/* Decorative absolute elements — outside constrained width */}
              <div className="absolute top-1/2 -translate-y-1/2 right-0 lg:right-[5%] hidden lg:block z-30">
                <MicroInfoModule items={stats} />
              </div>

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

      {/* LATEST DROPS */}
      <section className="px-4 lg:px-8 py-20 bg-[rgb(var(--bg))]">
        <div className="container mx-auto">
          <DribbbleSectionEnter>
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">01</span>
              <h2 className="text-sm font-bold text-muted uppercase tracking-widest">LATEST DROPS</h2>
              <div className="h-px w-24 bg-[rgba(var(--border),0.5)]" />
            </div>
          </DribbbleSectionEnter>

          {latestTracks.length === 0 ? (
            <div className="text-center py-16">
              <Music className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">No beats published yet. Check back soon.</p>
            </div>
          ) : (
            <DribbbleSectionEnter stagger>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {latestTracks.map((track) => {
                  const isCurrentTrack = currentTrack?.id === track._id
                  const isTrackPlaying = isCurrentTrack && isPlaying
                  return (
                    <DribbbleStaggerItem key={track._id}>
                      <DribbbleCard hoverLift padding="lg" className="h-full">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => handlePlay(track)}
                            disabled={!track.previewUrl}
                            className="w-12 h-12 rounded-xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center shrink-0 hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={isTrackPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                          >
                            {isTrackPlaying ? (
                              <span className="w-4 h-4 flex gap-1">
                                <span className="w-1 h-4 bg-white rounded-full" />
                                <span className="w-1 h-4 bg-white rounded-full" />
                              </span>
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-text mb-1 truncate">{track.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted mb-3">
                              {track.bpm && <span>{track.bpm} BPM</span>}
                              {track.bpm && track.key && <span>•</span>}
                              {track.key && <span>{track.key}</span>}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-text">${track.priceUsdByTier.basic}</span>
                              <Link href={`/${workspace.slug}/beats/${track._id}`}>
                                <PillCTA variant="ghost" size="sm">View</PillCTA>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </DribbbleCard>
                    </DribbbleStaggerItem>
                  )
                })}
              </div>
            </DribbbleSectionEnter>
          )}

          {latestTracks.length > 0 && (
            <div className="text-center mt-12">
              <Link href={`/${workspace.slug}/beats`}>
                <PillCTA variant="primary" size="lg" icon={Music}>View All Beats</PillCTA>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="px-4 lg:px-8 py-20 bg-[rgb(var(--bg))]">
        <div className="container mx-auto">
          <DribbbleSectionEnter>
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">02</span>
              <h2 className="text-sm font-bold text-muted uppercase tracking-widest">PROFESSIONAL SERVICES</h2>
              <div className="h-px w-24 bg-[rgba(var(--border),0.5)]" />
            </div>
          </DribbbleSectionEnter>

          {featuredServices.length === 0 ? (
            <div className="text-center py-16">
              <Headphones className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">No services available yet.</p>
            </div>
          ) : (
            <DribbbleSectionEnter stagger>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredServices.map((service, index) => (
                  <DribbbleStaggerItem key={service._id}>
                    <DribbbleCard glow={index === 0} hoverLift padding="lg" className="h-full">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                          index === 0
                            ? 'bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))]'
                            : 'bg-[rgba(var(--accent),0.15)]'
                        }`}>
                          <Headphones className={`w-7 h-7 ${index === 0 ? 'text-white' : 'text-accent'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-text mb-2">{service.title.toUpperCase()}</h3>
                          <p className="text-muted text-sm mb-4 line-clamp-2">{service.description}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-bold text-text">From ${service.priceUSD}</span>
                            <Link href={`/${workspace.slug}/services/${service._id}`}>
                              <PillCTA variant="ghost" size="sm">Learn More</PillCTA>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </DribbbleCard>
                  </DribbbleStaggerItem>
                ))}
              </div>
            </DribbbleSectionEnter>
          )}

          {featuredServices.length > 0 && (
            <div className="text-center mt-12">
              <Link href={`/${workspace.slug}/services`}>
                <PillCTA variant="primary" size="lg" icon={Headphones}>View All Services</PillCTA>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* GET STARTED CTA */}
      <section className="px-4 lg:px-8 py-20 bg-[rgb(var(--bg))]">
        <div className="container mx-auto max-w-4xl">
          <DribbbleSectionEnter>
            <DribbbleCard glow padding="lg" className="text-center relative overflow-hidden">
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(var(--accent),0.15) 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(var(--accent-2),0.15) 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              <div className="relative z-10">
                <span className="text-xs font-bold text-accent uppercase tracking-widest mb-4 block">GET STARTED</span>
                <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">READY TO CREATE?</h2>
                <p className="text-muted text-sm mb-8 max-w-md mx-auto">
                  Browse beats, book services, and bring your vision to life with {workspaceName}.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href={`/${workspace.slug}/beats`}>
                    <PillCTA variant="primary" size="lg" icon={Music}>Browse All Beats</PillCTA>
                  </Link>
                  <Link href={`/${workspace.slug}/contact`}>
                    <PillCTA variant="secondary" size="lg" icon={Users}>Contact Producer</PillCTA>
                  </Link>
                </div>
              </div>
            </DribbbleCard>
          </DribbbleSectionEnter>
        </div>
      </section>

      {/* FOOTER */}
      <GlassFooter className="py-12 px-4 lg:px-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center text-white font-bold select-none">
              {workspaceName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-text">{workspaceName}</p>
              <p className="text-xs text-muted">Powered by BroLab Entertainment</p>
            </div>
          </div>
          <nav className="flex gap-8 text-sm text-muted" aria-label="Footer navigation">
            <Link href={`/${workspace.slug}`} className="hover:text-text transition-colors cursor-pointer">Beats</Link>
            <Link href={`/${workspace.slug}/services`} className="hover:text-text transition-colors cursor-pointer">Services</Link>
            <Link href={`/${workspace.slug}/contact`} className="hover:text-text transition-colors cursor-pointer">Contact</Link>
          </nav>
          <p className="text-xs text-muted">© {new Date().getFullYear()} {workspaceName}. All rights reserved.</p>
        </div>
      </GlassFooter>
    </>
  )
}

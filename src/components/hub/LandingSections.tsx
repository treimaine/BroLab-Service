'use client'

import {
    DribbbleCard,
    DribbbleSectionEnter,
    DribbbleStaggerItem,
    MicroInfoModule,
    PillCTA,
    RoleCTACard,
    TrustChip
} from '@/platform/ui'
import {
    Award,
    CreditCard,
    DollarSign,
    Headphones,
    Music,
    Shield,
    Sparkles,
    Users,
    Zap,
    type LucideIcon
} from 'lucide-react'
import Link from 'next/link'

const PLATFORM_INFO: Array<{ text: string }> = [
  { text: 'Powered by Clerk Billing (subscriptions)' },
  { text: 'One-time payments via Stripe' },
  { text: 'Licenses generated automatically' },
  { text: 'Sell beats + services in one storefront' },
]

const SectionHeader = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-center gap-4 mb-12">
    <span className="text-xs font-bold text-accent uppercase tracking-widest">{number}</span>
    <h2 className="text-sm font-bold text-muted uppercase tracking-widest">{title}</h2>
    <div className="h-px w-24 bg-[rgba(var(--border),0.5)]" />
  </div>
)

const IconCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: LucideIcon
  title: string
  description: string 
}) => (
  <DribbbleCard hoverLift padding="md">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-text uppercase">{title}</h4>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </div>
  </DribbbleCard>
)

export function MobileInfoSection() {
  return (
    <section className="px-4 py-12 lg:hidden bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-md">
        <MicroInfoModule items={PLATFORM_INFO} className="mx-auto" />
      </div>
    </section>
  )
}

export function TrustRow() {
  return (
    <section className="px-4 py-12 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <TrustChip icon={CreditCard} label="Stripe-ready payments" />
          <TrustChip icon={Shield} label="Clerk auth & billing" />
          <TrustChip icon={Zap} label="Instant license delivery" />
          <TrustChip icon={DollarSign} label="Creator-first pricing" />
          <TrustChip icon={Award} label="No marketplace noise" />
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section className="px-4 py-16 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DribbbleStaggerItem>
              <RoleCTACard
                icon={Music}
                title="Start as Producer"
                description="Sell beats & packs"
                href="/sign-up?role=producer"
                variant="primary"
              />
            </DribbbleStaggerItem>
            <DribbbleStaggerItem>
              <RoleCTACard
                icon={Headphones}
                title="Start as Engineer"
                description="Book sessions & services"
                href="/sign-up?role=engineer"
                variant="secondary"
              />
            </DribbbleStaggerItem>
            <DribbbleStaggerItem>
              <RoleCTACard
                icon={Users}
                title="I'm an Artist"
                description="Find beats & hire pros"
                href="/sign-up?role=artist"
                variant="ghost"
              />
            </DribbbleStaggerItem>
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section className="px-4 py-24 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter>
          <SectionHeader number="01" title="WHAT WE OFFER" />
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
                <IconCard icon={Headphones} title="OFFER SERVICES" description="Mixing, mastering, vocal tuning" />
              </DribbbleStaggerItem>
              <DribbbleStaggerItem>
                <IconCard icon={Sparkles} title="AUTO LICENSES" description="PDF generated for every sale" />
              </DribbbleStaggerItem>
              <DribbbleStaggerItem>
                <IconCard icon={Users} title="DIRECT PAYMENTS" description="Straight to your Stripe" />
              </DribbbleStaggerItem>
            </div>
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  return (
    <section className="px-4 py-24 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter>
          <SectionHeader number="02" title="HOW IT WORKS" />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DribbbleStaggerItem>
              <DribbbleCard hoverLift padding="lg" className="h-full relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[rgb(var(--accent))] flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-[rgb(var(--bg))]">01</span>
                </div>
                <div className="pt-4">
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-3 uppercase tracking-wide">CREATE YOUR STOREFRONT</h3>
                  <p className="text-muted text-sm leading-relaxed">Sign up, pick your slug, and customize your brand. Your storefront is live in minutes.</p>
                </div>
              </DribbbleCard>
            </DribbbleStaggerItem>

            <DribbbleStaggerItem>
              <DribbbleCard hoverLift padding="lg" className="h-full relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[rgb(var(--accent))] flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-[rgb(var(--bg))]">02</span>
                </div>
                <div className="pt-4">
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center mb-4">
                    <Music className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-3 uppercase tracking-wide">UPLOAD BEATS / SERVICES</h3>
                  <p className="text-muted text-sm leading-relaxed">Add your beats with tiered licensing, or list your mixing and mastering services.</p>
                </div>
              </DribbbleCard>
            </DribbbleStaggerItem>

            <DribbbleStaggerItem>
              <DribbbleCard hoverLift padding="lg" className="h-full relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[rgb(var(--accent))] flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-[rgb(var(--bg))]">03</span>
                </div>
                <div className="pt-4">
                  <div className="w-14 h-14 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center mb-4">
                    <DollarSign className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-3 uppercase tracking-wide">GET PAID + DELIVER LICENSES</h3>
                  <p className="text-muted text-sm leading-relaxed">Artists pay directly to your Stripe. Licenses are generated and delivered automatically.</p>
                </div>
              </DribbbleCard>
            </DribbbleStaggerItem>
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function ProductPreviewSection() {
  return (
    <section className="px-4 py-24 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter>
          <SectionHeader number="03" title="SEE IT IN ACTION" />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter>
          <DribbbleCard glow padding="lg" className="relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-text uppercase tracking-wide">YOUR STOREFRONT, YOUR BRAND</h3>
                <p className="text-muted text-sm leading-relaxed">Every creator gets a fully customizable storefront. Upload beats, list services, and let artists browse your catalog with a premium audio player experience.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/tenant-demo">
                    <PillCTA variant="primary" size="lg" className="group">
                      <span>View Demo Storefront</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </PillCTA>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <DribbbleCard padding="none" hoverLift={false} className="overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[rgba(var(--bg),0.8)]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-[rgba(var(--bg),0.6)] rounded-md px-3 py-1.5 text-xs text-muted text-center">
                        yourname.brolabentertainment.com
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4 bg-[rgba(var(--bg-2),0.3)]">
                    <div className="flex items-center justify-between">
                      <div className="w-24 h-4 rounded bg-[rgba(var(--text),0.1)]" />
                      <div className="flex gap-2">
                        <div className="w-16 h-6 rounded-full bg-[rgba(var(--accent),0.2)]" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 4 }, (_, i) => (
                        <div key={`mock-beat-${i}`} className="rounded-lg bg-[rgba(var(--card),0.5)] p-3 space-y-2">
                          <div className="aspect-square rounded-md bg-gradient-to-br from-[rgba(var(--accent),0.3)] to-[rgba(var(--accent-2),0.3)] flex items-center justify-center">
                            <Music className="w-6 h-6 text-accent opacity-50" />
                          </div>
                          <div className="space-y-1">
                            <div className="w-full h-2.5 rounded bg-[rgba(var(--text),0.15)]" />
                            <div className="w-2/3 h-2 rounded bg-[rgba(var(--text),0.08)]" />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(var(--accent),0.1)]">
                      <div className="w-8 h-8 rounded-full bg-[rgba(var(--accent),0.3)] flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[6px] border-l-accent border-y-[4px] border-y-transparent ml-0.5" />
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-[rgba(var(--text),0.1)]">
                        <div className="w-1/3 h-full rounded-full bg-accent" />
                      </div>
                      <div className="text-[10px] text-muted">1:24 / 3:45</div>
                    </div>
                  </div>
                </DribbbleCard>

                <div 
                  className="absolute -inset-4 -z-10 rounded-2xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle at center, rgba(var(--accent),0.15) 0%, transparent 70%)' }}
                />
              </div>
            </div>
          </DribbbleCard>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function FinalCTASection() {
  return (
    <section className="px-4 py-24 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter>
          <DribbbleCard glow padding="lg" className="text-center relative overflow-hidden">
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

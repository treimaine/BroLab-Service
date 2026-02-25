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
  Check,
  CreditCard,
  DollarSign,
  Headphones,
  Music,
  Quote,
  Shield,
  Sparkles,
  Users,
  X,
  Zap,
  type LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const PLATFORM_INFO: Array<{ text: string }> = [
  { text: 'Keep 100% of your revenue' },
  { text: 'Instant payouts to your bank' },
  { text: 'Licenses sent automatically' },
  { text: 'Your storefront, your brand' },
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
    <section className="px-4 py-8 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <TrustChip icon={CreditCard} label="Get paid instantly" />
          <TrustChip icon={Shield} label="Secure subscriptions" />
          <TrustChip icon={Zap} label="Auto PDF licenses" />
          <TrustChip icon={DollarSign} label="0% commission" />
          <TrustChip icon={Award} label="Your brand, your store" />
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section className="px-4 py-10 bg-[rgb(var(--bg))]">
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
                variant="primary"
              />
            </DribbbleStaggerItem>
            <DribbbleStaggerItem>
              <RoleCTACard
                icon={Users}
                title="I'm an Artist"
                description="Find beats & hire pros"
                href="/sign-up?role=artist"
                variant="primary"
              />
            </DribbbleStaggerItem>
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function StatsSection() {
  const stats = [
    { value: '0%', label: 'Commission on sales' },
    { value: '$0.30', label: 'Per transaction (Stripe only)' },
    { value: '3', label: 'License tiers per beat' },
    { value: '∞', label: 'Tracks on PRO plan' },
  ]

  return (
    <section className="px-4 py-10 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <DribbbleCard key={stat.label} padding="md" className="text-center">
              <div className="text-3xl md:text-4xl font-black text-accent mb-1">{stat.value}</div>
              <div className="text-xs text-muted uppercase tracking-wide">{stat.label}</div>
            </DribbbleCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section className="px-4 py-14 bg-[rgb(var(--bg))]">
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
    <section className="px-4 py-14 bg-[rgb(var(--bg))]">
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
    <section className="px-4 py-14 bg-[rgb(var(--bg))]">
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
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-[rgba(var(--bg),0.95)]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                      <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-[rgba(var(--bg),0.8)] border border-border/30 rounded-md px-3 py-1 text-xs text-muted text-center">
                        drakebeats.brolabentertainment.com
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 bg-[rgba(var(--bg-2),0.4)]">
                    {/* Storefront header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-text uppercase tracking-widest">DrakeBeats</p>
                        <p className="text-[10px] text-muted">Producer · Los Angeles</p>
                      </div>
                      <div className="text-[10px] font-bold text-accent uppercase tracking-wider border border-accent/30 rounded-full px-2 py-0.5">
                        247 beats
                      </div>
                    </div>

                    {/* Beat cards grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { name: 'Dark Trap 808', genre: 'Trap', price: '$29.99', color: 'from-purple-500/40 to-cyan-500/20' },
                        { name: 'Summer Vibes', genre: 'R&B', price: '$24.99', color: 'from-orange-500/40 to-pink-500/20' },
                        { name: 'Drill Season', genre: 'Drill', price: '$34.99', color: 'from-cyan-500/40 to-blue-500/20' },
                        { name: 'Melodic Wave', genre: 'Pop', price: '$19.99', color: 'from-green-500/40 to-teal-500/20' },
                      ].map((beat) => (
                        <div key={beat.name} className="rounded-lg bg-[rgba(var(--card),0.6)] border border-border/20 p-2.5 space-y-2 cursor-pointer hover:border-accent/40 transition-colors">
                          <div className={`aspect-square rounded-md bg-gradient-to-br ${beat.color} flex items-center justify-center`}>
                            <div className="w-0 h-0 border-l-[8px] border-l-white/70 border-y-[5px] border-y-transparent ml-0.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-text truncate">{beat.name}</p>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-[9px] text-muted">{beat.genre}</span>
                              <span className="text-[10px] font-bold text-accent">{beat.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Player bar */}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[rgba(var(--accent),0.12)] border border-[rgba(var(--accent),0.2)]">
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <div className="w-0 h-0 border-l-[6px] border-l-[rgb(var(--bg))] border-y-[4px] border-y-transparent ml-0.5" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-[10px] font-bold text-text truncate">Dark Trap 808</p>
                        <div className="h-1 rounded-full bg-[rgba(var(--text),0.1)]">
                          <div className="w-2/5 h-full rounded-full bg-accent" />
                        </div>
                      </div>
                      <div className="text-[10px] text-muted flex-shrink-0">0:47 / 1:30</div>
                    </div>
                  </div>
                </DribbbleCard>

                <div
                  className="absolute -inset-4 -z-10 rounded-2xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle at center, rgba(var(--accent),0.12) 0%, transparent 70%)' }}
                />
              </div>
            </div>
          </DribbbleCard>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: 'BASIC',
      monthly: 9.99,
      annual: 5,
      annualTotal: 59.99,
      annualDiscount: '50%',
      description: 'Perfect to launch your first store',
      features: [
        '25 tracks published',
        '1 GB storage',
        'Free subdomain',
        'Auto PDF licenses',
        'Direct Stripe payouts',
      ],
      cta: 'Start Free',
      href: '/sign-up?plan=basic',
      popular: false,
    },
    {
      name: 'PRO',
      monthly: 29.99,
      annual: 9,
      annualTotal: 107.99,
      annualDiscount: '70%',
      description: 'For serious creators scaling their brand',
      features: [
        'Unlimited tracks',
        '50 GB storage',
        '2 custom domains',
        'Priority support',
        'Advanced analytics',
      ],
      cta: 'Go Pro',
      href: '/sign-up?plan=pro',
      popular: true,
    },
  ]

  return (
    <section className="px-4 py-14 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter>
          <SectionHeader number="04" title="PRICING" />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">Simple, transparent pricing</h2>
            <p className="text-muted text-sm mb-6">No hidden fees. No commission on sales. Cancel anytime.</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 bg-[rgba(var(--bg-2),0.6)] border border-border/30 rounded-full p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  annual ? 'text-muted hover:text-text' : 'bg-[rgb(var(--accent))] text-[rgb(var(--bg))]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
                  annual ? 'bg-[rgb(var(--accent))] text-[rgb(var(--bg))]' : 'text-muted hover:text-text'
                }`}
              >
                Annual{' '}
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${annual ? 'bg-[rgb(var(--bg))]/30 text-[rgb(var(--bg))]' : 'bg-[rgba(var(--accent),0.15)] text-accent'}`}>
                  up to -70%
                </span>
              </button>
            </div>
          </div>
        </DribbbleSectionEnter>

        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <DribbbleStaggerItem key={plan.name}>
                <DribbbleCard
                  glow={plan.popular}
                  hoverLift
                  padding="lg"
                  className={`h-full relative ${plan.popular ? 'border border-accent/40' : 'border border-border/60'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[rgb(var(--accent))] text-[rgb(var(--bg))] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">{plan.name}</p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-4xl font-black text-text">
                        ${annual ? plan.annual : plan.monthly}
                      </span>
                      <span className="text-muted text-sm mb-1">/mo</span>
                    </div>
                    {annual && (
                      <p className="text-xs text-accent mb-1">
                        ${plan.annualTotal}/yr — save {plan.annualDiscount}
                      </p>
                    )}
                    <p className="text-muted text-xs mb-6">{plan.description}</p>

                    <ul className="space-y-2.5 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-text">
                          <Check className="w-4 h-4 text-accent flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link href={plan.href} className="block w-full">
                      <PillCTA variant="primary" size="md" className={`w-full justify-center ${plan.popular ? '' : 'bg-none bg-transparent border border-[rgba(var(--accent),0.4)] text-accent hover:bg-[rgba(var(--accent),0.08)] shadow-none hover:shadow-none'}`}>
                        {plan.cta}
                      </PillCTA>
                    </Link>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>
            ))}
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function ComparisonSection() {
  const criteria = [
    { label: 'Commission on sales', brolab: '0%', beatstars: '10–30%', airbit: '15–30%', brolabWins: true },
    { label: 'Custom storefront', brolab: 'Yes', beatstars: 'Limited', airbit: 'Limited', brolabWins: true },
    { label: 'Direct payouts', brolab: 'Stripe direct', beatstars: 'Via platform', airbit: 'Via platform', brolabWins: true },
    { label: 'Services + Beats', brolab: 'Yes', beatstars: 'Beats only', airbit: 'Beats only', brolabWins: true },
    { label: 'Auto PDF licenses', brolab: 'Yes', beatstars: 'Templates', airbit: 'Templates', brolabWins: true },
  ]

  return (
    <section className="px-4 py-14 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter>
          <SectionHeader number="05" title="WHY BROLAB" />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">BroLab vs the competition</h2>
            <p className="text-muted text-sm">See why creators are switching from marketplace platforms.</p>
          </div>
        </DribbbleSectionEnter>

        <DribbbleSectionEnter>
          <DribbbleCard padding="none" className="overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 text-[10px] font-black uppercase tracking-widest border-b border-border/30">
              <div className="p-4 text-muted col-span-1">Criteria</div>
              <div className="p-4 text-accent text-center bg-[rgba(var(--accent),0.06)]">BroLab</div>
              <div className="p-4 text-muted text-center">BeatStars</div>
              <div className="p-4 text-muted text-center">Airbit</div>
            </div>

            {criteria.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 text-sm border-b border-border/20 last:border-0 ${i % 2 === 0 ? '' : 'bg-[rgba(var(--bg-2),0.3)]'}`}
              >
                <div className="p-4 text-muted text-xs">{row.label}</div>
                <div className="p-4 text-center bg-[rgba(var(--accent),0.04)] flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="text-xs font-bold text-accent">{row.brolab}</span>
                </div>
                <div className="p-4 text-center flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-muted/50 flex-shrink-0" />
                  <span className="text-xs text-muted">{row.beatstars}</span>
                </div>
                <div className="p-4 text-center flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-muted/50 flex-shrink-0" />
                  <span className="text-xs text-muted">{row.airbit}</span>
                </div>
              </div>
            ))}
          </DribbbleCard>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function TestimonialSection() {
  const testimonials = [
    {
      quote: "BroLab changed everything for me. I launched my store in 10 minutes and sold my first exclusive beat the next day with 0% commission.",
      author: "Alex Rivers",
      role: "Multi-Platinum Producer",
      avatar: "AR"
    },
    {
      quote: "The automated licensing and Stripe integration are seamless. I can focus on mixing while the platform handles the business.",
      author: "Sarah Chen",
      role: "Mixing Engineer",
      avatar: "SC"
    },
    {
      quote: "As an artist, I love the clean interface and the high-quality previews. Finding the right beat has never been this professional.",
      author: "Marcus J",
      role: "Independent Artist",
      avatar: "MJ"
    }
  ]

  return (
    <section className="px-4 py-14 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter>
          <SectionHeader number="06" title="HEAR FROM CREATORS" />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <DribbbleStaggerItem key={t.author}>
                <DribbbleCard hoverLift padding="lg" className="h-full flex flex-col justify-between">
                  <div>
                    <Quote className="w-8 h-8 text-accent opacity-20 mb-4" />
                    <p className="text-sm text-text leading-relaxed italic mb-6">"{t.quote}"</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent-2/20 flex items-center justify-center text-xs font-bold text-accent">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text uppercase">{t.author}</p>
                      <p className="text-[10px] text-muted">{t.role}</p>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>
            ))}
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function FinalCTASection() {
  return (
    <section className="px-4 py-14 bg-[rgb(var(--bg))]">
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
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-3">Launch your beat store in minutes.</h2>
              <p className="text-accent font-bold text-sm mb-2">Keep 100% of your revenue.</p>
              <p className="text-muted text-sm mb-2">Join creators who are already growing their brand with BroLab.</p>
              <p className="text-muted text-xs mb-8">No credit card required. Setup in 5 minutes. Cancel anytime.</p>
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

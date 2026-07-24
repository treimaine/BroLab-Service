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
  BarChart3,
  Check,
  CreditCard,
  DollarSign,
  Globe,
  Headphones,
  Music,
  Shield,
  Sparkles,
  Users,
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

/**
 * Section surfaces alternate so the page reads as distinct bands.
 * Every section previously used `--bg`, which made ~6900px of page with no
 * vertical rhythm and no boundary between one idea and the next.
 */
const SURFACE_BASE = 'bg-[rgb(var(--bg))]'
const SURFACE_ALT = 'bg-[rgb(var(--bg-2))]'

const SectionHeader = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-center gap-4 mb-12">
    <span className="text-xs font-bold text-accent uppercase tracking-widest">{number}</span>
    <h2 className="text-sm font-bold text-muted uppercase tracking-widest">{title}</h2>
    <div className="h-px w-24 bg-[rgb(var(--border)/0.5)]" />
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
  <DribbbleCard hoverLift padding="md" className="h-full">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-text">{title}</h4>
        <p className="text-xs text-muted leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  </DribbbleCard>
)

export function MobileInfoSection() {
  return (
    <section className={`px-4 py-12 lg:hidden ${SURFACE_BASE}`}>
      <div className="container mx-auto max-w-md">
        <MicroInfoModule items={PLATFORM_INFO} className="mx-auto" />
      </div>
    </section>
  )
}

export function TrustRow() {
  return (
    <section className={`px-4 py-8 ${SURFACE_BASE}`}>
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

/**
 * Two paths, not three.
 *
 * Producers and engineers are the subscribing segments. An artist buying a beat
 * generates no revenue for BroLab (0% commission), yet used to occupy a third of
 * the above-the-fold CTA area with an identical filled button — three primaries
 * means no primary. Artists now get a tertiary entry point that still feeds the
 * demand side.
 */
export function CTASection() {
  return (
    <section className={`px-4 py-12 ${SURFACE_BASE}`}>
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DribbbleStaggerItem>
              <RoleCTACard
                icon={Music}
                title="Start as Producer"
                description="Sell beats with tiered licensing, from your own storefront."
                href="/sign-up?role=producer"
                variant="primary"
              />
            </DribbbleStaggerItem>
            <DribbbleStaggerItem>
              <RoleCTACard
                icon={Headphones}
                title="Start as Engineer"
                description="Take mixing and mastering bookings with payment built in."
                href="/sign-up?role=engineer"
                variant="primary"
              />
            </DribbbleStaggerItem>
          </div>
        </DribbbleSectionEnter>

        <DribbbleSectionEnter>
          <p className="text-center text-sm text-muted mt-8">
            <Users className="w-4 h-4 inline-block mr-1.5 -mt-0.5" aria-hidden="true" />
            Looking for beats or a mixing engineer?{' '}
            <Link
              href="/sign-up?role=artist"
              className="text-accent font-medium underline underline-offset-4 hover:text-accent-2 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Browse as an artist
            </Link>
          </p>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

/**
 * One capability section.
 *
 * This absorbs the former FeaturesSection, ComparisonSection and
 * TestimonialSection, which all rendered the same IconCard with overlapping
 * copy at three different points in the page and read as padding.
 */
const CAPABILITIES: ReadonlyArray<{ icon: LucideIcon; title: string; description: string }> = [
  { icon: Headphones, title: 'Offer services', description: 'Mixing, mastering, vocal tuning and custom production, booked from the same page.' },
  { icon: Sparkles, title: 'Automatic licenses', description: 'A PDF license is generated for every sale, with the terms snapshotted at purchase.' },
  { icon: CreditCard, title: 'Direct payouts', description: 'Buyers pay into your own Stripe account. No middleman holding your money.' },
  { icon: Globe, title: 'Your brand', description: 'A free subdomain on BASIC, up to two custom domains on PRO.' },
  { icon: BarChart3, title: 'Know what sells', description: 'Track views, searches and earnings so you can price and promote deliberately.' },
]

export function FeaturesSection() {
  return (
    <section className={`px-4 py-14 ${SURFACE_BASE}`}>
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter>
          <SectionHeader number="01" title="WHAT YOU GET" />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <DribbbleStaggerItem className="lg:col-span-5">
              <DribbbleCard glow hoverLift padding="lg" className="h-full flex flex-col justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center mb-5">
                  <Music className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Sell your beats</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Upload once and sell across three license tiers — Basic, Premium and
                  Unlimited. A 30-second preview is generated automatically; the full files
                  stay locked until someone pays.
                </p>
              </DribbbleCard>
            </DribbbleStaggerItem>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
              {CAPABILITIES.map((item) => (
                <DribbbleStaggerItem key={item.title}>
                  <IconCard icon={item.icon} title={item.title} description={item.description} />
                </DribbbleStaggerItem>
              ))}
            </div>
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  return (
    <section className={`px-4 py-14 ${SURFACE_ALT}`}>
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
                  <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center mb-4">
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
                  <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center mb-4">
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
                  <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center mb-4">
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
        'Automatic PDF licenses',
        'Direct Stripe payouts',
      ],
      cta: 'Go Pro',
      href: '/sign-up?plan=pro',
      popular: true,
    },
  ]

  return (
    <section className={`px-4 py-14 ${SURFACE_ALT}`}>
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter>
          <SectionHeader number="04" title="PRICING" />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">Simple, transparent pricing</h2>
            <p className="text-muted text-sm mb-6">No hidden fees. No commission on sales. Cancel anytime.</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 bg-[rgb(var(--bg-2)/0.6)] border border-border/30 rounded-full p-1">
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
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${annual ? 'bg-[rgb(var(--bg))]/30 text-[rgb(var(--bg))]' : 'bg-[rgb(var(--accent)/0.15)] text-accent'}`}>
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
                          <Check className="w-4 h-4 text-accent shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link href={plan.href} className="block w-full">
                      <PillCTA variant="primary" size="md" className={`w-full justify-center ${plan.popular ? '' : 'bg-none bg-transparent border border-[rgb(var(--accent)/0.4)] text-accent hover:bg-[rgb(var(--accent)/0.08)] shadow-none hover:shadow-none'}`}>
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

/**
 * Replaces the former "TestimonialSection", which contained no testimonials and
 * simply restated HowItWorksSection.
 *
 * BroLab has no citable beta creators yet, so this section handles the real
 * objections a creator with an existing catalogue raises instead of inventing
 * social proof.
 */
const OBJECTIONS: ReadonlyArray<{ icon: LucideIcon; question: string; answer: string }> = [
  {
    icon: Shield,
    question: 'What happens to my catalog if I leave?',
    answer:
      'Your audio files and your customer list are yours. Nothing is locked to BroLab, and cancelling never deletes the licenses your buyers already hold.',
  },
  {
    icon: DollarSign,
    question: 'When do I actually get the money?',
    answer:
      'Buyers pay into your own Stripe account, so payouts follow your Stripe schedule — typically two days. BroLab is never in the middle of the transaction.',
  },
  {
    icon: Zap,
    question: 'How long does setup really take?',
    answer:
      'Connect Stripe, pick your subdomain, upload a first track. The storefront is live immediately — no review queue and no approval step.',
  },
  {
    icon: Award,
    question: 'Why is there no commission?',
    answer:
      'The subscription is the business model. We make the same money whether you sell one beat or a thousand, so there is nothing to gain from taking a cut.',
  },
]

export function ObjectionsSection() {
  return (
    <section className={`px-4 py-14 ${SURFACE_BASE}`}>
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter>
          <SectionHeader number="05" title="STRAIGHT ANSWERS" />
        </DribbbleSectionEnter>

        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {OBJECTIONS.map((item) => (
              <DribbbleStaggerItem key={item.question}>
                <DribbbleCard hoverLift padding="lg" className="h-full">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent)/0.15)] flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-base font-bold text-text mb-2">{item.question}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.answer}</p>
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
    <section className={`px-4 py-14 ${SURFACE_BASE}`}>
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter>
          <DribbbleCard glow padding="lg" className="text-center relative overflow-hidden">
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
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-3">Launch your beat store in minutes.</h2>
              <p className="text-accent font-bold text-sm mb-2">Keep 100% of your revenue.</p>
              <p className="text-muted text-sm mb-2">Be among the first creators to shape BroLab with us.</p>
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

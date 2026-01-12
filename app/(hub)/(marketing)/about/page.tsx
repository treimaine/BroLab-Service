'use client'

import {
    DribbbleCard,
    DribbbleSectionEnter,
    DribbbleStaggerItem,
    MarketingPageShell,
    PillCTA,
    SectionHeader,
} from '@/platform/ui'
import {
    ArrowRight,
    Globe,
    Headphones,
    Music,
    Sparkles,
    Users,
    Wallet,
    Zap,
} from 'lucide-react'
import Link from 'next/link'

/**
 * About Page - ELECTRI-X Design Language
 * 
 * Mission statement, problem/solution, what BroLab enables,
 * and optional roadmap section.
 * 
 * Requirements: 19 (Marketing Pages)
 */

// ============ Data ============

const WHAT_WE_ENABLE = [
  {
    icon: Music,
    title: 'Sell Your Beats',
    description: 'Upload tracks, generate 30-second previews, and sell with automatic license PDF generation.',
  },
  {
    icon: Headphones,
    title: 'Offer Services',
    description: 'List mixing, mastering, and production services. Artists book directly through your storefront.',
  },
  {
    icon: Wallet,
    title: 'Direct Payouts',
    description: 'Payments go straight to your Stripe account. Zero platform fees on your sales.',
  },
]

const ROADMAP_ITEMS = [
  {
    status: 'live',
    title: 'Beat Marketplace',
    description: 'Upload, preview, and sell beats with license tiers',
  },
  {
    status: 'live',
    title: 'Service Bookings',
    description: 'List and sell mixing, mastering, and production services',
  },
  {
    status: 'coming',
    title: 'Advanced Analytics',
    description: 'Track plays, conversions, and revenue insights',
  },
  {
    status: 'coming',
    title: 'Collaboration Tools',
    description: 'Work with artists directly through your storefront',
  },
]

// ============ Components ============

function ProblemSolutionSection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <DribbbleSectionEnter>
          <SectionHeader 
            title="THE PROBLEM" 
            subtitle="Why we built BroLab"
          />
        </DribbbleSectionEnter>
        
        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Problem */}
            <DribbbleStaggerItem>
              <DribbbleCard padding="lg" className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(var(--accent),0.1)] flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text">Marketplaces</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  Generic beat marketplaces bury your work among thousands of others. 
                  You compete on price, lose your brand identity, and pay platform fees on every sale.
                </p>
              </DribbbleCard>
            </DribbbleStaggerItem>
            
            {/* Solution */}
            <DribbbleStaggerItem>
              <DribbbleCard padding="lg" glow className="h-full border border-[rgba(var(--accent),0.2)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text">Your Brand</h3>
                </div>
                <p className="text-muted leading-relaxed">
                  BroLab gives you a dedicated storefront with your own subdomain or custom domain. 
                  Build your brand, own your audience, and keep 100% of your sales.
                </p>
              </DribbbleCard>
            </DribbbleStaggerItem>
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

function WhatWeEnableSection() {
  return (
    <section className="py-16 px-4 bg-[rgba(var(--bg-2),0.3)]">
      <div className="container mx-auto max-w-5xl">
        <DribbbleSectionEnter>
          <SectionHeader 
            title="WHAT BROLAB ENABLES" 
            subtitle="Everything you need to run your music business"
          />
        </DribbbleSectionEnter>
        
        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {WHAT_WE_ENABLE.map((item) => (
              <DribbbleStaggerItem key={item.title}>
                <DribbbleCard padding="lg" hoverLift className="h-full text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgba(var(--accent),0.1)] flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-text mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                </DribbbleCard>
              </DribbbleStaggerItem>
            ))}
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

function RoadmapSection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <DribbbleSectionEnter>
          <SectionHeader 
            title="COMING NEXT" 
            subtitle="What we're building"
          />
        </DribbbleSectionEnter>
        
        <DribbbleSectionEnter>
          <DribbbleCard padding="lg" className="mt-8">
            <div className="space-y-4">
              {ROADMAP_ITEMS.map((item) => (
                <div 
                  key={item.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-[rgba(var(--bg),0.5)] border border-border/50"
                >
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${item.status === 'live' 
                      ? 'bg-[rgba(var(--accent),0.15)] text-accent' 
                      : 'bg-[rgba(var(--muted),0.1)] text-muted'
                    }
                  `}>
                    {item.status === 'live' ? '✓' : '→'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-text">{item.title}</h4>
                      {item.status === 'live' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-accent bg-[rgba(var(--accent),0.1)] rounded-full uppercase">
                          Live
                        </span>
                      )}
                      {item.status === 'coming' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-muted bg-[rgba(var(--muted),0.1)] rounded-full uppercase">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </DribbbleCard>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

function FinalCTASection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <DribbbleSectionEnter>
          <DribbbleCard glow padding="lg" className="text-center relative overflow-hidden">
            {/* Decorative glows */}
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
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">
                Ready to own your brand?
              </h2>
              <p className="text-muted mb-8 max-w-md mx-auto">
                Launch your storefront in minutes. Start selling beats and services on your own terms.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/sign-up">
                  <PillCTA variant="primary" size="lg" icon={Sparkles}>
                    Get Started
                  </PillCTA>
                </Link>
                <Link href="/pricing">
                  <PillCTA variant="secondary" size="lg" icon={ArrowRight}>
                    View Pricing
                  </PillCTA>
                </Link>
              </div>
            </div>
          </DribbbleCard>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

// ============ Main Page ============

export default function AboutPage() {
  return (
    <MarketingPageShell
      heroWord="ABOUT"
      seoTitle="About BroLab Entertainment - Your Music, Your Brand, Your Revenue"
      eyebrow="Our Mission"
      subtitle="Empowering music creators to build their brand and sell directly to artists."
      variant="default"
      microItems={[
        { text: 'Zero platform fees on sales' },
        { text: 'Direct Stripe payments' },
        { text: 'Your brand, your domain' },
      ]}
    >
      {/* Problem / Solution */}
      <ProblemSolutionSection />
      
      {/* What We Enable */}
      <WhatWeEnableSection />
      
      {/* Roadmap */}
      <RoadmapSection />
      
      {/* Final CTA */}
      <FinalCTASection />
    </MarketingPageShell>
  )
}

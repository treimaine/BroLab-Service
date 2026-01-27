'use client'

import {
  DribbbleCard,
  DribbbleSectionEnter,
  DribbbleStaggerItem,
  GlassChip,
  GlassToggle,
  MarketingPageShell,
  PillCTA,
  SectionHeader
} from '@/platform/ui'
import { useQuery } from 'convex/react'
import {
  Check,
  ChevronDown,
  CreditCard,
  Lock,
  Shield,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { PublicPlanInfo } from '../../../convex/platform/billing/getPlansPublic'

// ============ Pricing Data ============

/**
 * Plan features UI configuration
 * Maps Convex plan data to UI display
 */
const PLAN_UI_CONFIG = {
  basic: {
    name: 'BASIC',
    description: 'Perfect for getting started',
    popular: false,
  },
  pro: {
    name: 'PRO',
    description: 'For serious creators',
    popular: true,
  },
} as const

/**
 * Helper to format feature values for display
 */
function formatFeatureValue(value: number): string {
  if (value === -1) return 'Unlimited'
  if (value === 0) return '0'
  return value.toString()
}

/**
 * Generate plan features list from Convex data
 */
function getPlanFeaturesList(plan: 'basic' | 'pro', planData: PublicPlanInfo) {
  const features = planData.features
  const isPro = plan === 'pro'
  
  return [
    { 
      label: 'Published tracks', 
      value: formatFeatureValue(features.maxPublishedTracks), 
      included: features.maxPublishedTracks !== 0 
    },
    { 
      label: 'Storage', 
      value: `${features.storageGb} GB`, 
      included: features.storageGb > 0 
    },
    { 
      label: 'Custom domains', 
      value: formatFeatureValue(features.maxCustomDomains), 
      included: features.maxCustomDomains > 0 
    },
    { label: '30s preview generation', value: true, included: true },
    { label: 'License PDF generation', value: true, included: true },
    { label: 'Direct Stripe payments', value: true, included: true },
    { label: 'Service listings', value: true, included: true },
    { label: 'Analytics dashboard', value: isPro ? 'Advanced' : 'Basic', included: true },
    { label: 'Priority support', value: false, included: isPro },
  ]
}

/**
 * Generate feature comparison table from Convex data
 */
function getFeatureComparison(basicPlan: PublicPlanInfo, proPlan: PublicPlanInfo) {
  const basicFeatures = basicPlan.features
  const proFeatures = proPlan.features

  return [
    { 
      category: 'Beats & Storage', 
      features: [
        { 
          name: 'Published tracks', 
          basic: formatFeatureValue(basicFeatures.maxPublishedTracks), 
          pro: formatFeatureValue(proFeatures.maxPublishedTracks) 
        },
        { 
          name: 'Storage space', 
          basic: `${basicFeatures.storageGb} GB`, 
          pro: `${proFeatures.storageGb} GB` 
        },
        { name: '30s preview generation', basic: true, pro: true },
        { name: 'License PDF generation', basic: true, pro: true },
      ]
    },
    { 
      category: 'Storefront', 
      features: [
        { name: 'Custom subdomain', basic: true, pro: true },
        { 
          name: 'Custom domains', 
          basic: formatFeatureValue(basicFeatures.maxCustomDomains), 
          pro: formatFeatureValue(proFeatures.maxCustomDomains) 
        },
        { name: 'Service listings', basic: true, pro: true },
        { name: 'Contact page', basic: true, pro: true },
      ]
    },
    { 
      category: 'Payments', 
      features: [
        { name: 'Direct Stripe payments', basic: true, pro: true },
        { name: 'Platform fee', basic: '0%', pro: '0%' },
        { name: 'Multiple license tiers', basic: true, pro: true },
      ]
    },
    { 
      category: 'Support & Analytics', 
      features: [
        { name: 'Analytics dashboard', basic: 'Basic', pro: 'Advanced' },
        { name: 'Email support', basic: true, pro: true },
        { name: 'Priority support', basic: false, pro: true },
      ]
    },
  ]
}

const FAQ_ITEMS = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure billing partner. All payments are processed securely via Stripe.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes! You can upgrade to PRO at any time and the price difference will be prorated. Downgrading takes effect at the end of your current billing period.',
  },
  {
    question: 'What happens to my tracks if I downgrade?',
    answer: 'Your existing tracks remain accessible, but you won\'t be able to publish new tracks until you\'re within the BASIC plan limits (25 published tracks, 1GB storage).',
  },
  {
    question: 'How do artist payments work?',
    answer: 'When artists purchase your beats or services, payments go directly to your connected Stripe account. We don\'t take any platform fee on your sales.',
  },
  {
    question: 'Can I use my own domain?',
    answer: 'PRO subscribers can connect up to 2 custom domains to their storefront. BASIC subscribers use a subdomain (yourname.brolabentertainment.com).',
  },
  {
    question: 'What\'s included in the license PDF?',
    answer: 'Each sale automatically generates a professional PDF license containing the buyer\'s info, license tier rights, usage limits, and publishing splits.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'We don\'t offer a free trial, but you can start with the BASIC plan at just $9.99/month. Annual plans offer significant savings (50-70% off).',
  },
  {
    question: 'What happens if I cancel?',
    answer: 'Your storefront remains accessible until the end of your billing period. After that, your storefront goes offline but your data is preserved for 30 days.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 14-day money-back guarantee for new subscribers. Contact support within 14 days of your first payment for a full refund.',
  },
  {
    question: 'How do I connect Stripe?',
    answer: 'During onboarding, you\'ll be guided through Stripe Connect setup. It takes about 5 minutes and requires basic business information.',
  },
]

// ============ Components ============

function PricingToggle({ 
  isAnnual, 
  onToggle 
}: Readonly<{ 
  isAnnual: boolean
  onToggle: (checked: boolean) => void 
}>) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <GlassToggle 
        checked={isAnnual} 
        onChange={onToggle} 
        leftLabel="Monthly" 
        rightLabel="Annual" 
      />
      <span className="ml-2 px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] rounded-full shadow-[0_2px_8px_rgba(var(--accent),0.3)]">
        SAVE UP TO 70%
      </span>
    </div>
  )
}

function PlanCard({ 
  plan,
  isAnnual,
  planData
}: Readonly<{ 
  plan: 'basic' | 'pro'
  isAnnual: boolean
  planData: PublicPlanInfo | undefined
}>) {
  if (!planData) {
    return (
      <DribbbleCard padding="lg">
        <div className="text-center py-8 text-muted">Loading plan details...</div>
      </DribbbleCard>
    )
  }

  const uiConfig = PLAN_UI_CONFIG[plan]
  const price = isAnnual ? planData.pricing.annual : planData.pricing.monthly
  const isPro = plan === 'pro'
  const savingsPercent = planData.annualSavings
  const features = getPlanFeaturesList(plan, planData)

  return (
    <div className={isPro ? 'pt-4' : ''}>
      {isPro && (
        <div className="flex justify-center mb-[-14px] relative z-20">
          <span className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] rounded-full shadow-[0_4px_14px_rgba(var(--accent),0.4)]">
            MOST POPULAR
          </span>
        </div>
      )}
      
      <DribbbleCard 
        glow={isPro} 
        hoverLift 
        padding="lg" 
        className={`relative ${isPro ? 'border border-[rgba(var(--accent),0.3)] ring-1 ring-[rgba(var(--accent),0.2)]' : ''}`}
      >
        <div className={`text-center mb-6 ${isPro ? 'pt-2' : ''}`}>
          <h3 className="text-2xl font-bold text-text mb-2">{uiConfig.name}</h3>
          <p className="text-sm text-muted">{uiConfig.description}</p>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-text">${price.toFixed(2)}</span>
            <span className="text-muted">/{isAnnual ? 'year' : 'month'}</span>
          </div>
          {isAnnual && (
            <p className="mt-2 text-sm text-accent font-medium">
              Save {savingsPercent}% with annual billing
            </p>
          )}
        </div>

        <Link href="/sign-up" className="block mb-6">
          <PillCTA 
            variant="primary"
            size="lg" 
            fullWidth
            className={isPro ? '' : 'bg-gradient-to-r from-[rgba(var(--accent),0.15)] to-[rgba(var(--accent-2),0.15)] !text-accent border border-[rgba(var(--accent),0.3)]'}
          >
            Get Started
          </PillCTA>
        </Link>

        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature.label} className="flex items-center gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-accent flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-muted/50 flex-shrink-0" />
              )}
              <span className={`text-sm ${feature.included ? 'text-text' : 'text-muted/50'}`}>
                {feature.label}
                {typeof feature.value === 'string' && (
                  <span className="ml-1 font-medium">({feature.value})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </DribbbleCard>
    </div>
  )
}

function FeatureValue({ value, isHighlighted = false }: Readonly<{ value: boolean | string; isHighlighted?: boolean }>) {
  if (typeof value === 'boolean') {
    if (value) {
      return <Check className="w-5 h-5 text-accent mx-auto" />
    }
    return <X className="w-5 h-5 text-muted/50 mx-auto" />
  }
  return (
    <span className={`text-sm ${isHighlighted ? 'font-medium text-text' : 'text-muted'}`}>
      {value}
    </span>
  )
}

interface FeatureComparisonCategory {
  category: string
  features: Array<{
    name: string
    basic: boolean | string
    pro: boolean | string
  }>
}

function FeatureTable({ featureComparison }: Readonly<{ featureComparison: FeatureComparisonCategory[] }>) {
  if (!featureComparison || featureComparison.length === 0) {
    return (
      <div className="text-center py-8 text-muted">Loading feature comparison...</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 text-sm font-bold text-text">Features</th>
            <th className="text-center py-4 px-4 text-sm font-bold text-text w-32">BASIC</th>
            <th className="text-center py-4 px-4 text-sm font-bold text-accent w-32">PRO</th>
          </tr>
        </thead>
        <tbody>
          {featureComparison.map((category) => (
            <React.Fragment key={category.category}>
              <tr className="bg-[rgba(var(--bg-2),0.3)]">
                <td colSpan={3} className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">
                  {category.category}
                </td>
              </tr>
              {category.features.map((feature) => (
                <tr key={feature.name} className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm text-text">{feature.name}</td>
                  <td className="py-3 px-4 text-center">
                    <FeatureValue value={feature.basic} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <FeatureValue value={feature.pro} isHighlighted />
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FAQItem({ 
  question, 
  answer, 
  isOpen, 
  onToggle 
}: Readonly<{ 
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}>) {
  return (
    <div className="border-b border-border/50">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-text pr-4">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-muted flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="pb-4">
          <p className="text-sm text-muted leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="max-w-3xl mx-auto">
      {FAQ_ITEMS.map((item, index) => (
        <FAQItem
          key={item.question}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  )
}

function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      <GlassChip icon={Lock} label="Powered by secure billing" />
      <GlassChip icon={CreditCard} label="One-time purchases via Stripe" />
      <GlassChip icon={Shield} label="14-day money-back guarantee" />
    </div>
  )
}

function FinalCTASection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
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
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">
                Ready to launch your storefront?
              </h2>
              <p className="text-muted mb-8 max-w-md mx-auto">
                Join creators who are already growing their brand with BroLab. Start selling in minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/sign-up">
                  <PillCTA variant="primary" size="lg" icon={Sparkles}>
                    Start Free Trial
                  </PillCTA>
                </Link>
                <Link href="/contact">
                  <PillCTA variant="secondary" size="lg">
                    Contact Sales
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

export default function PricingPageClient() {
  const [isAnnual, setIsAnnual] = useState(true)
  
  // Fetch plan data from Convex
  const plansData = useQuery(api.platform.billing.getPlansPublic)
  
  // Extract basic and pro plans
  const basicPlan = plansData?.find((p: PublicPlanInfo) => p.slug === 'basic')
  const proPlan = plansData?.find((p: PublicPlanInfo) => p.slug === 'pro')
  
  // Generate feature comparison
  const featureComparison = basicPlan && proPlan 
    ? getFeatureComparison(basicPlan, proPlan)
    : []

  return (
    <MarketingPageShell
      heroWord="PRICING"
      seoTitle="BroLab Entertainment Pricing Plans"
      eyebrow="Simple Pricing"
      subtitle="Choose the plan that fits your needs. No hidden fees, no platform commission on your sales."
    >
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
          
          <DribbbleSectionEnter stagger>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <DribbbleStaggerItem>
                <PlanCard plan="basic" isAnnual={isAnnual} planData={basicPlan} />
              </DribbbleStaggerItem>
              <DribbbleStaggerItem>
                <PlanCard plan="pro" isAnnual={isAnnual} planData={proPlan} />
              </DribbbleStaggerItem>
            </div>
          </DribbbleSectionEnter>

          <div className="mt-12">
            <TrustBadges />
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <DribbbleSectionEnter>
            <SectionHeader title="FEATURE COMPARISON" subtitle="See exactly what's included in each plan" />
          </DribbbleSectionEnter>
          
          <DribbbleSectionEnter>
            <DribbbleCard padding="none" className="overflow-hidden">
              <FeatureTable featureComparison={featureComparison} />
            </DribbbleCard>
          </DribbbleSectionEnter>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <DribbbleSectionEnter>
            <SectionHeader title="FREQUENTLY ASKED QUESTIONS" subtitle="Everything you need to know about our plans" />
          </DribbbleSectionEnter>
          
          <DribbbleSectionEnter>
            <DribbbleCard padding="lg">
              <FAQSection />
            </DribbbleCard>
          </DribbbleSectionEnter>
        </div>
      </section>

      <FinalCTASection />
    </MarketingPageShell>
  )
}

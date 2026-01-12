'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { BackgroundMusicPattern } from './BackgroundMusicPattern'
import { ConstellationDots } from './ConstellationDots'
import { DribbbleCard } from './DribbbleCard'
import { DribbbleSectionEnter } from './DribbbleSectionEnter'
import { MicroInfoModule } from './MicroInfoModule'
import { OrganicBlob } from './OrganicBlob'
import { OutlineStackTitle } from './OutlineStackTitle'
import { PillCTA } from './PillCTA'
import { WavyLines } from './WavyLines'

/**
 * MarketingPageShell - Canonical ELECTRI-X hero for all marketing pages
 * 
 * This component enforces visual consistency across all marketing pages
 * (/pricing, /about, /contact, /privacy, /terms) using the same design
 * language as the landing page and tenant-demo.
 * 
 * RULE: No marketing page should define its own *Hero() component.
 * All heroes must come through this shell.
 * 
 * Features (ELECTRI-X signature):
 * - OutlineStackTitle with "Press Start 2P" pixel font
 * - Cyan glow text shadow
 * - Scanlines (2 horizontal lines)
 * - Background pattern with hero word repeated (like "MUSIC" on home)
 * - Desktop: asymmetric grid (text left, micro-module right)
 * - Mobile: centered layout
 * 
 * Requirements: 19 (Marketing Pages), 19.x (Marketing Visual Consistency)
 */

// ============ Types ============

interface TOCItem {
  id: string
  label: string
  level?: 1 | 2
}

interface CTAButton {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: LucideIcon
}

interface MicroItem {
  text: string
}

export interface MarketingPageShellProps {
  /** Hero word displayed large with OutlineStackTitle (e.g., "ABOUT", "PRICING") */
  heroWord: string
  /** SEO-friendly H1 text (rendered sr-only) */
  seoTitle: string
  /** Subtitle below hero */
  subtitle?: string
  /** Eyebrow text above hero */
  eyebrow?: string
  /** Main content */
  children: ReactNode
  /** CTA buttons in hero section */
  ctaButtons?: CTAButton[]
  /** Micro items for the info module (right side on desktop) */
  microItems?: MicroItem[]
  /** Variant: default, hero-lite (less decoration), or long-form (for privacy/terms) */
  variant?: 'default' | 'hero-lite' | 'long-form'
  /** Last updated date (for long-form variant) */
  lastUpdated?: string
  /** Table of contents items (for long-form variant) */
  tocItems?: TOCItem[]
  /** Additional CSS classes for main container */
  className?: string
}

// ============ Sub-components ============

/**
 * MarketingHero - ELECTRI-X style hero (canonical)
 * 
 * Desktop: asymmetric grid layout (text left, micro-module right in DribbbleCard)
 * Mobile: centered layout
 */
function MarketingHero({
  heroWord,
  seoTitle,
  subtitle,
  eyebrow,
  ctaButtons,
  microItems,
  variant,
}: Readonly<{
  heroWord: string
  seoTitle: string
  subtitle?: string
  eyebrow?: string
  ctaButtons?: CTAButton[]
  microItems?: MicroItem[]
  variant: 'default' | 'hero-lite' | 'long-form'
}>) {
  const prefersReducedMotion = useReducedMotion()
  const isLite = variant === 'hero-lite' || variant === 'long-form'
  const showDecorations = variant === 'default'

  return (
    <section className="relative min-h-[50vh] lg:min-h-[60vh] overflow-hidden bg-[rgb(var(--bg))]">
      {/* Background Pattern - Hero word repeated (ELECTRI-X signature) */}
      <BackgroundMusicPattern 
        word={heroWord} 
        rows={isLite ? 4 : 5} 
        opacity={isLite ? 0.015 : 0.025} 
      />

      {/* Radial glow - top right */}
      <div 
        className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(var(--accent), 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Radial glow - bottom left (subtle) */}
      <div 
        className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(var(--accent-2), 0.04) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* WavyLines - Right side */}
      {showDecorations && (
        <WavyLines className="right-0 top-0 w-[120px] h-full hidden lg:block" />
      )}

      {/* Dotted vertical line */}
      {showDecorations && (
        <div 
          className="absolute right-[12%] top-0 bottom-0 w-px hidden lg:block"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, rgb(var(--accent)) 0px, rgb(var(--accent)) 4px, transparent 4px, transparent 14px)',
            opacity: 0.3,
          }}
          aria-hidden="true"
        />
      )}

      {/* Constellation - top right area */}
      {showDecorations && (
        <ConstellationDots className="top-[15%] right-[18%] w-[100px] h-[100px] hidden lg:block" />
      )}

      {/* Main Content - Grid layout on desktop */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 min-h-[50vh] lg:min-h-[60vh] flex items-center">
        <div className="w-full py-16 lg:py-24">
          {/* Desktop: Grid layout (left: title+CTA, right: micro-module in card) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left column: Hero content */}
            <div className="lg:col-span-7 relative">
              <DribbbleSectionEnter>
                {/* Eyebrow */}
                {eyebrow && (
                  <span className="inline-block px-4 py-1.5 text-xs font-bold text-accent uppercase tracking-widest bg-[rgba(var(--accent),0.1)] rounded-full mb-6 w-fit mx-auto lg:mx-0">
                    {eyebrow}
                  </span>
                )}

                {/* Outline Stack Title - ELECTRI-X signature with Press Start 2P */}
                <div className="relative z-20 text-center lg:text-left mb-6">
                  <OutlineStackTitle 
                    size="hero" 
                    layers={3}
                    offset={2}
                    className="text-[clamp(40px,10vw,100px)] font-black tracking-[0.02em]"
                    style={{
                      fontFamily: '"Press Start 2P", system-ui, sans-serif',
                      textShadow: '0 0 40px rgba(var(--accent),0.25), 0 0 80px rgba(var(--accent),0.15)',
                    }}
                  >
                    {heroWord}
                  </OutlineStackTitle>
                  
                  {/* SEO-friendly h1 (sr-only) */}
                  <h1 className="sr-only">{seoTitle}</h1>
                  
                  {/* Scanlines - 2 horizontal lines (ELECTRI-X signature) */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                    <div className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-15" style={{ top: '40%' }} />
                    <div className="absolute w-full h-[1px] bg-white opacity-8" style={{ top: '60%' }} />
                  </div>
                </div>
                
                {/* Subtitle */}
                {subtitle && (
                  <motion.p 
                    className="text-lg text-muted max-w-xl mb-8 text-center lg:text-left mx-auto lg:mx-0"
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {subtitle}
                  </motion.p>
                )}

                {/* CTA Buttons */}
                {ctaButtons && ctaButtons.length > 0 && (
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {ctaButtons.map((cta) => (
                      <Link key={cta.href} href={cta.href}>
                        <PillCTA 
                          variant={cta.variant ?? 'primary'} 
                          size="lg"
                          icon={cta.icon}
                        >
                          {cta.label}
                        </PillCTA>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </DribbbleSectionEnter>
            </div>

            {/* Right column: Micro-module in DribbbleCard (desktop only) */}
            {microItems && microItems.length > 0 && showDecorations && (
              <div className="lg:col-span-5 hidden lg:flex justify-end">
                <DribbbleSectionEnter>
                  <DribbbleCard padding="lg" className="max-w-xs">
                    <MicroInfoModule items={microItems} />
                  </DribbbleCard>
                </DribbbleSectionEnter>
              </div>
            )}
          </div>

          {/* Organic Blob - Bottom Right (absolute positioned) */}
          {showDecorations && (
            <div className="absolute bottom-8 right-[8%] hidden lg:block z-20 pointer-events-none">
              <OrganicBlob className="w-[120px] h-[100px]" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * TableOfContents - Sticky sidebar TOC for long-form content
 */
function TableOfContents({ 
  items,
  lastUpdated,
}: Readonly<{ 
  items: TOCItem[]
  lastUpdated?: string
}>) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="sticky top-32 space-y-4" aria-label="Table of contents">
      {lastUpdated && (
        <p className="text-xs text-muted mb-4">
          Last updated: <time>{lastUpdated}</time>
        </p>
      )}
      
      <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
        On this page
      </p>
      
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`
                block text-sm transition-colors
                ${item.level === 2 ? 'pl-4' : ''}
                ${activeId === item.id 
                  ? 'text-accent font-medium' 
                  : 'text-muted hover:text-text'
                }
              `}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ============ Main Component ============

export function MarketingPageShell({
  heroWord,
  seoTitle,
  subtitle,
  eyebrow,
  children,
  ctaButtons,
  microItems,
  variant = 'default',
  lastUpdated,
  tocItems,
  className = '',
}: Readonly<MarketingPageShellProps>) {
  const isLongForm = variant === 'long-form'

  return (
    <main className={`bg-[rgb(var(--bg))] min-h-screen ${className}`}>
      {/* Hero Section - ELECTRI-X canonical */}
      <MarketingHero
        heroWord={heroWord}
        seoTitle={seoTitle}
        subtitle={subtitle}
        eyebrow={eyebrow}
        ctaButtons={isLongForm ? undefined : ctaButtons}
        microItems={microItems}
        variant={variant}
      />

      {/* Content Section */}
      {isLongForm ? (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
              <div className="prose-marketing max-w-3xl">
                {children}
              </div>
              
              {tocItems && tocItems.length > 0 && (
                <aside className="hidden lg:block">
                  <TableOfContents items={tocItems} lastUpdated={lastUpdated} />
                </aside>
              )}
            </div>
            
            {lastUpdated && (
              <p className="lg:hidden text-xs text-muted mt-8 pt-8 border-t border-border">
                Last updated: <time>{lastUpdated}</time>
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="pb-12">
          {children}
        </section>
      )}
    </main>
  )
}

MarketingPageShell.displayName = 'MarketingPageShell'

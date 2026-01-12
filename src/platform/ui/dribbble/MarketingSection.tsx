'use client'

import { type ReactNode } from 'react'
import { DribbbleSectionEnter } from './DribbbleSectionEnter'

/**
 * MarketingSection - Reusable section wrapper for marketing pages
 * 
 * Features:
 * - Consistent padding (py-16 md:py-24)
 * - Max-width options (default/narrow/wide)
 * - Optional eyebrow label
 * - Responsive spacing
 * 
 * Requirements: 19 (Marketing Pages)
 */

// ============ Types ============

type MaxWidthOption = 'default' | 'narrow' | 'wide' | 'full'

interface MarketingSectionProps {
  /** Section content */
  children: ReactNode
  /** Max-width option: default (5xl), narrow (3xl), wide (7xl), full (none) */
  maxWidth?: MaxWidthOption
  /** Optional eyebrow label above content */
  eyebrow?: string
  /** Section ID for anchor links */
  id?: string
  /** Additional CSS classes */
  className?: string
  /** Background variant */
  background?: 'default' | 'muted' | 'accent'
  /** Disable section enter animation */
  disableAnimation?: boolean
  /** Custom padding override */
  padding?: 'default' | 'compact' | 'spacious' | 'none'
}

// ============ Constants ============

const MAX_WIDTH_CLASSES: Record<MaxWidthOption, string> = {
  default: 'max-w-5xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
}

const PADDING_CLASSES: Record<NonNullable<MarketingSectionProps['padding']>, string> = {
  default: 'py-16 md:py-24',
  compact: 'py-8 md:py-12',
  spacious: 'py-24 md:py-32',
  none: 'py-0',
}

const BACKGROUND_CLASSES: Record<NonNullable<MarketingSectionProps['background']>, string> = {
  default: '',
  muted: 'bg-[rgba(var(--bg-2),0.5)]',
  accent: 'bg-[rgba(var(--accent),0.03)]',
}

// ============ Sub-components ============

/**
 * EyebrowLabel - Small uppercase label above section content
 */
function EyebrowLabel({ text }: Readonly<{ text: string }>) {
  return (
    <span className="inline-block px-4 py-1.5 text-xs font-bold text-accent uppercase tracking-widest bg-[rgba(var(--accent),0.1)] rounded-full mb-6">
      {text}
    </span>
  )
}

// ============ Main Component ============

export function MarketingSection({
  children,
  maxWidth = 'default',
  eyebrow,
  id,
  className = '',
  background = 'default',
  disableAnimation = false,
  padding = 'default',
}: Readonly<MarketingSectionProps>) {
  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth]
  const paddingClass = PADDING_CLASSES[padding]
  const backgroundClass = BACKGROUND_CLASSES[background]

  const content = (
    <>
      {eyebrow && <EyebrowLabel text={eyebrow} />}
      {children}
    </>
  )

  return (
    <section
      id={id}
      className={`${paddingClass} px-4 ${backgroundClass} ${className}`}
    >
      <div className={`container mx-auto ${maxWidthClass}`}>
        {disableAnimation ? (
          content
        ) : (
          <DribbbleSectionEnter>
            {content}
          </DribbbleSectionEnter>
        )}
      </div>
    </section>
  )
}

MarketingSection.displayName = 'MarketingSection'

/**
 * BroLab Entertainment Design System UI Primitives
 * 
 * This module is the SINGLE import point for all UI components.
 * Import from '@/platform/ui' for all UI needs.
 * 
 * Requirements: 23.1-23.6 (Design System Implementation)
 * Requirements: 24.1-24.4 (Motion and Animation)
 * Requirements: Code Architecture (UI Source of Truth)
 */

// =============================================================================
// DRIBBBLE UI KIT (Primary - Use These)
// =============================================================================

// Background & Effects
export { BackgroundMusicPattern } from './dribbble/BackgroundMusicPattern'
export { WavyBackground } from './dribbble/WavyBackground'
export { WavyLines } from './dribbble/WavyLines'

// Typography
export { OutlineStackTitle } from './dribbble/OutlineStackTitle'

// Navigation
export { IconRail, type IconRailItem } from './dribbble/IconRail'
export { TopMinimalBar } from './dribbble/TopMinimalBar'

// Buttons
export { PillCTA } from './dribbble/PillCTA'

// Cards & Modules
export { DribbbleCard } from './dribbble/DribbbleCard'
export { MicroInfoModule } from './dribbble/MicroInfoModule'
export { MicroModule, MicroModuleList } from './dribbble/MicroModule'

// Decorations (ELECTRI-X style)
export { ConstellationDots } from './dribbble/ConstellationDots'
export { CyanOrb } from './dribbble/CyanOrb'
export { EditionBadge } from './dribbble/EditionBadge'
export { OrganicBlob } from './dribbble/OrganicBlob'

// Layout
export { MarketingPageShell } from './dribbble/MarketingPageShell'
export { MarketingSection } from './dribbble/MarketingSection'
export { SectionHeader } from './dribbble/SectionHeader'

// Animation Wrappers
export { DribbbleSectionEnter, DribbbleStaggerItem } from './dribbble/DribbbleSectionEnter'

// Audio Primitives
export {
    NowPlayingChip,
    PlayerPillButton,
    ProgressRail,
    VolumePill,
    WaveformPlaceholder
} from './dribbble/audio'

// Dribbble Motion Utilities
export {
    dribbbleBlobFloat,
    dribbbleCardEnter,
    dribbbleFadeScale,
    dribbbleHeroFloat,
    dribbbleHoverGlow,
    dribbbleHoverLift,
    dribbbleHoverScale,
    dribbblePageEnter,
    dribbbleReducedMotion,
    dribbbleScrollReveal,
    dribbbleSlideInLeft,
    dribbbleSlideInRight,
    dribbbleStaggerChild,
    dribbbleStaggerContainer,
    getMotionProps,
    scrollRevealViewport,
    smoothTransition,
    springTransition
} from './dribbble/motion'

// =============================================================================
// ADDITIONAL COMPONENTS
// =============================================================================

/**
 * PageTransition - Page transition wrapper with framer-motion
 */
export { PageTransition, type PageTransitionProps } from './PageTransition'

// =============================================================================
// LEGACY MOTION UTILITIES (Still valid - complement Dribbble motion)
// =============================================================================

export {
    createHeroFloat,
    fadeOnly,
    getReducedMotionVariants,
    heroFloat,
    pageEnter,
    pageEnterTransition,
    pageEnterVariants,
    staggerChild,
    staggerContainer,
    useReducedMotion,
    type MotionVariantKey
} from './motion'


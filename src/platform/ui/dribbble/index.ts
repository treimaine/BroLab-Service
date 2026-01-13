/**
 * Dribbble UI Kit
 * 
 * Design system primitives following the Dribbble design language.
 * See /docs/dribbble-style-guide.md for usage guidelines.
 */

// Background & Effects
export { BackgroundMusicPattern } from './BackgroundMusicPattern'
export { BackgroundPattern } from './BackgroundPattern'
export { WavyBackground } from './WavyBackground'
export { WavyLines } from './WavyLines'

// Audio Primitives
export {
    NowPlayingChip,
    PlayerPillButton,
    ProgressRail,
    VolumePill,
    WaveformPlaceholder
} from './audio'

// Typography
export { OutlineStackTitle } from './OutlineStackTitle'
export { PixelTitle } from './PixelTitle'

// Navigation
export { IconRail, type IconRailItem } from './IconRail'
export { TopMinimalBar } from './TopMinimalBar'

// Buttons
export { PillCTA } from './PillCTA'

// Cards & Modules
export { ConstellationInfo } from './ConstellationInfo'
export { DribbbleCard } from './DribbbleCard'
export { GlassFooter } from './GlassFooter'
export { GlassHeader } from './GlassHeader'
export { GlassSurface } from './GlassSurface'
export { MicroInfoModule } from './MicroInfoModule'
export { MicroModule, MicroModuleList } from './MicroModule'

// Decorations (ELECTRI-X style)
export { ConstellationDots } from './ConstellationDots'
export { CyanBlob } from './CyanBlob'
export { CyanOrb } from './CyanOrb'
export { EditionBadge } from './EditionBadge'
export { OrganicBlob } from './OrganicBlob'

// Layout
export { MarketingPageShell } from './MarketingPageShell'
export { MarketingSection } from './MarketingSection'
export { SectionHeader } from './SectionHeader'

// Animation Wrappers
export { DribbbleSectionEnter, DribbbleStaggerItem } from './DribbbleSectionEnter'

// Motion Utilities
export {
    dribbbleBlobFloat,
    // Card animations
    dribbbleCardEnter,
    // Modal animations
    dribbbleFadeScale,
    // Float animations
    dribbbleHeroFloat, dribbbleHoverGlow,
    // Hover effects
    dribbbleHoverLift, dribbbleHoverScale,
    // Page transitions
    dribbblePageEnter,
    // Reduced motion
    dribbbleReducedMotion,
    // Scroll reveal
    dribbbleScrollReveal,
    // Slide animations
    dribbbleSlideInLeft,
    dribbbleSlideInRight, dribbbleStaggerChild,
    // Stagger animations
    dribbbleStaggerContainer,
    // Helper
    getMotionProps, scrollRevealViewport, smoothTransition,
    // Transitions
    springTransition
} from './motion'


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
export { ChromeSurface, type ChromeSurfaceProps } from './ChromeSurface'
export { ConstellationInfo } from './ConstellationInfo'
export { DribbbleCard } from './DribbbleCard'
export { GlassChip, type GlassChipProps } from './GlassChip'
export { GlassFooter } from './GlassFooter'
export { GlassHeader } from './GlassHeader'
export { GlassSkeletonCard, type GlassSkeletonCardProps } from './GlassSkeletonCard'
export { GlassSkeletonPulse, type GlassSkeletonPulseProps } from './GlassSkeletonPulse'
export { GlassSurface } from './GlassSurface'
export { GlassToggle } from './GlassToggle'
export { MicroInfoModule } from './MicroInfoModule'
export { MicroModule, MicroModuleList } from './MicroModule'
export { RoleCTACard } from './RoleCTACard'
export { TrustChip, type TrustChipProps } from './TrustChip'

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
    // PlayerBar animation
    dribbblePlayerBarEnter,
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


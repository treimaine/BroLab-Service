import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'
import { GlassSurface } from './GlassSurface'

/**
 * GlassHeader - Header wrapper with scroll-based glass effect
 * 
 * A specialized wrapper around GlassSurface for header elements.
 * Provides fixed positioning, z-index layering, and conditional glass styling
 * based on scroll state.
 * 
 * Features:
 * - Fixed positioning at top of viewport
 * - Smooth transition between transparent and glass states
 * - Conditional backdrop blur based on scroll
 * - Proper z-index for layering
 * 
 * @example
 * ```tsx
 * const [isScrolled, setIsScrolled] = useState(false)
 * 
 * useEffect(() => {
 *   const handleScroll = () => setIsScrolled(window.scrollY > 0)
 *   window.addEventListener('scroll', handleScroll)
 *   return () => window.removeEventListener('scroll', handleScroll)
 * }, [])
 * 
 * <GlassHeader isScrolled={isScrolled}>
 *   <nav>Header content</nav>
 * </GlassHeader>
 * ```
 */

interface GlassHeaderProps {
  /** Whether the page is scrolled (triggers glass effect) */
  readonly isScrolled: boolean
  /** Header content */
  readonly children: ReactNode
  /** Additional CSS classes */
  readonly className?: string
}

export function GlassHeader({ isScrolled, children, className }: GlassHeaderProps) {
  return (
    <GlassSurface
      as="header"
      radius="none"
      padding="none"
      bordered={false}
      blur={isScrolled ? 'md' : 'none'}
      className={cn(
        // Fixed positioning
        'fixed top-0 left-0 right-0',
        
        // Z-index for layering (above content, below modals)
        'z-40',
        
        // Smooth transitions
        'transition-all duration-300 ease-out',
        
        // Conditional glass background (uses bg-2 for theme coherence)
        isScrolled ? 'bg-[rgba(var(--bg-2),0.8)]' : 'bg-transparent',
        
        // Custom classes
        className
      )}
    >
      {children}
    </GlassSurface>
  )
}

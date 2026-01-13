import { cn } from '@/lib/utils'
import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react'

/**
 * ChromeSurface - Theme-coherent surface for chrome elements (header/footer/top bars)
 * 
 * CRITICAL: This component MUST ONLY be used for chrome surfaces (header, footer, nav bars).
 * It uses BACKGROUND tokens (--bg, --bg-2) to ensure theme coherence.
 * 
 * DO NOT use card tokens (--card, bg-card/*) for chrome surfaces.
 * 
 * Features:
 * - Polymorphic `as` prop for any HTML element
 * - Theme-coherent backgrounds using bg tokens only
 * - Configurable modes: transparent, base, elevated
 * - Optional border and blur
 * - Full className override support
 * 
 * @example
 * ```tsx
 * // Header (transparent at top, elevated on scroll)
 * <ChromeSurface 
 *   as="header" 
 *   mode={isScrolled ? "elevated" : "transparent"}
 *   blur={isScrolled ? "sm" : "none"}
 * >
 *   Header content
 * </ChromeSurface>
 * 
 * // Footer (always base background)
 * <ChromeSurface as="footer" mode="base" bordered>
 *   Footer content
 * </ChromeSurface>
 * ```
 */

type ChromeSurfaceOwnProps<E extends ElementType = ElementType> = {
  /** Element type to render as (default: 'div') */
  as?: E
  /** Background mode */
  mode?: 'transparent' | 'base' | 'elevated'
  /** Border radius size */
  radius?: 'none' | 'md' | 'xl' | '2xl' | 'full'
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Enable border */
  bordered?: boolean
  /** Backdrop blur intensity */
  blur?: 'none' | 'sm' | 'md'
  /** Additional CSS classes */
  className?: string
}

type ChromeSurfaceProps<E extends ElementType> = ChromeSurfaceOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof ChromeSurfaceOwnProps>

const modeStyles = {
  transparent: '',
  base: 'bg-[rgb(var(--bg))]',
  elevated: 'bg-[rgb(var(--bg))]/95',
}

const radiusStyles = {
  none: '',
  md: 'rounded-md',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const blurStyles = {
  none: '',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
}

const ChromeSurfaceComponent = forwardRef(
  <E extends ElementType = 'div'>(
    {
      as,
      mode = 'base',
      radius = 'none',
      padding = 'none',
      bordered = false,
      blur = 'none',
      className,
      children,
      ...props
    }: ChromeSurfaceProps<E>,
    ref: typeof props.ref
  ) => {
    const Component = as ?? 'div'

    // Dev-time warning for forbidden patterns
    if (process.env.NODE_ENV === 'development') {
      const forbiddenPatterns = ['bg-card', 'bg-white', 'bg-slate-50']
      const hasViolation = forbiddenPatterns.some(pattern => className?.includes(pattern))
      
      if (hasViolation) {
        console.warn(
          `[ChromeSurface] FORBIDDEN PATTERN DETECTED: className contains card/white tokens.\n` +
          `ChromeSurface is for chrome elements (header/footer) and must use bg tokens only.\n` +
          `Found: ${className}\n` +
          `Use CardSurface for card-style components instead.`
        )
      }
    }

    return (
      <Component
        ref={ref}
        className={cn(
          // Background mode (using bg tokens only)
          modeStyles[mode],
          
          // Blur
          blurStyles[blur],
          
          // Border (using border tokens)
          bordered && 'border border-border/50',
          
          // Radius
          radiusStyles[radius],
          
          // Padding
          paddingStyles[padding],
          
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

ChromeSurfaceComponent.displayName = 'ChromeSurface'

export const ChromeSurface = ChromeSurfaceComponent as <E extends ElementType = 'div'>(
  props: ChromeSurfaceProps<E>
) => React.ReactElement | null

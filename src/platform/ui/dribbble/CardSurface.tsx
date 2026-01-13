import { cn } from '@/lib/utils'
import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react'

/**
 * CardSurface - Glass morphism surface for card elements
 * 
 * This component is for card-style elements (cards, modules, overlays).
 * It uses BG-2 tokens (--bg-2) for theme-coherent glass effect.
 * 
 * DO NOT use this for chrome surfaces (header/footer) - use ChromeSurface instead.
 * 
 * Features:
 * - Polymorphic `as` prop for any HTML element
 * - Glass morphism with card tokens
 * - Configurable border radius
 * - Configurable padding
 * - Optional border
 * - Configurable backdrop blur
 * - Full className override support
 * 
 * @example
 * ```tsx
 * <CardSurface as="div" padding="md" radius="xl" bordered>
 *   Card content
 * </CardSurface>
 * 
 * <CardSurface as="article" blur="md" className="custom-class">
 *   Module content
 * </CardSurface>
 * ```
 */

type CardSurfaceOwnProps<E extends ElementType = ElementType> = {
  /** Element type to render as (default: 'div') */
  as?: E
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

type CardSurfaceProps<E extends ElementType> = CardSurfaceOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof CardSurfaceOwnProps>

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

const CardSurfaceComponent = forwardRef(
  <E extends ElementType = 'div'>(
    {
      as,
      radius = 'xl',
      padding = 'md',
      bordered = false,
      blur = 'md',
      className,
      children,
      ...props
    }: CardSurfaceProps<E>,
    ref: typeof props.ref
  ) => {
    const Component = as ?? 'div'

    return (
      <Component
        ref={ref}
        className={cn(
          // Base glass styling with bg-2 tokens for theme coherence
          'bg-[rgba(var(--bg-2),0.8)]',
          blurStyles[blur],
          
          // Border
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

CardSurfaceComponent.displayName = 'CardSurface'

export const CardSurface = CardSurfaceComponent as <E extends ElementType = 'div'>(
  props: CardSurfaceProps<E>
) => React.ReactElement | null

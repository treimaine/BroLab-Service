import { cn } from '@/lib/utils'
import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react'

/**
 * GlassSurface - Generic glass morphism surface component
 * 
 * A polymorphic component that can render as any HTML element with glass styling.
 * Replaces multiple specific components (GlassHeader, GlassFooter, GlassContainer)
 * with a single flexible primitive.
 * 
 * Features:
 * - Polymorphic `as` prop for any HTML element
 * - Configurable border radius
 * - Configurable padding
 * - Optional border
 * - Configurable backdrop blur
 * - Full className override support
 * 
 * @example
 * ```tsx
 * <GlassSurface as="header" padding="md" radius="xl">
 *   Header content
 * </GlassSurface>
 * 
 * <GlassSurface as="div" bordered blur="md" className="custom-class">
 *   Card content
 * </GlassSurface>
 * ```
 */

type GlassSurfaceOwnProps<E extends ElementType = ElementType> = {
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

type GlassSurfaceProps<E extends ElementType> = GlassSurfaceOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof GlassSurfaceOwnProps>

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

const GlassSurfaceComponent = forwardRef(
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
    }: GlassSurfaceProps<E>,
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

GlassSurfaceComponent.displayName = 'GlassSurface'

export const GlassSurface = GlassSurfaceComponent as <E extends ElementType = 'div'>(
  props: GlassSurfaceProps<E>
) => React.ReactElement | null

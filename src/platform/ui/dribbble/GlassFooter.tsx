import { cn } from '@/lib/utils'
import { GlassSurface } from './GlassSurface'

/**
 * GlassFooter - Footer wrapper with glass styling
 * 
 * A specialized wrapper around GlassSurface configured for footer usage.
 * Applies border-top and glass styling by default.
 * 
 * @example
 * ```tsx
 * <GlassFooter>
 *   <p>© 2026 BroLab Entertainment</p>
 * </GlassFooter>
 * 
 * <GlassFooter className="py-8">
 *   <nav>Footer navigation</nav>
 * </GlassFooter>
 * ```
 */

interface GlassFooterProps {
  /** Footer content */
  readonly children: React.ReactNode
  /** Additional CSS classes */
  readonly className?: string
}

export function GlassFooter({ children, className }: GlassFooterProps) {
  return (
    <GlassSurface
      as="footer"
      bordered
      className={cn(
        // Border top only (override default border)
        'border-0 border-t border-border/50',
        className
      )}
    >
      {children}
    </GlassSurface>
  )
}

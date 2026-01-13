/**
 * GlassSkeletonCard - Loading state skeleton with glass styling
 *
 * Features:
 * - Glass background with backdrop blur
 * - Animated shimmer effect
 * - Configurable rows and optional image placeholder
 * - Uses bg-2 tokens for theme coherence
 * - Respects reduced-motion preferences
 *
 * Use cases:
 * - Loading states for cards
 * - Content placeholders
 * - Async data fetching indicators
 * - Optimistic UI patterns
 *
 * Requirements: Surface Component
 */


export interface GlassSkeletonCardProps {
  /**
   * Number of skeleton rows to display
   * @default 3
   */
  rows?: number
  /**
   * Whether to show an image placeholder
   * @default false
   */
  hasImage?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

export function GlassSkeletonCard({
  rows = 3,
  hasImage = false,
  className = '',
}: Readonly<GlassSkeletonCardProps>) {
  return (
    <output
      className={`
        block
        rounded-2xl
        bg-[rgba(var(--bg-2),0.8)]
        backdrop-blur-sm
        border border-[rgba(var(--border),var(--border-alpha))]
        p-6
        ${className}
      `.trim().replaceAll(/\s+/g, ' ')}
      aria-label="Loading content"
    >
      {/* Optional image placeholder */}
      {hasImage && (
        <div
          className="
            w-full h-48 mb-4 rounded-xl
            bg-[rgba(var(--border),0.2)]
            animate-pulse
            motion-reduce:animate-none
          "
          aria-hidden="true"
        />
      )}

      {/* Skeleton rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => {
          // Vary the width for visual interest
          const widthClass = i === rows - 1 ? 'w-3/4' : 'w-full'
          
          return (
            <div
              key={`skeleton-row-${i}`}
              className={`
                h-4 rounded-lg
                bg-[rgba(var(--border),0.2)]
                animate-pulse
                motion-reduce:animate-none
                ${widthClass}
              `}
              aria-hidden="true"
            />
          )
        })}
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading content, please wait...</span>
    </output>
  )
}

'use client'

interface OrganicBlobProps {
  readonly className?: string
  readonly id?: string
}

/**
 * OrganicBlob - ELECTRI-X decorative element
 * 
 * Organic blob shape with gradient fill and glow effect.
 * Uses a stable ID to avoid hydration mismatches.
 * 
 * @example
 * ```tsx
 * <OrganicBlob className="w-[180px] h-[140px]" />
 * ```
 */
export function OrganicBlob({ className, id = 'organic-blob' }: OrganicBlobProps) {
  const gradientId = `${id}-gradient`
  const glowId = `${id}-glow`

  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(var(--accent))" />
          <stop offset="100%" stopColor="rgb(var(--accent-2))" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path 
        d="M40 80 
           C20 50 40 20 80 15 
           C120 10 160 30 175 65 
           C190 100 170 140 130 150 
           C90 160 60 145 45 120 
           C30 95 35 90 40 80Z"
        fill={`url(#${gradientId})`}
        filter={`url(#${glowId})`}
      />
    </svg>
  )
}

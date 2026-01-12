/**
 * EditionBadge - ELECTRI-X style badge (bottom-left of hero)
 * 
 * Pill-shaped badge with glass background.
 * Example: "ELECTRI-X Edition" or "BROLAB Edition"
 */

interface EditionBadgeProps {
  /** Main title (e.g., "ELECTRI-X", "BROLAB") */
  title: string
  /** Subtitle (e.g., "Edition") */
  subtitle?: string
  /** Additional CSS classes */
  className?: string
}

export function EditionBadge({ 
  title, 
  subtitle = 'Edition',
  className = '' 
}: Readonly<EditionBadgeProps>) {
  return (
    <div
      className={`
        inline-flex flex-col items-start
        px-5 py-3 rounded-2xl
        glass border border-[rgba(var(--border),0.3)]
        ${className}
      `}
    >
      <span className="text-lg font-bold text-accent tracking-wide">
        {title}
      </span>
      {subtitle && (
        <span className="text-sm font-medium text-muted uppercase tracking-widest">
          {subtitle}
        </span>
      )}
    </div>
  )
}

EditionBadge.displayName = 'EditionBadge'

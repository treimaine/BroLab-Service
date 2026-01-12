/**
 * BackgroundPattern - ELECTRI-X style repeating text pattern
 * 
 * Creates the subtle "MUSIC" text pattern in the background.
 */

interface BackgroundPatternProps {
  /** Text to repeat */
  text?: string
  /** Additional CSS classes */
  className?: string
}

export function BackgroundPattern({ 
  text = 'MUSIC', 
  className = '' 
}: Readonly<BackgroundPatternProps>) {
  // Create multiple rows of text
  const rows = Array.from({ length: 8 }, (_, i) => i)
  
  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex flex-col justify-center gap-0">
        {rows.map((row) => (
          <div 
            key={row}
            className="whitespace-nowrap text-[clamp(80px,15vw,200px)] font-black tracking-[0.2em] opacity-[0.03] text-white leading-none"
            style={{
              transform: `translateX(${(row % 2) * -50}px)`,
            }}
          >
            {text} {text} {text} {text} {text}
          </div>
        ))}
      </div>
    </div>
  )
}

BackgroundPattern.displayName = 'BackgroundPattern'

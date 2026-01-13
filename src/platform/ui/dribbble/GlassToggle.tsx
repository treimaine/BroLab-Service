'use client'

interface GlassToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  leftLabel: string
  rightLabel: string
}

export function GlassToggle({ checked, onChange, leftLabel, rightLabel }: Readonly<GlassToggleProps>) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-[rgba(var(--bg-2),0.8)] backdrop-blur-sm p-1 border border-[rgba(var(--border),0.3)]">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${checked 
            ? 'text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]'
            : 'bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] shadow-[0_0_20px_rgba(var(--accent),0.3)]'
          }
        `}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${checked 
            ? 'bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))] shadow-[0_0_20px_rgba(var(--accent),0.3)]' 
            : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]'
          }
        `}
      >
        {rightLabel}
      </button>
    </div>
  )
}

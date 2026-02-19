'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * ThemeToggle - Design system component for dark/light mode switching
 *
 * Part of the Dribbble UI kit. Uses Lucide Sun/Moon icons (no emojis).
 * Handles hydration mismatch via mounted guard.
 *
 * Usage:
 * ```tsx
 * import { ThemeToggle } from '@/platform/ui'
 *
 * <TopMinimalBar right={<ThemeToggle />} ... />
 * ```
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10" aria-hidden="true" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}

ThemeToggle.displayName = 'ThemeToggle'

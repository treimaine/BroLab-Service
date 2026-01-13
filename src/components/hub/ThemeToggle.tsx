'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * ThemeToggle Component
 * 
 * Standalone theme toggle button using next-themes.
 * Renders sun/moon icon based on current theme.
 * Includes focus-visible ring for accessibility.
 * 
 * Usage:
 * ```tsx
 * <TopMinimalBar
 *   brand={<span>BROLAB</span>}
 *   right={<ThemeToggle />}
 *   cta={{ label: 'Explore', href: '/sign-up' }}
 * />
 * ```
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-10 h-10" aria-hidden="true" />
    )
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 
        text-muted hover:text-text 
        transition-colors
        focus-visible:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-accent 
        focus-visible:ring-offset-2 
        focus-visible:ring-offset-bg 
        rounded-sm
      "
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

ThemeToggle.displayName = 'ThemeToggle'

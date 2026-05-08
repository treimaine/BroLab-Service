'use client'

import { DribbbleCard, DribbbleSectionEnter, DribbbleStaggerItem } from '@/platform/ui'
import { useEffect, useState } from 'react'

interface StatItem {
  id: string
  label: string
  value: string | number
  suffix?: string
}

const stats: StatItem[] = [
  { id: 'creators', label: 'Active Creators', value: 2847, suffix: '+' },
  { id: 'revenue', label: 'Monthly Revenue', value: 847, suffix: 'K+' },
  { id: 'earnings', label: 'Avg Earnings', value: 2847, suffix: '/mo' },
]

/**
 * CreatorStatsCounter Component
 * 
 * Animated statistics counter with Dribbble design system
 * Uses Intersection Observer for performance optimization
 * 
 * Features:
 * - GPU-accelerated animations
 * - Intersection Observer lazy loading
 * - Dribbble card styling
 * - Responsive design
 */
export function CreatorStatsCounter() {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({
    creators: 0,
    revenue: 0,
    earnings: 0,
  })

  useEffect(() => {
    // Use Intersection Observer for performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation()
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.3 }
    )

    const element = document.getElementById('stats-counter')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  const startAnimation = () => {
    const duration = 2500 // 2.5 seconds
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing: ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      const newValues: Record<string, number> = {}
      stats.forEach((stat) => {
        const maxValue = typeof stat.value === 'number' ? stat.value : 0
        newValues[stat.id] = Math.floor(maxValue * easeProgress)
      })

      setAnimatedValues(newValues)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <section
      id="stats-counter"
      className="px-4 py-10 bg-[rgb(var(--bg))]"
      aria-label="Creator statistics"
    >
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <DribbbleStaggerItem key={stat.id}>
                <DribbbleCard padding="md" hoverLift className="text-center h-full">
                  {/* Stat Value */}
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-3xl md:text-4xl font-black text-accent">
                      {animatedValues[stat.id]?.toLocaleString() || 0}
                    </span>
                    {stat.suffix && (
                      <span className="text-xl md:text-2xl font-bold text-accent">
                        {stat.suffix}
                      </span>
                    )}
                  </div>

                  {/* Stat Label */}
                  <p className="text-xs text-muted uppercase tracking-wide">
                    {stat.label}
                  </p>
                </DribbbleCard>
              </DribbbleStaggerItem>
            ))}
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

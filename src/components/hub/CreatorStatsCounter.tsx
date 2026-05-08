'use client'

import { DribbbleCard, DribbbleSectionEnter, DribbbleStaggerItem } from '@/platform/ui'
import { ANIMATION_DURATION_MS } from '@/shared/constants'
import { useEffect, useState } from 'react'

interface StatItem {
  id: string
  label: string
  value: string | number
  suffix?: string
}

const INTERSECTION_THRESHOLD = 0.3
const EASING_POWER = 3

const stats: StatItem[] = [
  { id: 'creators', label: 'Active Creators', value: 50, suffix: '+' },
  { id: 'revenue', label: 'Monthly Revenue', value: 1, suffix: 'K+' },
  { id: 'earnings', label: 'Avg Earnings', value: 200, suffix: '/mo' },
]

const initialValues = {
  creators: 0,
  revenue: 0,
  earnings: 0,
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, EASING_POWER)
}

function calculateAnimatedValue(stat: StatItem, progress: number): number {
  const maxValue = typeof stat.value === 'number' ? stat.value : 0
  return Math.floor(maxValue * progress)
}

export function CreatorStatsCounter() {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>(initialValues)

  useEffect(() => {
    const element = document.getElementById('stats-counter')
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation()
          observer.unobserve(entry.target)
        }
      },
      { threshold: INTERSECTION_THRESHOLD }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [])

  const startAnimation = () => {
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / ANIMATION_DURATION_MS.VERY_SLOW, 1)
      const easeProgress = easeOutCubic(progress)

      const newValues: Record<string, number> = {}
      stats.forEach((stat) => {
        newValues[stat.id] = calculateAnimatedValue(stat, easeProgress)
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

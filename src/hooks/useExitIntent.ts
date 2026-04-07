'use client'

import { useCallback, useEffect, useState } from 'react'

interface ExitIntentOptions {
  onExitIntent: () => void
  threshold?: number
  maxTriggers?: number
}

export function useExitIntent({ onExitIntent, threshold = 5, maxTriggers = 1 }: ExitIntentOptions) {
  const [triggerCount, setTriggerCount] = useState(0)

  const handleMouseEnter = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      if (triggerCount < maxTriggers) {
        onExitIntent()
        setTriggerCount((c) => c + 1)
      }
    }
  }, [onExitIntent, triggerCount, maxTriggers])

  useEffect(() => {
    let moves = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        moves += 1
        if (moves >= threshold) {
          moves = 0
          if (triggerCount < maxTriggers) {
            onExitIntent()
            setTriggerCount((c) => c + 1)
          }
        }
      }
    }

    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
      if (triggerCount < maxTriggers) {
        onExitIntent()
        setTriggerCount((c) => c + 1)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('visibilitychange', handleMouseEnter)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleMouseEnter)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [onExitIntent, threshold, triggerCount, maxTriggers, handleMouseEnter])
}
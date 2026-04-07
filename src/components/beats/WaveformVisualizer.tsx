'use client'

import { useEffect, useRef } from 'react'

interface WaveformVisualizerProps {
  audioUrl?: string
  className?: string
  barCount?: number
  barColor?: string
  barGap?: number
  animated?: boolean
}

/**
 * Waveform Visualizer Component
 *
 * Displays a visual representation of audio waveform.
 * In production, this would analyze the audio file and generate a real waveform.
 * For now, it generates a stylized placeholder waveform.
 *
 * TODO: Integrate with Web Audio API for real waveform analysis
 * - Use AudioContext to decode audio file
 * - Extract amplitude data with AnalyserNode
 * - Render actual waveform peaks
 */
export function WaveformVisualizer({
  audioUrl: _audioUrl,
  className = '',
  barCount = 40,
  barColor = 'rgb(var(--accent))',
  barGap = 4,
  animated = false,
}: Readonly<WaveformVisualizerProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match display size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Generate waveform data
    // TODO: Replace with real audio analysis
    const generateWaveformData = (): number[] => {
      const data: number[] = []
      for (let i = 0; i < barCount; i++) {
        // Create a natural-looking waveform shape
        const normalizedPosition = i / barCount
        const baseAmplitude = Math.sin(normalizedPosition * Math.PI * 2) * 0.3 + 0.5
        const randomVariation = Math.random() * 0.4
        const amplitude = Math.max(0.1, Math.min(1, baseAmplitude + randomVariation))
        data.push(amplitude)
      }
      return data
    }

    const waveformData = generateWaveformData()

    // Draw waveform
    const drawWaveform = (time: number = 0) => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      const barWidth = (rect.width - barGap * (barCount - 1)) / barCount
      const centerY = rect.height / 2

      waveformData.forEach((amplitude, i) => {
        const x = i * (barWidth + barGap)

        // Add animation if enabled
        let animatedAmplitude = amplitude
        if (animated) {
          const offset = (time / 1000 + i * 0.1) % (Math.PI * 2)
          animatedAmplitude = amplitude * (0.8 + Math.sin(offset) * 0.2)
        }

        const barHeight = animatedAmplitude * rect.height * 0.8
        const y = centerY - barHeight / 2

        // Draw bar
        ctx.fillStyle = barColor
        ctx.fillRect(x, y, barWidth, barHeight)
      })

      if (animated) {
        animationFrameRef.current = requestAnimationFrame(drawWaveform)
      }
    }

    drawWaveform()

    // Cleanup animation
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [barCount, barColor, barGap, animated])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

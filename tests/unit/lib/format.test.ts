import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  formatBPM,
  formatFileSize,
  formatDuration,
  calculateProducerRevenue,
  isValidAudioFile,
} from '@/lib/format'

describe('formatPrice', () => {
  it('should format cents to USD currency', () => {
    expect(formatPrice(2500)).toBe('$25.00')
    expect(formatPrice(10000)).toBe('$100.00')
    expect(formatPrice(99)).toBe('$0.99')
  })

  it('should handle zero price', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('should format large amounts correctly', () => {
    expect(formatPrice(100000)).toBe('$1,000.00')
    expect(formatPrice(10000000)).toBe('$100,000.00')
  })
})

describe('formatBPM', () => {
  it('should format BPM with label', () => {
    expect(formatBPM(120)).toBe('120 BPM')
    expect(formatBPM(140)).toBe('140 BPM')
    expect(formatBPM(90)).toBe('90 BPM')
  })
})

describe('formatFileSize', () => {
  it('should format bytes to human-readable size', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1048576)).toBe('1 MB')
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })

  it('should format partial sizes correctly', () => {
    expect(formatFileSize(2500)).toBe('2.44 KB')
    expect(formatFileSize(15728640)).toBe('15 MB')
  })

  it('should handle small files', () => {
    expect(formatFileSize(500)).toBe('500 B')
    expect(formatFileSize(100)).toBe('100 B')
  })
})

describe('formatDuration', () => {
  it('should format seconds to MM:SS', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(30)).toBe('0:30')
    expect(formatDuration(60)).toBe('1:00')
    expect(formatDuration(90)).toBe('1:30')
    expect(formatDuration(180)).toBe('3:00')
  })

  it('should pad seconds with leading zero', () => {
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(125)).toBe('2:05')
  })

  it('should handle long durations', () => {
    expect(formatDuration(600)).toBe('10:00')
    expect(formatDuration(3661)).toBe('61:01')
  })
})

describe('calculateProducerRevenue', () => {
  it('should calculate revenue with 0% commission (default)', () => {
    expect(calculateProducerRevenue(2500)).toBe(2500)
    expect(calculateProducerRevenue(10000)).toBe(10000)
    expect(calculateProducerRevenue(5000)).toBe(5000)
  })

  it('should calculate revenue with custom commission', () => {
    expect(calculateProducerRevenue(10000, 0.1)).toBe(9000) // 10% commission
    expect(calculateProducerRevenue(5000, 0.2)).toBe(4000) // 20% commission
  })

  it('should handle zero commission explicitly', () => {
    expect(calculateProducerRevenue(7500, 0)).toBe(7500)
  })

  it('should handle 100% commission (edge case)', () => {
    expect(calculateProducerRevenue(10000, 1)).toBe(0)
  })
})

describe('isValidAudioFile', () => {
  it('should accept valid audio extensions', () => {
    expect(isValidAudioFile('beat.wav')).toBe(true)
    expect(isValidAudioFile('track.mp3')).toBe(true)
    expect(isValidAudioFile('song.flac')).toBe(true)
    expect(isValidAudioFile('audio.aiff')).toBe(true)
    expect(isValidAudioFile('music.m4a')).toBe(true)
  })

  it('should be case-insensitive', () => {
    expect(isValidAudioFile('BEAT.WAV')).toBe(true)
    expect(isValidAudioFile('Track.MP3')).toBe(true)
    expect(isValidAudioFile('SONG.FLAC')).toBe(true)
  })

  it('should reject invalid extensions', () => {
    expect(isValidAudioFile('document.pdf')).toBe(false)
    expect(isValidAudioFile('image.jpg')).toBe(false)
    expect(isValidAudioFile('video.mp4')).toBe(false)
    expect(isValidAudioFile('text.txt')).toBe(false)
  })

  it('should reject files without extensions', () => {
    expect(isValidAudioFile('noextension')).toBe(false)
  })

  it('should handle complex filenames', () => {
    expect(isValidAudioFile('my-beat-128bpm-cmajor.wav')).toBe(true)
    expect(isValidAudioFile('track_01_master_final.mp3')).toBe(true)
  })
})

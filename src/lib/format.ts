export function formatPrice(cents: number): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars)
}

export function formatBPM(bpm: number): string {
  return `${bpm} BPM`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function calculateProducerRevenue(salePrice: number, commissionRate: number = 0): number {
  return salePrice * (1 - commissionRate)
}

export function isValidAudioFile(filename: string): boolean {
  const validExtensions = ['.wav', '.mp3', '.flac', '.aiff', '.m4a']
  const extRegex = /\.[^.]+$/
  const match = extRegex.exec(filename.toLowerCase())
  const ext = match?.[0]
  return ext ? validExtensions.includes(ext) : false
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

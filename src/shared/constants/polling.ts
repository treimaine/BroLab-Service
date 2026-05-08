export const POLL_INTERVAL_MS = {
  FAST: 1000,
  NORMAL: 3000,
  SLOW: 5000,
  VERY_SLOW: 10000,
} as const

export const RETRY_DELAY_MS = {
  IMMEDIATE: 0,
  SHORT: 1000,
  MEDIUM: 3000,
  LONG: 5000,
} as const

export const MAX_RETRIES = 3

export const REQUEST_TIMEOUT_MS = {
  SHORT: 5000,
  NORMAL: 10000,
  LONG: 30000,
  VERY_LONG: 60000,
} as const

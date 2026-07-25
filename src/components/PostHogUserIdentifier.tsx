'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import posthog from 'posthog-js'

export function PostHogUserIdentifier() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return
    if (user) {
      posthog.identify(user.id, {
        role: user.unsafeMetadata?.role as string | undefined,
      })
    } else {
      posthog.reset()
    }
  }, [isLoaded, user])

  return null
}

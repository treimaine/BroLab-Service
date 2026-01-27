import type { ReactNode } from 'react'

/**
 * Onboarding Layout
 * 
 * Onboarding has its own full-page layout and doesn't need the hub footer.
 * This layout overrides the parent (hub) layout.
 */
export default function OnboardingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children
}

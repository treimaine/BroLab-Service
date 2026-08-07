import { describe, expect, it } from 'vitest'
import {
  onboardingRecovery,
  welcome,
  type OnboardingRecoveryStage,
} from '../../../convex/platform/email/templates'
import { buildOnboardingRecoveryUrl } from '../../../convex/platform/email/urls'

const brand = {
  brandName: 'BroLab Entertainment',
  siteUrl: 'https://brolabentertainment.com',
}

describe('onboarding lifecycle email copy', () => {
  it('builds an explicit storefront recovery link', () => {
    const url = new URL(buildOnboardingRecoveryUrl(brand.siteUrl))

    expect(url.pathname).toBe('/onboarding')
    expect(url.searchParams.get('resume')).toBe('1')
    expect(url.searchParams.get('step')).toBe('workspace')
    expect(url.searchParams.get('campaign')).toBe('onboarding-recovery')
  })

  it('only starts the free month after BASIC or PRO is chosen', () => {
    const rendered = welcome({
      brand,
      onboardingUrl: `${brand.siteUrl}/onboarding`,
      trialDays: 30,
    })

    expect(rendered.text).toContain(
      'choose BASIC or PRO to start 30 days free'
    )
    expect(rendered.text).not.toContain('30 days of full access')
  })

  it.each<OnboardingRecoveryStage>([
    'one_hour',
    'one_day',
    'three_days',
  ])('renders a truthful %s recovery message', (stage) => {
    const rendered = onboardingRecovery({
      brand,
      stage,
      onboardingUrl:
        `${brand.siteUrl}/onboarding?resume=1&step=workspace&campaign=onboarding-recovery`,
      trialDays: 30,
    })

    expect(rendered.subject.length).toBeGreaterThan(10)
    expect(rendered.text).toContain('BASIC and PRO include 30 days free')
    expect(rendered.text).toContain('campaign=onboarding-recovery')
    expect(rendered.text).toContain('resume=1')
    expect(rendered.text).toContain('step=workspace')
    expect(rendered.text).toContain('BroLab takes 0%')
  })
})

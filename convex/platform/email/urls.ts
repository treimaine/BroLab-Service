export function buildOnboardingRecoveryUrl(siteUrl: string): string {
  const url = new URL('/onboarding', siteUrl)
  url.searchParams.set('resume', '1')
  url.searchParams.set('step', 'workspace')
  url.searchParams.set('source', 'direct')
  url.searchParams.set('campaign', 'onboarding-recovery')
  return url.toString()
}

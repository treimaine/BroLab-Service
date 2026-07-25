import { SignUp } from '@clerk/nextjs'
import { TrustFooter } from '@/components/hub'
import { GrowthTracker } from '@/components/growth/GrowthTracker'

interface SignUpPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getSearchParam(
  value: string | string[] | undefined,
  allowedValues: readonly string[]
): string | undefined {
  const normalizedValue = Array.isArray(value) ? value[0] : value
  return normalizedValue && allowedValues.includes(normalizedValue)
    ? normalizedValue
    : undefined
}

/**
 * Sign Up Page
 *
 * Uses Clerk's <SignUp /> component with Dribbble styling configured in root layout.
 *
 * Styling:
 * - Glass container with glow effect
 * - Cyan accent colors
 * - Inter font family
 * - Rounded corners (2xl/3xl via borderRadius in ClerkProvider)
 * - Focus-visible rings on interactive elements
 *
 * Security Trust Footer:
 * - Displays SSL, Stripe, PCI compliance badges
 * - Reassures users about payment safety
 * - Positioned at bottom of page for maximum impact
 *
 * Redirects:
 * - After sign-up: /onboarding (fallback)
 * - Sign-in link: /sign-in
 *
 * Requirements: 26.1, 26.2, 26.3, 26.5, 26.6
 */
export default async function SignUpPage({ searchParams }: Readonly<SignUpPageProps>) {
  const params = await searchParams
  const plan = getSearchParam(params.plan, ['basic', 'pro']) ?? 'pro'
  const period = getSearchParam(params.period, ['month', 'annual']) ?? 'month'
  const role = getSearchParam(params.role, ['producer', 'engineer'])
  const source = getSearchParam(params.source, [
    'landing',
    'pricing',
    'founding-creators',
    'direct',
  ]) ?? 'direct'
  const onboardingParams = new URLSearchParams({ plan, period, source })
  if (role) onboardingParams.set('role', role)

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <GrowthTracker viewEvent="signup_view" />
      <div className="flex-1 mx-auto flex w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
        <section className="w-full flex-1">
          <div className="mx-auto w-full max-w-md space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--accent))]">
              Join BroLab
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-text">
              Keep 100% of your revenue.
            </h1>
            <p className="text-base text-muted">
              Launch your storefront, sell beats or services, and get paid directly with Stripe.
            </p>
            <ul className="space-y-3 text-sm text-muted">
              <li className="rounded-xl border border-border bg-[rgb(var(--bg-2)/0.45)] px-4 py-3">
                0% commission on every sale
              </li>
              <li className="rounded-xl border border-border bg-[rgb(var(--bg-2)/0.45)] px-4 py-3">
                Instant license and delivery flow
              </li>
              <li className="rounded-xl border border-border bg-[rgb(var(--bg-2)/0.45)] px-4 py-3">
                Setup time: around 5 minutes
              </li>
            </ul>
          </div>
        </section>
        <section className="flex w-full justify-center lg:w-auto">
          <SignUp
            fallbackRedirectUrl={`/onboarding?${onboardingParams.toString()}`}
            signInUrl="/sign-in"
            signInFallbackRedirectUrl={`/onboarding?${onboardingParams.toString()}`}
          />
        </section>
      </div>

      {/* Trust Footer - Security & Payment Trust Badges */}
      <TrustFooter />
    </div>
  )
}

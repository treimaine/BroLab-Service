import { SignUp } from '@clerk/nextjs'

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
 * Redirects:
 * - After sign-up: /onboarding (fallback)
 * - Sign-in link: /sign-in
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.5, 26.6
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
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
              <li className="rounded-xl border border-border bg-[rgba(var(--bg-2),0.45)] px-4 py-3">
                0% commission on every sale
              </li>
              <li className="rounded-xl border border-border bg-[rgba(var(--bg-2),0.45)] px-4 py-3">
                Instant license and delivery flow
              </li>
              <li className="rounded-xl border border-border bg-[rgba(var(--bg-2),0.45)] px-4 py-3">
                Setup time: around 5 minutes
              </li>
            </ul>
          </div>
        </section>
        <section className="flex w-full justify-center lg:w-auto">
          <SignUp
            fallbackRedirectUrl="/onboarding"
            signInUrl="/sign-in"
            signInFallbackRedirectUrl="/onboarding"
          />
        </section>
      </div>
    </div>
  )
}

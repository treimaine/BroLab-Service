import { SignIn } from '@clerk/nextjs'

/**
 * Sign In Page
 * 
 * Uses Clerk's <SignIn /> component with Dribbble styling configured in root layout.
 * 
 * Styling:
 * - Glass container with glow effect
 * - Cyan accent colors
 * - Inter font family
 * - Rounded corners (2xl/3xl via borderRadius in ClerkProvider)
 * - Focus-visible rings on interactive elements
 * 
 * Redirects:
 * - After sign-in: /onboarding (fallback)
 * - Sign-up link: /sign-up
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.5, 26.6
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-app">
      <SignIn
        fallbackRedirectUrl="/onboarding"
        signUpUrl="/sign-up"
        signUpFallbackRedirectUrl="/onboarding"
      />
    </div>
  )
}

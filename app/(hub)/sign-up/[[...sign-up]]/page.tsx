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
    <div className="min-h-screen flex items-center justify-center p-4 bg-app">
      <SignUp
        fallbackRedirectUrl="/onboarding"
        signInUrl="/sign-in"
        signInFallbackRedirectUrl="/onboarding"
      />
    </div>
  )
}

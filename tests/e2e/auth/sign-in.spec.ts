import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 *
 * Tests the complete sign-in flow for BroLab platform
 */

test.describe('Sign In Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display sign-in button on homepage', async ({ page }) => {
    // Check if sign-in navigation is present
    const signInLink = page.getByRole('link', { name: /sign in/i })
    await expect(signInLink).toBeVisible()
  })

  test('should navigate to sign-in page', async ({ page }) => {
    // Click sign-in link
    await page.click('text=Sign In')

    // Wait for navigation
    await page.waitForURL('**/sign-in')

    // Verify we're on sign-in page
    expect(page.url()).toContain('/sign-in')
  })

  test('should load Clerk sign-in component', async ({ page }) => {
    await page.goto('/sign-in')

    // Wait for Clerk component to load
    // Clerk uses specific data attributes we can check for
    await page.waitForSelector('[data-clerk-id]', { timeout: 5000 })

    // Verify Clerk component is visible
    const clerkComponent = await page.locator('[data-clerk-id]')
    await expect(clerkComponent).toBeVisible()
  })

  test('should show email and password fields', async ({ page }) => {
    await page.goto('/sign-in')

    // Wait for form to load
    await page.waitForSelector('input[name="identifier"], input[type="email"]', { timeout: 5000 })

    // Check if email field exists (Clerk uses "identifier")
    const emailField = page.locator('input[name="identifier"], input[type="email"]').first()
    await expect(emailField).toBeVisible()

    // Check if form is interactive
    await emailField.click()
  })

  test('should redirect to dashboard after successful sign-in (with test credentials)', async ({ page }) => {
    // Skip this test if no test credentials available
    const testEmail = process.env.TEST_USER_EMAIL
    const testPassword = process.env.TEST_USER_PASSWORD

    if (!testEmail || !testPassword) {
      test.skip()
      return
    }

    await page.goto('/sign-in')

    // Wait for Clerk form
    await page.waitForSelector('input[name="identifier"]', { timeout: 5000 })

    // Fill in credentials
    await page.fill('input[name="identifier"]', testEmail)
    await page.fill('input[name="password"]', testPassword)

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect after successful sign-in
    await page.waitForURL('**/studio', { timeout: 10000 })

    // Verify we're on the dashboard
    expect(page.url()).toContain('/studio')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/sign-in')

    // Wait for form
    await page.waitForSelector('input[name="identifier"]', { timeout: 5000 })

    // Try invalid credentials
    await page.fill('input[name="identifier"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')

    // Submit
    await page.click('button[type="submit"]')

    // Wait for error message
    // Clerk typically shows error messages in specific elements
    const errorMessage = page.locator('[data-clerk-error], .cl-formFieldErrorText, .error').first()
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Sign Up Flow', () => {
  test('should navigate to sign-up page', async ({ page }) => {
    await page.goto('/')

    // Click sign-up link
    await page.click('text=Sign Up')

    // Wait for navigation
    await page.waitForURL('**/sign-up')

    // Verify we're on sign-up page
    expect(page.url()).toContain('/sign-up')
  })

  test('should load Clerk sign-up component', async ({ page }) => {
    await page.goto('/sign-up')

    // Wait for Clerk component
    await page.waitForSelector('[data-clerk-id]', { timeout: 5000 })

    // Verify sign-up form is visible
    const clerkComponent = await page.locator('[data-clerk-id]')
    await expect(clerkComponent).toBeVisible()
  })

  test('should show required fields for registration', async ({ page }) => {
    await page.goto('/sign-up')

    // Wait for form to load
    await page.waitForSelector('input[name="emailAddress"], input[type="email"]', { timeout: 5000 })

    // Check email field
    const emailField = page.locator('input[name="emailAddress"], input[type="email"]').first()
    await expect(emailField).toBeVisible()

    // Check password field
    const passwordField = page.locator('input[name="password"], input[type="password"]').first()
    await expect(passwordField).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/sign-up')

    // Wait for form
    await page.waitForSelector('input[name="emailAddress"]', { timeout: 5000 })

    // Enter invalid email
    await page.fill('input[name="emailAddress"]', 'notanemail')
    await page.fill('input[name="password"]', 'ValidPassword123!')

    // Try to submit
    await page.click('button[type="submit"]')

    // Check for validation error
    const errorMessage = page.locator('[data-clerk-error], .cl-formFieldErrorText').first()
    await expect(errorMessage).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Authentication Security', () => {
  test('should not expose JWT tokens in localStorage', async ({ page }) => {
    await page.goto('/')

    // Check localStorage
    const localStorageKeys = await page.evaluate(() => Object.keys(localStorage))

    // Ensure no sensitive keys exist
    const forbiddenKeys = ['jwt', 'token', 'auth_token', 'access_token', '__session']
    const foundForbidden = localStorageKeys.filter(key =>
      forbiddenKeys.some(forbidden => key.toLowerCase().includes(forbidden))
    )

    expect(foundForbidden).toHaveLength(0)
  })

  test('should use httpOnly cookies for session', async ({ page, context }) => {
    await page.goto('/')

    // Get cookies
    const cookies = await context.cookies()

    // Check for Clerk cookies
    const clerkCookies = cookies.filter(c => c.name === '__client_uat')

    // If Clerk cookies exist, verify they're httpOnly
    if (clerkCookies.length > 0) {
      for (const cookie of clerkCookies) {
        expect(cookie.httpOnly).toBe(true)
      }
    }
  })
})

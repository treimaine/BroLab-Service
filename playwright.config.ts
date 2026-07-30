import { defineConfig, devices } from '@playwright/test'

const playwrightPort = process.env.PLAYWRIGHT_PORT ?? '3000'
const baseURL =
  process.env.PLAYWRIGHT_URL ?? `http://localhost:${playwrightPort}`

/**
 * Playwright Configuration for BroLab E2E Tests
 *
 * Covers:
 * - Authentication flows (Clerk)
 * - Checkout flows (Stripe)
 * - Marketplace navigation
 * - Security tests (JWT, etc)
 */

export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.ts', 'security/**/*.spec.ts'],

  // Test timeout: 30 seconds per test
  timeout: 30000,

  // Expect timeout: 5 seconds for assertions
  expect: {
    timeout: 5000,
  },

  // Fail on console errors
  use: {
    // Base URL for testing
    baseURL,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Number of retries on CI
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI for deterministic webhook handling
  workers: 1,

  // Configure projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Web server configuration for running tests against dev server
  // Only start server for non-production tests
  webServer: process.env.PLAYWRIGHT_URL ? undefined : {
    command: `npx next dev --webpack --port ${playwrightPort}`,
    url: baseURL,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },

  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],

  // Output folder for test artifacts (use outputDir instead of outputFolder)
  outputDir: 'test-results',
})

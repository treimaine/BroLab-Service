import { defineConfig, devices } from '@playwright/test'

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
  testDir: './tests/e2e',

  // Test timeout: 30 seconds per test
  timeout: 30000,

  // Expect timeout: 5 seconds for assertions
  expect: {
    timeout: 5000,
  },

  // Fail on console errors
  use: {
    // Base URL for testing
    baseURL: process.env.PLAYWRIGHT_URL || 'http://localhost:3000',

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
  workers: process.env.CI ? 1 : undefined,

  // Configure projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Web server configuration for running tests against dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
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

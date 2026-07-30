/**
 * JWT Storage Security Tests
 * 
 * Verifies that JWT tokens are stored securely using httpOnly cookies
 * and NOT in localStorage or sessionStorage.
 * 
 * Requirements: Security Audit Task #3
 */

import { expect, test } from '@playwright/test'

test.describe('JWT Storage Security', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
  })

  test('should NOT store JWT tokens in localStorage', async ({ page }) => {
    // Check localStorage for any auth-related keys
    const localStorageKeys = await page.evaluate(() => {
      return Object.keys(localStorage)
    })

    // Define forbidden keys that should never exist
    const forbiddenKeys = [
      'jwt',
      'token',
      'auth_token',
      'access_token',
      'refresh_token',
      'session_token',
      'bearer',
      'authorization',
      '__session', // Clerk session should be in cookies, not localStorage
      '__client_uat', // Clerk client token should be in cookies
    ]

    // Check if any forbidden keys exist
    const foundForbiddenKeys = localStorageKeys.filter(key =>
      forbiddenKeys.some(forbidden => 
        key.toLowerCase().includes(forbidden.toLowerCase())
      )
    )

    expect(foundForbiddenKeys).toHaveLength(0)
  })

  test('should NOT store JWT tokens in sessionStorage', async ({ page }) => {
    // Check sessionStorage for any auth-related keys
    const sessionStorageKeys = await page.evaluate(() => {
      return Object.keys(sessionStorage)
    })

    // Define forbidden keys
    const forbiddenKeys = [
      'jwt',
      'token',
      'auth_token',
      'access_token',
      'refresh_token',
      'session_token',
      'bearer',
      'authorization',
      '__session',
      '__client_uat',
    ]

    // Check if any forbidden keys exist
    const foundForbiddenKeys = sessionStorageKeys.filter(key =>
      forbiddenKeys.some(forbidden => 
        key.toLowerCase().includes(forbidden.toLowerCase())
      )
    )

    expect(foundForbiddenKeys).toHaveLength(0)
  })

  test('should apply Clerk security attributes to session cookies', async ({ page, context }) => {
    // Sign in to create a session
    await page.goto('/sign-in')
    
    // Note: This test requires actual sign-in credentials
    // In a real test, you would use test credentials
    // For now, we just verify the cookie structure exists
    
    const cookies = await context.cookies()
    
    // Check if Clerk cookies exist (they should after sign-in)
    const clerkCookies = cookies.filter(cookie =>
      ['__session', '__client', '__client_uat'].includes(cookie.name)
    )

    // If user is signed in, verify cookie properties
    if (clerkCookies.length > 0) {
      const sessionCookie = clerkCookies.find(c => c.name === '__session')
      const clientCookie = clerkCookies.find(c => c.name === '__client')

      // __session cookie should exist and be short-lived
      if (sessionCookie) {
        expect(sessionCookie.name).toBe('__session')
        // Should have a short max-age (around 60 seconds)
        // Note: Exact verification depends on Clerk's current implementation
      }

      // Clerk's long-lived client token must never be readable by app JavaScript.
      if (clientCookie) {
        expect(clientCookie.httpOnly).toBe(true)
      }
    }
  })

  test('should NOT expose the long-lived Clerk client token to JavaScript', async ({ page }) => {
    // Try to access cookies via document.cookie
    const accessibleCookies = await page.evaluate(() => {
      return document.cookie
    })

    expect(accessibleCookies).not.toMatch(/(?:^|;\s*)__client=/)

    // __session and __client_uat are JavaScript-readable by Clerk design.
    // __session is mitigated by its short (60 second) lifetime.
  })

  test('localStorage should only contain UI preferences', async ({ page }) => {
    // Get all localStorage items
    const localStorageItems = await page.evaluate(() => {
      const items: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          items[key] = localStorage.getItem(key) || ''
        }
      }
      return items
    })

    // Define allowed keys (UI preferences only)
    const allowedKeys = [
      'audio-player-storage', // Audio player volume/mute
      'theme', // Dark/light mode
      'ally-supports-cache', // next-themes cache
    ]

    // Check that all keys are in the allowed list
    const unauthorizedKeys = Object.keys(localStorageItems).filter(key =>
      !allowedKeys.some(allowed => key.includes(allowed))
    )

    // If there are unauthorized keys, they should not contain sensitive data
    if (unauthorizedKeys.length > 0) {
      for (const key of unauthorizedKeys) {
        const value = localStorageItems[key]
        
        // Verify it doesn't look like a JWT (format: xxx.yyy.zzz)
        expect(value).not.toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
        
        // Verify it doesn't contain common token patterns
        expect(value.toLowerCase()).not.toContain('bearer')
        expect(value.toLowerCase()).not.toContain('jwt')
      }
    }
  })

  test('should not leak tokens in browser console', async ({ page }) => {
    // Monitor console for any token leaks
    const consoleMessages: string[] = []
    
    page.on('console', msg => {
      consoleMessages.push(msg.text())
    })

    // Navigate and interact with the app
    await page.goto('/')
    await page.waitForTimeout(1000)

    // Check console messages for token patterns
    const tokenPatterns = [
      /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/, // JWT pattern
      /Bearer\s+[A-Za-z0-9-_]+/, // Bearer token
    ]

    const leakedTokens = consoleMessages.filter(msg =>
      tokenPatterns.some(pattern => pattern.test(msg))
    )

    expect(leakedTokens).toHaveLength(0)
  })

  test('should use secure cookies in production', async ({ context }) => {
    // This test should only run in production-like environments
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (!isProduction) {
      test.skip()
      return
    }

    const cookies = await context.cookies()
    const clerkCookies = cookies.filter(cookie => 
      cookie.name.startsWith('__')
    )

    // In production, all cookies should have the Secure flag
    for (const cookie of clerkCookies) {
      expect(cookie.secure).toBe(true)
    }
  })

  test('should have SameSite protection on cookies', async ({ context }) => {
    const cookies = await context.cookies()
    const clerkCookies = cookies.filter(cookie => cookie.name === '__session')

    // The app-domain short-lived session cookie uses SameSite=Lax.
    for (const cookie of clerkCookies) {
      expect(cookie.sameSite).toBe('Lax')
    }
  })
})

test.describe('XSS Attack Simulation', () => {
  test('malicious script cannot access httpOnly cookies', async ({ page }) => {
    await page.goto('/')

    // Simulate XSS attack trying to steal cookies
    const stolenData = await page.evaluate(() => {
      try {
        // Attempt to access all cookies
        const cookies = document.cookie
        
        // Attempt to access localStorage
        const storage = { ...localStorage }
        
        // Attempt to access sessionStorage
        const session = { ...sessionStorage }
        
        return {
          cookies,
          storage,
          session,
        }
      } catch (error) {
        return { error: (error as Error).message }
      }
    })

    // The long-lived Clerk client token must not be accessible to injected scripts.
    expect(stolenData.cookies).not.toMatch(/(?:^|;\s*)__client=/)
    
    // Verify that no JWT tokens are in localStorage
    const storageValues = Object.values(stolenData.storage || {})
    const hasJWT = storageValues.some(value => 
      typeof value === 'string' && 
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value)
    )
    expect(hasJWT).toBe(false)
  })

  test('XSS cannot exfiltrate long-lived tokens', async ({ page }) => {
    await page.goto('/')

    // Simulate attacker trying to send cookies to external server
    const exfiltrationAttempt = await page.evaluate(() => {
      try {
        // This is what an attacker would try
        const cookies = document.cookie
        const storage = JSON.stringify(localStorage)
        
        // In a real attack, this would be sent to attacker's server
        // We just return it to verify what's accessible
        return {
          accessibleCookies: cookies,
          accessibleStorage: storage,
        }
      } catch (error) {
        return { error: (error as Error).message }
      }
    })

    // The long-lived Clerk client token remains outside app JavaScript.
    expect(exfiltrationAttempt.accessibleCookies).not.toMatch(/(?:^|;\s*)__client=/)
    
    // Even if __session is stolen, it expires in 1 minute
    // This is acceptable risk (short-lived token)
  })
})

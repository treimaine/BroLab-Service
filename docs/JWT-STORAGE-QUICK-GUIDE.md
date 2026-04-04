# JWT Storage Quick Guide for Developers

**TL;DR:** Clerk handles JWT storage securely. You don't need to do anything. Just use Clerk's hooks and helpers.

---

## ✅ What You Should Do

### Server-Side (Next.js Server Components, API Routes)

```typescript
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    return <p>Please sign in</p>
  }
  
  return <p>Welcome, user {userId}</p>
}
```

### Client-Side (React Components)

```typescript
'use client'
import { useAuth, useUser } from '@clerk/nextjs'

export default function Component() {
  const { userId, isSignedIn } = useAuth()
  const { user } = useUser()
  
  if (!isSignedIn) {
    return <p>Please sign in</p>
  }
  
  return <p>Welcome, {user?.firstName}</p>
}
```

### Making Authenticated API Requests

```typescript
// Same-origin requests (automatic)
const response = await fetch('/api/protected')
// Clerk automatically includes session cookie

// Cross-origin requests (manual)
import { auth } from '@clerk/nextjs/server'

const { getToken } = await auth()
const token = await getToken()

const response = await fetch('https://api.example.com/data', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

---

## ❌ What You Should NOT Do

### DON'T Store Tokens Manually

```typescript
// ❌ NEVER DO THIS
localStorage.setItem('jwt', token)
sessionStorage.setItem('auth_token', token)
document.cookie = `token=${jwt}`

// ✅ DO THIS INSTEAD
// Nothing! Clerk handles it automatically
```

### DON'T Extract Tokens from Cookies

```typescript
// ❌ NEVER DO THIS
const token = document.cookie.split('__session=')[1]

// ✅ DO THIS INSTEAD
import { useAuth } from '@clerk/nextjs'
const { getToken } = useAuth()
const token = await getToken()
```

### DON'T Manually Refresh Tokens

```typescript
// ❌ NEVER DO THIS
setInterval(() => {
  refreshToken()
}, 60000)

// ✅ DO THIS INSTEAD
// Nothing! Clerk refreshes automatically
```

---

## 🔍 How to Verify Security

### Browser DevTools Check

1. Open DevTools → Application → Cookies
2. Check `.clerk.accounts.dev` domain
3. Verify `__client_uat` has **HttpOnly** flag ✅

### Console Check

```javascript
// In browser console
console.log(localStorage)
// Should NOT contain: jwt, token, auth

console.log(document.cookie)
// Should see: __session (short-lived, OK)
// Should NOT see: __client_uat (httpOnly, secure)
```

---

## 🛡️ Security Features (Automatic)

| Feature | Status | Benefit |
|---------|--------|---------|
| HttpOnly cookies | ✅ Enabled | XSS protection |
| Short-lived tokens | ✅ 1 minute | Minimal exposure |
| SameSite cookies | ✅ Lax | CSRF protection |
| Automatic refresh | ✅ Enabled | Seamless UX |
| Secure flag (prod) | ✅ Enabled | HTTPS only |

---

## 📚 Common Questions

### Q: Where are JWT tokens stored?

**A:** In httpOnly cookies managed by Clerk. You can't access them via JavaScript (that's the point - security).

### Q: Can I store the JWT in localStorage for convenience?

**A:** **NO.** This defeats the entire security model. Use Clerk's hooks instead.

### Q: How do I pass the token to my API?

**A:** For same-origin requests, it's automatic. For cross-origin, use `getToken()` from Clerk.

### Q: What if I need the token for debugging?

**A:** Use Clerk Dashboard → Sessions to view active sessions. Never log tokens in production.

### Q: How do I invalidate a session?

**A:** Use Clerk Dashboard or call `signOut()` from `useClerk()` hook.

---

## 🚨 Security Checklist

Before deploying to production:

- [ ] No `localStorage.setItem('token', ...)` in codebase
- [ ] No `sessionStorage.setItem('jwt', ...)` in codebase
- [ ] No manual cookie manipulation
- [ ] Using Clerk hooks (`useAuth`, `useUser`, `auth()`)
- [ ] HTTPS enforced in production
- [ ] Secrets rotated from development

---

## 📖 Further Reading

- [Clerk XSS Protection](https://clerk.com/docs/guides/secure/best-practices/xss-leak-protection)
- [Clerk Cookie Documentation](https://clerk.com/docs/guides/how-clerk-works/cookies)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

**Remember:** If you're manually handling JWT tokens, you're probably doing it wrong. Let Clerk handle it.

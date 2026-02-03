# Playwright Setup on Windows

## Problem

Playwright (browser_subagent) requires the `$HOME` environment variable to initialize, but this variable is not set by default on Windows systems.

**Error message:**
```
La variable d'environnement $HOME n'est pas définie
```

## Solution

Add the `HOME` environment variable to your `.env.local` file:

```env
# System Environment (for Playwright/browser tools)
# Windows: Set to your user profile directory
HOME=C:\Users\%USERNAME%
```

## Alternative Solutions

### Option 1: Set in System Environment Variables (Permanent)

1. Open **System Properties** → **Advanced** → **Environment Variables**
2. Add a new **User variable**:
   - Variable name: `HOME`
   - Variable value: `C:\Users\YourUsername` (replace with your actual username)
3. Restart your terminal/IDE

### Option 2: Set in PowerShell Profile (Session-based)

Add to your PowerShell profile (`$PROFILE`):

```powershell
$env:HOME = $env:USERPROFILE
```

### Option 3: Set in Current Session (Temporary)

Run before starting the dev server:

```powershell
$env:HOME = $env:USERPROFILE
npm run dev
```

## Verification

Check if `HOME` is set:

```powershell
echo $env:HOME
```

Should output something like: `C:\Users\YourUsername`

## Why This Matters

- Playwright uses `$HOME` to store browser binaries and cache
- Without it, Playwright cannot initialize properly
- This affects browser automation tools like Antigravity

## Related Files

- `.env.local` - Contains the `HOME` variable
- `.env.example` - Should be updated to include this for new developers

## References

- [Playwright Installation](https://playwright.dev/docs/intro)
- [Environment Variables on Windows](https://docs.microsoft.com/en-us/windows/win32/procthread/environment-variables)

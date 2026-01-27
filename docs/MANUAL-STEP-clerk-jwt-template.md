# 🔴 MANUAL STEP REQUIRED: Create Clerk JWT Template

## ⚠️ Action Required

This is a **manual step** that must be completed in the Clerk Dashboard.

## Quick Instructions

### 1. Access Clerk Dashboard
🔗 Go to: https://dashboard.clerk.com

### 2. Navigate to JWT Templates
- Select your application: **BroLab Entertainment**
- Click **JWT Templates** in the sidebar

### 3. Create New Template
- Click **New template** button
- Select **Convex** from the template options

### 4. Verify Template Name
🚨 **CRITICAL**: The template name MUST be exactly `convex`
- Do NOT rename it
- Convex SDK expects this exact name
- Renaming will break authentication

### 5. Verify Issuer URL
The Issuer URL should be:
```
https://natural-rattler-88.clerk.accounts.dev
```

This should match the `CLERK_JWT_ISSUER_DOMAIN` in your `.env.local` file.

### 6. Save Template
Click **Save** or **Create** to finalize the template.

## Verification

After creating the template:

1. **Check the template list:**
   - [ ] Template named `convex` appears in the list
   - [ ] Status is active/enabled

2. **Verify Issuer URL:**
   - [ ] Matches environment variable exactly
   - [ ] No typos or extra characters

3. **Test the integration:**
   ```bash
   # Sync Convex configuration
   npx convex dev
   
   # Start Next.js dev server
   npm run dev
   ```

4. **Test authentication:**
   - [ ] Sign in with Clerk
   - [ ] Check browser console for errors
   - [ ] Verify `useConvexAuth()` returns `isAuthenticated: true`

## Why This Step is Manual

- JWT template creation requires Clerk Dashboard UI
- Cannot be automated via API or CLI
- Requires visual confirmation of template name
- One-time setup per environment (dev/prod)

## Troubleshooting

### Issue: Can't find JWT Templates section

**Solution:**
- Ensure you're in the correct Clerk application
- Check you have admin/owner permissions
- Try refreshing the dashboard

### Issue: Template name is not "convex"

**Solution:**
- Delete the template
- Create a new one using the Convex template option
- Do NOT manually rename it

### Issue: Issuer URL doesn't match

**Solution:**
- Copy the Issuer URL from Clerk Dashboard
- Update `.env.local` with the correct URL
- Restart both dev servers

## Next Steps

After completing this manual step:

1. ✅ Mark this step as complete
2. ⏭️ Continue to Task 5.8 (Convex Providers configuration)
3. ⏭️ Test authentication flow end-to-end

## Documentation

For detailed instructions, see:
- `docs/clerk-jwt-convex-setup.md` - Complete setup guide
- `docs/clerk-jwt-verification-checklist.md` - Verification checklist
- `docs/quick-start-clerk-convex.md` - Quick reference

## Status Tracking

- [ ] JWT template created in Clerk Dashboard
- [ ] Template name verified as `convex`
- [ ] Issuer URL verified
- [ ] Convex synced successfully
- [ ] Authentication tested and working

---

**Priority:** 🔴 HIGH - Required for authentication to work
**Estimated Time:** 5 minutes
**Difficulty:** Easy (just follow the steps)

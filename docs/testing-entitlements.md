# Testing Entitlements in Convex Dashboard

## Verification Completed ✅

**Date:** January 27, 2026
**Task:** P0.1.2 - Verify entitlements.ts compiles

### Compilation Status

✅ **SUCCESS** - `convex/platform/entitlements.ts` compiles without errors

**Evidence:**
```
✔ Convex functions ready! (1.44s)
```

No import errors detected. All imports from `./billing/plans` work correctly.

### Available Queries

The following queries are now available in the Convex dashboard:

1. **`platform.entitlements.getWorkspacePlanQuery`**
   - Args: `{ workspaceId: Id<"workspaces"> }`
   - Returns: `WorkspacePlan` with status and features

2. **`platform.entitlements.getRemainingQuotaQuery`**
   - Args: `{ workspaceId: Id<"workspaces">, metric: "tracks" | "storage" | "domains" }`
   - Returns: Remaining quota (number or Infinity)

3. **`platform.entitlements.hasFeatureQuery`**
   - Args: `{ workspaceId: Id<"workspaces">, key: "maxPublishedTracks" | "storageGb" | "maxCustomDomains" }`
   - Returns: `boolean`

4. **`platform.entitlements.getUsageStats`**
   - Args: `{ workspaceId: Id<"workspaces"> }`
   - Returns: Usage statistics

## Testing in Convex Dashboard

### Step 1: Open Dashboard

```bash
npx convex dashboard
```

This opens: `https://dashboard.convex.dev/d/famous-starling-265`

### Step 2: Navigate to Functions

1. Click on **"Functions"** in the left sidebar
2. Find `platform/entitlements.ts` in the file tree
3. Select `getWorkspacePlanQuery`

### Step 3: Test Query

**Prerequisites:**
- You need a valid workspace ID from the `workspaces` table
- To get a workspace ID, first query the `workspaces` table in the Data tab

**Example Test (once you have a workspace):**

```json
{
  "workspaceId": "jd7abc123def456" 
}
```

**Expected Response (no subscription):**
```json
{
  "planKey": null,
  "status": null,
  "features": {
    "maxPublishedTracks": 0,
    "storageGb": 0,
    "maxCustomDomains": 0
  }
}
```

**Expected Response (with active subscription):**
```json
{
  "planKey": "basic",
  "status": "active",
  "features": {
    "maxPublishedTracks": 25,
    "storageGb": 1,
    "maxCustomDomains": 0
  }
}
```

## Implementation Details

### Import Structure ✅

```typescript
// CORRECT - Same runtime import
import { PLAN_FEATURES, PlanFeatures } from "./billing/plans";
```

This import works because:
- Both files are in the Convex runtime
- No cross-runtime imports (Convex → src/)
- Follows the architecture rules from Requirement 5.5

### Core Functions

1. **`getWorkspacePlan(ctx, workspaceId)`** - Internal function
   - Used by mutations/actions for authorization
   - Returns plan snapshot with features

2. **`assertEntitlement(ctx, workspaceId, key)`** - Feature gating
   - Throws error if feature not available
   - Used before feature-specific operations

3. **`assertQuota(ctx, workspaceId, metric)`** - Usage limits
   - Throws error if quota exceeded
   - Used before operations that consume quota

### Helper Functions

- `hasActiveSubscription()` - Check if subscription is active
- `getRemainingQuota()` - Get remaining quota for a metric
- `hasFeature()` - Check if feature is available (non-throwing)
- `hasQuota()` - Check if quota is available (non-throwing)

## Next Steps

1. ✅ Compilation verified
2. ✅ Dashboard accessible
3. ⏭️ Create test workspace data (Phase 4)
4. ⏭️ Test queries with real data
5. ⏭️ Implement provider mutations using these functions

## Related Files

- `convex/platform/entitlements.ts` - Main implementation
- `convex/platform/billing/plans.ts` - Plan definitions (source of truth)
- `convex/schema.ts` - Database schema
- `.kiro/specs/brolab-entertainment/design.md` - Architecture documentation

## Requirements Satisfied

✅ **Requirement 5.5** - Cross-Runtime Import Rules
- No Convex imports from src/
- Plans source of truth in Convex
- Frontend uses queries only

✅ **Requirement 6** - Centralized Access Control
- `getWorkspacePlan()` implemented
- `assertEntitlement()` implemented
- `assertQuota()` implemented
- Server-side enforcement ready

# ESLint Configuration Migration

## Date: 2026-01-08

## Changes Made

### 1. Removed Legacy Config
- Deleted `.eslintrc.json` (legacy format)
- Kept `eslint.config.mjs` (flat config format)

### 2. Updated Configuration
The project now uses `@next/eslint-plugin-next` directly instead of `eslint-config-next` because:
- `eslint-config-next` still uses the legacy `extends` format
- Direct plugin usage is compatible with ESLint 9 flat config
- Provides same rules as `eslint-config-next/core-web-vitals`

### 3. Configuration Structure

```javascript
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Next.js + React + TypeScript rules
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // Custom overrides...
    }
  }
);
```

### 4. Custom Rules Preserved
- Glass styles restriction (only in `src/platform/ui/`)
- TypeScript rules customization
- Node.js globals for scripts

### 5. Ignores
- `.next/**`
- `node_modules/**`
- `dist/**`
- `convex/_generated/**`
- `.brv/**`
- `.agent/**`
- `next-env.d.ts`
- `out/**`
- `build/**`

## Testing

```bash
npm run lint
```

Current status: ✅ 0 errors, 5 warnings (unused variables in test files)

## Future Migration

When `eslint-config-next` supports flat config natively, we can migrate to:

```javascript
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default [
  nextVitals,
  nextTs,
  // Custom rules...
];
```

## References

- [Next.js ESLint Documentation](https://nextjs.org/docs/app/api-reference/config/eslint)
- [ESLint Flat Config Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)

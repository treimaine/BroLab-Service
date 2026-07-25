# Code Deletion Log

## 2026-07-25 Refactor Session

### Duplicate Code Consolidated

- `app/(hub)/(marketing)/privacy/page.tsx` now delegates its unchanged legal content to `src/components/hub/PrivacyPageClient.tsx`.
- `app/(hub)/(marketing)/terms/page.tsx` now delegates its unchanged legal content to `src/components/hub/TermsPageClient.tsx`.
- Pricing FAQ content is centralized in `src/components/hub/pricing-content.ts` and shared by the page JSON-LD schema and visible FAQ.

### Safety

- No functional component, route, dependency, or public export was removed.
- Privacy and terms content was confirmed identical before consolidation.
- Next.js metadata and JSON-LD remain server-rendered by their route pages.

### Impact

- Files deleted: 0
- Dependencies removed: 0
- Duplicate implementations consolidated: 3
- Source lines removed (net): 782
- Detected duplicated lines reduced: 1,028 to 209
- Duplication rate reduced: 3.50% to 0.73%

### Testing

- Baseline lint: passed
- Baseline TypeScript check: passed
- Baseline unit tests: 33 passed
- Baseline production build: passed
- Post-refactor lint: passed
- Post-refactor TypeScript check: passed
- Post-refactor unit tests: 33 passed
- Post-refactor integration tests: 1 passed
- Post-refactor production build: passed
- Static output checks for `/privacy`, `/terms`, and `/pricing`: passed

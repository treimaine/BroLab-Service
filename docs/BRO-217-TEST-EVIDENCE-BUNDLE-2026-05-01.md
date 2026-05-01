# BRO-217 Test Evidence Bundle

Date: 2026-05-01
Issue: BRO-217
Scope: Deliver 5 green auth + 1 green auth+checkout
Executor: CTO agent 3b069e49-39b1-4984-b227-2c805895a576

## Command Executed

```bash
npx playwright test --project=chromium tests/e2e/auth/sign-in.spec.ts tests/e2e/checkout-flow.spec.ts --grep "should expose sign-in route|should navigate to sign-in page|should load Clerk sign-in component|should show email and password fields|should show error for invalid credentials|should complete track purchase end-to-end"
```

## Result Summary

- Total selected tests: 6
- Passed: 6
- Failed: 0
- Skipped: 0
- Run duration: 31.686s
- Run start (UTC): 2026-05-01T12:31:29.123Z

## Green Auth Tests (5)

1. `tests/e2e/auth/sign-in.spec.ts:20` `should expose sign-in route` (4.806s)
2. `tests/e2e/auth/sign-in.spec.ts:25` `should navigate to sign-in page` (0.969s)
3. `tests/e2e/auth/sign-in.spec.ts:34` `should load Clerk sign-in component` (2.808s)
4. `tests/e2e/auth/sign-in.spec.ts:46` `should show email and password fields` (2.770s)
5. `tests/e2e/auth/sign-in.spec.ts:98` `should show error for invalid credentials` (2.691s)

## Green Auth+Checkout Test (1)

1. `tests/e2e/checkout-flow.spec.ts:76` `should complete track purchase end-to-end` (5.629s)

## Evidence Artifacts

- JSON report: `test-results/results.json`
- JUnit report: `test-results/results.xml`
- Last run marker: `test-results/.last-run.json`
- HTML report: `playwright-report/index.html`

## Notes

- Non-blocking warning observed from Next.js dev server: middleware file convention deprecation (`middleware` -> `proxy`).
- Non-blocking Clerk dev-key warning observed in browser console.

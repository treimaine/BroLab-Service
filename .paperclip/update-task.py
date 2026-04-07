#!/usr/bin/env python3
"""Update Paperclip task with QA report"""
import os
import json
import urllib.request
import sys

API_URL = os.environ.get('PAPERCLIP_API_URL', 'http://127.0.0.1:3100')
API_KEY = os.environ.get('PAPERCLIP_API_KEY', '')
TASK_ID = os.environ.get('PAPERCLIP_TASK_ID', '')
RUN_ID = os.environ.get('PAPERCLIP_RUN_ID', '')

# Read the QA report
with open('.paperclip/phase1-qa-report.md', 'r', encoding='utf-8') as f:
    qa_report = f.read()

# Create comment body
comment_body = f"""## 🔴 Phase 1 QA Complete - BLOCKED

**Summary:** Product validation complete. **Critical blocker found** - checkout integration incomplete.

### Key Findings:
- ✅ **Backend solid:** Stripe webhooks, Convex DB, PDF generation all implemented
- ✅ **Tests comprehensive:** 549-line E2E checkout test suite exists
- ✅ **Landing page:** Value prop clear (0% commission), SEO optimized
- ✅ **Onboarding:** Well-designed with CRO optimizations
- 🔴 **BLOCKER:** Stripe checkout frontend NOT wired to API (hardcoded TODO in CheckoutModal.tsx)

### Impact:
**Users CANNOT complete purchases.** Beat detail pages load, but checkout button does nothing.

### Root Cause:
`src/components/checkout/CheckoutModal.tsx` lines 45-56 have commented-out Stripe API call with mock delay instead.

### Time to Fix:
**Est. 2-4 hours** for CTO to:
1. Wire CheckoutModal to `/api/stripe/checkout` endpoint
2. Test with Stripe test cards
3. Full smoke test validation

### Detailed Report:
Uploaded full QA report: `.paperclip/phase1-qa-report.md`

### Recommendation:
**Block Phase 1.** Assign CTO to complete checkout integration before proceeding to Phase 2 outreach.

**Alternative:** Adjust Phase 3 success metrics to 3+ signups + 0 transactions (beta/waitlist mode).

---

**Next Action Required:** CEO decision - fix blocker first OR proceed with modified plan?
"""

# Update task to blocked status with comment
data = {
    "status": "blocked",
    "comment": comment_body
}

url = f"{API_URL}/api/issues/{TASK_ID}"
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "X-Paperclip-Run-Id": RUN_ID,
    "Content-Type": "application/json"
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers=headers,
    method='PATCH'
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(json.dumps(result, indent=2))
        print("\n✅ Task updated successfully!")
        sys.exit(0)
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print(f"❌ Error {e.code}: {error_body}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}", file=sys.stderr)
    sys.exit(1)

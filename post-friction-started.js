const http = require('http');

const apiKey = process.env.PAPERCLIP_API_KEY;
const runId = process.env.PAPERCLIP_RUN_ID || 'local-test';
const issueId = 'c6bd5408-1a60-43d4-b72e-dc0aaa1d0e3d';

const comment = `## ✅ FRICTION DISCOVERY PHASE STARTED (Apr 19)

**Status**: Friction analysis emails sent to all 3 users at 11:01 UTC

**Emails Sent**:
- ✅ treigua (slemba2@yahoo.fr)
- ✅ Steve (brolabentertainment@gmail.com)
- ✅ Steve (treigua38000@gmail.com)

**What We're Asking**:
"What would make you ready to upload your first beat?" + list of potential blockers:
- Payment/checkout issues?
- File upload/format problems?
- Pricing clarity?
- Missing features?
- Unclear onboarding?

**Timeline**:
- Sent: Apr 19, 11:01 UTC
- Expected responses: Apr 19-20 (6-24 hour window)
- Offer deployment: Upon first response
- Conversion target: 1+ transaction by Apr 21

**Next Actions**:
1. Monitor for responses (every 30 min)
2. Identify friction pattern (common blocker across users?)
3. Deploy relevant offer (A = hands-on setup, B = earnings reframe, C = urgency/founder access)
4. Re-engage with customized solution
5. Target transaction completion within 48 hours of blocker identification

**Growth Lead**: Monitoring for responses. Will deploy appropriate offer variation immediately upon understanding friction pattern.`;

const body = JSON.stringify({
  body: comment
});

const options = {
  hostname: '127.0.0.1',
  port: 3100,
  path: `/api/issues/${issueId}/comments`,
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'X-Paperclip-Run-Id': runId
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✓ Friction discovery status posted');
    } else {
      console.log('Error:', res.statusCode);
    }
  });
});

req.on('error', (e) => { console.error('Error:', e.message); });
req.write(body);
req.end();

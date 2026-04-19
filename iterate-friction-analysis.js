const http = require('http');

const apiKey = process.env.PAPERCLIP_API_KEY;
const runId = process.env.PAPERCLIP_RUN_ID || 'local-test';
const issueId = 'c6bd5408-1a60-43d4-b72e-dc0aaa1d0e3d';

const comment = `## 🔄 ITERATE PATH ACTIVATED - Friction Analysis & Re-Outreach (Apr 19-21)

**Status Update**: Acknowledged new direction. Executing friction analysis immediately.

**Progress So Far**:
✅ 3 users signed up (from initial campaign)
❌ 0 transactions (conversion blocker identified)

**Current Task**: Find and remove friction blocking the purchase

---

## STEP 1: Friction Root Cause Discovery

Sending direct friction analysis questions to all 3 users:

**Message Template**:
\`\`\`
Hey [name]! Quick question — what would make you ready to upload your first beat to BroLab?

Any blockers with:
- Payment/checkout process?
- File upload/format?
- Pricing clarity?
- Feature missing?
- Onboarding unclear?

Just want to make sure we remove whatever's in the way.
\`\`\`

**Target**: Get specific friction feedback from each user within 24 hours

---

## STEP 2: Offer Variations (Prepared)

Based on feedback, I'll deploy one of 3 offers:

### Offer A - Remove Friction (Hands-On Setup)
\`\`\`
Let me do the setup FOR you. Send me:
- Your 1 best beat file
- Price you want to charge

I'll upload it, get the checkout link, and you're live in 5 minutes. 0 friction, full control.
\`\`\`
*Use when: Technical complexity is blocker*

### Offer B - Value Reframe (Earnings Guarantee)
\`\`\`
Here's the real difference: on Beatstars, a $50 sale = $35 to you. Here, $50 = $50 to you.

That's $150/month difference if you do 10 sales. Let me help you get those first 10.
\`\`\`
*Use when: Platform skepticism/economics unclear*

### Offer C - Urgency (Founder Access Window)
\`\`\`
Quick context: I'm doing founder-level setup assistance for early users (limited time). This means:
- Direct setup help
- Real-time chat during first sale
- Custom pricing strategy

Want to grab this window while it's open?
\`\`\`
*Use when: User needs activation energy/FOMO*

---

## STEP 3: Execution Timeline

**Today (Apr 19)**:
- [ ] Send friction discovery message to all 3 users
- [ ] Monitor for responses (expect within 6-24 hours)
- [ ] Document friction points found

**Apr 20**:
- [ ] Execute relevant offer variation based on feedback
- [ ] Re-engage with customized removal strategy
- [ ] Drive to first transaction

**Apr 21**:
- [ ] Final push if needed
- [ ] Target: 1+ transaction from original 3 users
- [ ] Track any new signups from Week 2 campaigns

---

## Success Definition

**By Apr 21 midnight**:
- ✅ Convert 1+ original user → Transaction
- OR ✅ Convert any new Week 2 signups → Transactions
- = ITERATE continues to next phase

**If 0 transactions by Apr 21**:
- ⚠️ Signal to pivot to new channels
- Friction analysis reveals systemic issue requiring product/pricing change

---

**Growth Lead**: Executing friction discovery now. Standing by for responses.`;

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
      console.log('✓ Iterate strategy posted on BRO-149');
    } else {
      console.log('Error:', res.statusCode);
      console.log(data.substring(0, 300));
    }
  });
});

req.on('error', (e) => { console.error('Error:', e.message); });
req.write(body);
req.end();

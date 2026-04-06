# BroLab Bug Report Template

**Use this template when reporting bugs in GitHub Issues or Paperclip tasks.**

---

## Bug Information

**Bug ID:** BRO-XXX  
**Reporter:** [Your Name/Role]  
**Date Reported:** YYYY-MM-DD  
**Environment:** ☐ Production ☐ Staging ☐ Development ☐ Local

---

## Priority & Classification

**Priority:** ☐ P0 (Critical) ☐ P1 (High) ☐ P2 (Medium) ☐ P3 (Low)

**Category:**
- ☐ Authentication/Authorization
- ☐ Payment/Checkout
- ☐ Audio Upload/Processing
- ☐ Audio Playback/Download
- ☐ UI/UX
- ☐ Performance
- ☐ Security
- ☐ Data Integrity
- ☐ API/Backend
- ☐ Third-Party Integration (Stripe, Clerk, Convex)
- ☐ Other: _______________

**Affected User Type:**
- ☐ Music Producer (Seller)
- ☐ Artist (Buyer)
- ☐ Admin
- ☐ All Users

---

## Summary

**Title:** [One-line description of the bug]

**Description:** [Brief description of what's broken and the impact]

---

## Steps to Reproduce

1. [First step]
2. [Second step]
3. [Third step]
4. ...

**Preconditions:** [Any setup required before reproducing]

---

## Expected Behavior

[Describe what should happen]

---

## Actual Behavior

[Describe what actually happens]

---

## Impact Assessment

**User Impact:**
- ☐ Blocks all users
- ☐ Blocks subset of users
- ☐ Degrades experience
- ☐ Minor inconvenience

**Business Impact:**
- ☐ Revenue loss
- ☐ Security risk
- ☐ Data loss risk
- ☐ Reputational damage
- ☐ Minimal impact

**Workaround Available:** ☐ Yes ☐ No

**Workaround:** [Describe workaround if available]

---

## Technical Details

### Environment Information

**Browser:** [Chrome 120, Safari 17, etc.]  
**OS:** [Windows 11, macOS 14, iOS 17, Android 14]  
**Device:** [Desktop, iPhone 15, Samsung Galaxy, etc.]  
**Screen Size:** [1920x1080, 375x667, etc.]  
**Network:** [WiFi, 4G, 5G, Slow 3G]

### Error Messages

```
[Paste any error messages, stack traces, or console errors]
```

### Screenshots/Videos

[Attach screenshots or screen recordings showing the bug]

### Network Requests (If Applicable)

**Failed Request:**
```
URL: https://brolab.com/api/...
Method: POST
Status: 500
Response: {...}
```

---

## Music-Specific Details (If Applicable)

### Audio File Information

**File Format:** ☐ WAV ☐ MP3 ☐ FLAC ☐ Other: _______  
**File Size:** _____ MB  
**Sample Rate:** _____ Hz  
**Bit Rate:** _____ kbps  
**Duration:** _____ minutes  
**BPM:** _____  
**Key:** _____

### Payment Details (If Applicable)

**Beat Price:** $______  
**Expected Producer Revenue:** $______ (100% of price)  
**Actual Producer Revenue:** $______  
**Stripe Charge ID:** `ch_xxxxx`  
**Payment Status:** [Succeeded, Failed, Pending, Refunded]

---

## Additional Context

**Related Issues:** [Link to related bugs or feature requests]

**Recent Changes:** [Was this working before? What changed?]

**Frequency:** 
- ☐ Always reproduces
- ☐ Intermittent (___% of the time)
- ☐ Only in specific conditions

**First Occurrence:** [When was this first noticed?]

---

## Investigation Notes (QA/Dev Use)

**Root Cause:** [To be filled by investigating developer]

**Affected Code:** [File paths and line numbers]

**Proposed Fix:** [Brief description of the fix]

**Testing Notes:** [How to verify the fix]

---

## Resolution

**Status:** ☐ Open ☐ In Progress ☐ Fixed ☐ Closed ☐ Won't Fix

**Fixed In:** Version v_______  
**Fixed By:** [Developer name]  
**Fix PR:** #XXX  
**Deployed:** YYYY-MM-DD

**Verification:**
- [ ] Fix verified in staging
- [ ] Fix verified in production
- [ ] Regression tests added
- [ ] QA sign-off

**Regression Test:** [Link to test or test case]

---

## Example Bug Reports

### Example 1: P0 Payment Bug

**Title:** Stripe checkout fails for all users, preventing purchases

**Priority:** P0 (Critical)  
**Category:** Payment/Checkout  
**Environment:** Production

**Summary:**
All checkout attempts are failing with a 500 error. No users can complete purchases.

**Steps to Reproduce:**
1. Navigate to any producer storefront
2. Add a beat to cart
3. Click "Checkout"
4. Enter payment details
5. Click "Pay Now"
6. Error: "Payment processing failed"

**Expected:** Payment should succeed, beat should be delivered  
**Actual:** 500 error, no charge created in Stripe

**Impact:** Revenue loss, all users affected, no workaround

**Error:**
```
POST /api/stripe/checkout
Status: 500
Error: "Cannot read property 'id' of undefined"
```

**Affected Users:** 100% of buyers

---

### Example 2: P2 UI Bug

**Title:** Waveform visualization doesn't display on Safari mobile

**Priority:** P2 (Medium)  
**Category:** UI/UX  
**Environment:** Production

**Summary:**
Beat preview waveforms are not rendering on Safari mobile browsers.

**Steps to Reproduce:**
1. Open producer storefront on iPhone Safari
2. Click on a beat to preview
3. Audio plays correctly
4. Waveform area is blank

**Expected:** Waveform visualization should display  
**Actual:** Blank canvas, no waveform

**Impact:** Degrades user experience for mobile Safari users (~15% of traffic)

**Workaround:** Audio playback still works, waveform is aesthetic only

**Browser:** Safari 17.3 (iOS 17.3)  
**Device:** iPhone 15 Pro  
**Screen Size:** 393x852

---

### Example 3: P1 Audio Bug

**Title:** WAV files over 50MB fail to upload with timeout error

**Priority:** P1 (High)  
**Category:** Audio Upload/Processing  
**Environment:** Production

**Summary:**
Producers cannot upload high-quality WAV files larger than 50MB.

**Steps to Reproduce:**
1. Sign in as producer
2. Navigate to studio/tracks
3. Click "Upload Beat"
4. Select WAV file >50MB
5. Upload starts, progress bar reaches 95%
6. Error: "Upload timeout"

**Expected:** Upload should complete (100MB limit)  
**Actual:** Timeout at ~50MB

**Audio File Info:**
- Format: WAV
- Size: 75 MB
- Sample Rate: 96000 Hz
- Bit Rate: 2304 kbps
- Duration: 4:32 minutes

**Impact:** Blocks producers from uploading high-quality masters

**Affected Users:** ~10% of producers (those using 96kHz WAV)

---

## Questions?

Contact QA Lead via [BRO-78](/BRO/issues/BRO-78)

**Last Updated:** 2026-04-06  
**Version:** 1.0

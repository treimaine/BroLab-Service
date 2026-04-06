# BroLab Test Case Template

**Use this template for manual test cases and UAT scenarios.**

---

## Test Case Information

**Test ID:** TC-XXX  
**Test Name:** [Descriptive name]  
**Created By:** [QA Lead / Developer]  
**Date Created:** YYYY-MM-DD  
**Last Updated:** YYYY-MM-DD

**Test Type:**
- ☐ Functional
- ☐ Integration
- ☐ Regression
- ☐ Performance
- ☐ Security
- ☐ UAT (User Acceptance)

**Test Level:**
- ☐ Unit
- ☐ Integration
- ☐ System
- ☐ End-to-End

**Priority:** ☐ P0 (Critical Path) ☐ P1 (High) ☐ P2 (Medium) ☐ P3 (Low)

---

## Test Scope

**Feature:** [Feature name/module]  
**User Story:** [Link to user story or requirement]  
**Related Issue:** [BRO-XXX]

**Objective:** [What is this test validating?]

---

## Preconditions

**Setup Required:**
- [ ] Test account created
- [ ] Test data prepared
- [ ] Stripe test mode enabled
- [ ] Specific browser/device
- [ ] Network conditions
- [ ] Other: ___________

**Test Data:**
```
User: test-producer@example.com
Password: [Test password]
Beat File: test-beat-128bpm-cmajor.wav (10MB)
Price: $25.00
```

---

## Test Steps

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | [Action description] | [What should happen] | [What actually happened] | ☐ Pass ☐ Fail |
| 2 | [Action description] | [What should happen] | [What actually happened] | ☐ Pass ☐ Fail |
| 3 | [Action description] | [What should happen] | [What actually happened] | ☐ Pass ☐ Fail |
| ... | ... | ... | ... | ... |

---

## Expected Results

[Overall expected outcome of the test]

---

## Test Data

[Any specific data needed for the test]

---

## Environment

**Browser:** [Chrome 120, Safari 17, etc.]  
**OS:** [Windows 11, macOS 14, iOS 17]  
**Device:** [Desktop, iPhone 15, etc.]  
**Screen Size:** [1920x1080, 375x667]  
**Network:** [WiFi, 4G, 5G, Throttled]

---

## Test Execution

**Executed By:** [Tester name]  
**Execution Date:** YYYY-MM-DD  
**Execution Time:** HH:MM  
**Environment:** ☐ Production ☐ Staging ☐ Development

**Overall Result:** ☐ Pass ☐ Fail ☐ Blocked ☐ Skipped

**Notes/Comments:**
[Any observations, issues, or additional context]

**Defects Found:** [Link to bug reports]

---

## Test Coverage

**Covered Scenarios:**
- ☐ Happy path
- ☐ Alternative paths
- ☐ Edge cases
- ☐ Error handling
- ☐ Negative scenarios

---

## Example Test Cases

---

## TC-001: Producer Beat Upload - Happy Path

**Test Name:** Producer uploads beat successfully  
**Priority:** P0 (Critical Path)  
**Type:** End-to-End Functional

### Objective
Verify that a producer can upload a beat file, set metadata, and publish it to their storefront.

### Preconditions
- Producer account created and verified
- Producer signed in
- Test beat file ready (test-beat.wav, 15MB, 128 BPM, C Major)

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/studio/tracks` | Tracks dashboard loads, "Upload Beat" button visible |
| 2 | Click "Upload Beat" button | Upload modal opens |
| 3 | Click "Choose File" and select `test-beat.wav` (15MB) | File selected, name displays |
| 4 | Click "Start Upload" | Progress bar appears, upload starts |
| 5 | Wait for upload to complete | Upload reaches 100%, "Set Metadata" form appears |
| 6 | Fill metadata:<br>- Title: "Sunset Vibes"<br>- BPM: 128<br>- Key: C Major<br>- Genre: Hip-Hop<br>- Price: $35.00 | All fields accept input |
| 7 | Click "Publish Beat" | Success message, redirected to track details |
| 8 | Verify beat appears in track list | Beat listed with correct metadata |
| 9 | Navigate to tenant storefront | Beat visible on public storefront |
| 10 | Click beat to preview | Audio player works, waveform displays |

### Expected Result
Beat successfully uploaded, metadata saved, and visible on public storefront with working preview.

### Test Data
- File: `test-beat.wav` (44.1kHz, 320kbps, 15MB)
- Metadata: Title, BPM, Key, Genre, Price
- Expected upload time: <45 seconds

### Pass Criteria
- ✅ Upload completes without errors
- ✅ Metadata saved correctly
- ✅ Beat appears on storefront within 30 seconds
- ✅ Audio preview works
- ✅ Waveform visualizes correctly

---

## TC-002: Artist Beat Purchase - Complete Flow

**Test Name:** Artist purchases beat end-to-end  
**Priority:** P0 (Critical Path)  
**Type:** End-to-End Integration (Payment)

### Objective
Verify the complete purchase flow from discovery to download, including payment processing.

### Preconditions
- Producer has published beat ($25)
- Artist account created
- Stripe test mode enabled
- Test card: 4242 4242 4242 4242

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open producer storefront URL | Storefront loads, beats visible |
| 2 | Browse beat catalog | All beats display with preview buttons |
| 3 | Click "Preview" on $25 beat | Audio player opens, plays immediately |
| 4 | Click "Add to Cart" | Cart icon updates, item count shows "1" |
| 5 | Click cart icon | Cart modal opens, shows 1 item ($25) |
| 6 | Click "Checkout" | Redirected to Stripe Checkout |
| 7 | Enter test card: 4242 4242 4242 4242<br>Expiry: 12/34, CVC: 123 | Card accepted |
| 8 | Click "Pay Now" | Payment processing indicator |
| 9 | Wait for redirect | Redirected to success page with download link |
| 10 | Click "Download Beat" | High-quality WAV file downloads |
| 11 | Open downloaded file in DAW | File plays correctly, full quality |
| 12 | Check producer dashboard | Sale appears, revenue = $25.00 (100%) |

### Expected Result
Complete purchase successful, artist receives download, producer receives 100% revenue.

### Test Data
- Beat Price: $25.00
- Test Card: 4242 4242 4242 4242
- Expected Producer Revenue: $25.00 (0% commission)
- Expected File Format: WAV (high quality)

### Pass Criteria
- ✅ Checkout completes in <30 seconds
- ✅ Payment succeeds
- ✅ Download link generated instantly
- ✅ Downloaded file is high quality
- ✅ Producer receives 100% of $25
- ✅ Both parties receive email confirmation

---

## TC-003: Mobile Responsive - Beat Preview

**Test Name:** Beat preview works on mobile devices  
**Priority:** P1 (High)  
**Type:** Functional (Mobile)

### Objective
Verify beat preview and audio player work correctly on mobile devices.

### Preconditions
- Producer storefront live
- At least 3 beats published
- Testing on iOS/Android device

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open storefront URL on iPhone Safari | Page loads, responsive layout |
| 2 | Scroll through beat catalog | Smooth scrolling, all beats visible |
| 3 | Tap on beat card | Beat details expand |
| 4 | Tap "Play" button | Audio starts immediately |
| 5 | Verify audio controls | Play/pause, seek, volume visible and functional |
| 6 | Check waveform visualization | Waveform displays and animates |
| 7 | Tap "Add to Cart" | Cart updates, button changes to "In Cart" |
| 8 | Rotate device to landscape | Layout adjusts, player remains functional |
| 9 | Tap another beat while first is playing | First beat stops, second beat plays |

### Expected Result
All features work smoothly on mobile with optimized touch controls.

### Environment
- **Device:** iPhone 15 Pro (iOS 17.3)
- **Browser:** Safari
- **Screen:** 393x852 (portrait), 852x393 (landscape)
- **Network:** 4G LTE

### Pass Criteria
- ✅ Layout responsive and readable
- ✅ Touch targets ≥44x44px
- ✅ Audio plays without buffering
- ✅ Player controls work
- ✅ No horizontal scrolling
- ✅ Fast load (<3s)

---

## TC-004: Security - Payment Tampering Prevention

**Test Name:** Verify payment amount cannot be tampered  
**Priority:** P0 (Critical Security)  
**Type:** Security Test

### Objective
Attempt to tamper with payment amount and verify it's rejected server-side.

### Preconditions
- Stripe test mode enabled
- Browser DevTools available
- Beat priced at $50

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open beat catalog, add $50 beat to cart | Cart shows $50 |
| 2 | Open browser DevTools (Network tab) | Network monitoring active |
| 3 | Click "Checkout" | Stripe checkout initiated |
| 4 | Intercept checkout request | Request visible in Network tab |
| 5 | Attempt to modify amount from $50 to $1 | (Using proxy or DevTools) |
| 6 | Submit modified request | Server rejects with 400/403 error |
| 7 | Verify no charge created in Stripe | No charge for tampered amount |

### Expected Result
Server-side validation prevents price tampering, checkout fails with error.

### Pass Criteria
- ✅ Price validation happens server-side
- ✅ Tampered amount rejected
- ✅ Original price enforced
- ✅ No charge created for fake amount
- ✅ Error logged for security monitoring

---

## TC-005: Performance - Large File Upload

**Test Name:** Upload 100MB WAV file successfully  
**Priority:** P1 (High)  
**Type:** Performance Test

### Objective
Verify system handles max-size file upload within acceptable time.

### Preconditions
- Producer signed in
- Test file: 100MB WAV (96kHz, 32-bit, 5 minutes)
- Stable network connection

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/studio/tracks` | Upload UI loads |
| 2 | Select 100MB WAV file | File selected |
| 3 | Start upload, monitor progress | Progress bar updates smoothly |
| 4 | Record upload time | ≤60 seconds |
| 5 | Wait for processing | Processing indicator appears |
| 6 | Check beat details | Audio metadata extracted correctly |
| 7 | Play preview | Audio plays without issues |
| 8 | Download beat | Download completes, file intact |

### Expected Result
100MB file uploads and processes within 60 seconds.

### Test Data
- **File:** `large-test.wav`
- **Size:** 100 MB (max allowed)
- **Sample Rate:** 96000 Hz
- **Bit Depth:** 32-bit
- **Duration:** 5:00 minutes

### Pass Criteria
- ✅ Upload completes in ≤60 seconds
- ✅ No timeout errors
- ✅ File integrity maintained
- ✅ Metadata extracted correctly
- ✅ Preview generation successful

---

## TC-006: Accessibility - Keyboard Navigation

**Test Name:** Navigate checkout flow using keyboard only  
**Priority:** P2 (Medium)  
**Type:** Accessibility Test

### Objective
Verify entire checkout flow is accessible via keyboard (no mouse).

### Preconditions
- Beat in cart
- Keyboard only (no mouse)

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tab to cart icon | Focus visible on cart |
| 2 | Press Enter | Cart modal opens |
| 3 | Tab to "Checkout" button | Focus moves to button |
| 4 | Press Enter | Redirected to Stripe checkout |
| 5 | Tab through form fields | Focus moves logically |
| 6 | Fill card details using keyboard | All fields accessible |
| 7 | Tab to "Pay" button | Focus visible on button |
| 8 | Press Enter | Payment submits |
| 9 | After redirect, tab through success page | All links accessible |

### Expected Result
Complete flow navigable via keyboard, focus indicators always visible.

### Pass Criteria
- ✅ Logical tab order
- ✅ Focus indicators visible
- ✅ No keyboard traps
- ✅ All interactive elements reachable
- ✅ Enter key activates buttons
- ✅ Esc key closes modals

---

## Questions?

Contact QA Lead via [BRO-78](/BRO/issues/BRO-78)

**Last Updated:** 2026-04-06  
**Version:** 1.0

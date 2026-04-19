# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout-flow.spec.ts >> Stripe Checkout Flow - Happy Paths (P0) >> should complete service booking end-to-end
- Location: tests\e2e\checkout-flow.spec.ts:130:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 400
Received:   404
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - main [ref=e3]:
      - main [ref=e4]:
        - generic [ref=e5]:
          - generic:
            - generic:
              - generic: MUSIC MUSIC MUSIC MUSIC
              - generic: MUSIC MUSIC MUSIC MUSIC
              - generic: MUSIC MUSIC MUSIC MUSIC
              - generic: MUSIC MUSIC MUSIC MUSIC
              - generic: MUSIC MUSIC MUSIC MUSIC
              - generic: MUSIC MUSIC MUSIC MUSIC
              - generic: MUSIC MUSIC MUSIC MUSIC
              - generic: MUSIC MUSIC MUSIC MUSIC
          - generic:
            - img
          - generic:
            - img
          - generic [ref=e9]:
            - generic:
              - navigation
            - link "BROLAB" [ref=e10] [cursor=pointer]:
              - /url: /
            - generic [ref=e12]:
              - button "Switch to dark mode" [ref=e13]:
                - img [ref=e14]
              - generic [ref=e16]:
                - link "Sign In" [ref=e17] [cursor=pointer]:
                  - /url: /sign-in
                - link "Start Free →" [ref=e18] [cursor=pointer]:
                  - /url: /sign-up
                  - button "Start Free →" [ref=e19]:
                    - generic [ref=e20]:
                      - text: Start Free
                      - generic [ref=e21]: →
          - generic [ref=e24]:
            - generic [ref=e26]:
              - heading "LAUNCH" [level=1] [ref=e28]:
                - generic [ref=e29]: LAUNCH
                - generic [ref=e30]: LAUNCH
                - generic [ref=e31]: LAUNCH
                - text: LAUNCH
              - generic [ref=e32]:
                - generic [ref=e33]: FOR PRODUCERS & AUDIO ENGINEERS
                - heading "Launch your store. Sell your music. Get paid directly." [level=1] [ref=e34]
                - generic [ref=e35]:
                  - link "Start My Storefront" [ref=e36] [cursor=pointer]:
                    - /url: /sign-up
                    - button "Start My Storefront" [ref=e37]:
                      - generic [ref=e38]: Start My Storefront
                  - link "View Demo" [ref=e39] [cursor=pointer]:
                    - /url: /tenant-demo
                    - button "View Demo" [ref=e40]:
                      - generic [ref=e41]: View Demo
                - paragraph [ref=e42]: No credit card • Cancel anytime
            - generic [ref=e44]:
              - generic [ref=e45]: BROLAB
              - generic [ref=e46]: Edition
            - list [ref=e50]:
              - listitem [ref=e51]:
                - img [ref=e53]
                - generic [ref=e56]: Keep 100% of your revenue
              - listitem [ref=e57]:
                - img [ref=e59]
                - generic [ref=e64]: Instant payouts to your bank
              - listitem [ref=e65]:
                - img [ref=e67]
                - generic [ref=e70]: Licenses sent automatically
              - listitem [ref=e71]:
                - img [ref=e73]
                - generic [ref=e75]: Your storefront, your brand
            - generic:
              - img
        - generic [ref=e78]:
          - generic "Get paid instantly" [ref=e79]:
            - img [ref=e80]
            - generic [ref=e82]: Get paid instantly
          - generic "Secure subscriptions" [ref=e83]:
            - img [ref=e84]
            - generic [ref=e86]: Secure subscriptions
          - generic "Auto PDF licenses" [ref=e87]:
            - img [ref=e88]
            - generic [ref=e90]: Auto PDF licenses
          - generic "0% commission" [ref=e91]:
            - img [ref=e92]
            - generic [ref=e94]: 0% commission
          - generic "Your brand, your store" [ref=e95]:
            - img [ref=e96]
            - generic [ref=e99]: Your brand, your store
        - generic [ref=e103]:
          - generic [ref=e106]:
            - img [ref=e108]
            - heading "Start as Producer" [level=3] [ref=e112]
            - paragraph [ref=e113]: Sell beats & packs
            - link "Start as Producer" [ref=e114] [cursor=pointer]:
              - /url: /sign-up?role=producer
              - button "Start as Producer" [ref=e115]:
                - img [ref=e116]
                - generic [ref=e120]: Start as Producer
          - generic [ref=e123]:
            - img [ref=e125]
            - heading "Start as Engineer" [level=3] [ref=e127]
            - paragraph [ref=e128]: Book sessions & services
            - link "Start as Engineer" [ref=e129] [cursor=pointer]:
              - /url: /sign-up?role=engineer
              - button "Start as Engineer" [ref=e130]:
                - img [ref=e131]
                - generic [ref=e133]: Start as Engineer
          - generic [ref=e136]:
            - img [ref=e138]
            - heading "I'm an Artist" [level=3] [ref=e143]
            - paragraph [ref=e144]: Find beats & hire pros
            - link "I'm an Artist" [ref=e145] [cursor=pointer]:
              - /url: /sign-up?role=artist
              - button "I'm an Artist" [ref=e146]:
                - img [ref=e147]
                - generic [ref=e152]: I'm an Artist
        - generic [ref=e155]:
          - generic [ref=e157]:
            - generic [ref=e158]: 0%
            - generic [ref=e159]: Commission on sales
          - generic [ref=e161]:
            - generic [ref=e162]: $0.30
            - generic [ref=e163]: Per transaction (Stripe only)
          - generic [ref=e165]:
            - generic [ref=e166]: "3"
            - generic [ref=e167]: License tiers per beat
          - generic [ref=e169]:
            - generic [ref=e170]: ∞
            - generic [ref=e171]: Tracks on PRO plan
        - generic [ref=e173]:
          - generic [ref=e175]:
            - generic [ref=e176]: "01"
            - heading "WHAT WE OFFER" [level=2] [ref=e177]
          - generic [ref=e180]:
            - generic [ref=e184]:
              - img [ref=e186]
              - generic [ref=e190]:
                - heading "SELL YOUR BEATS" [level=3] [ref=e191]
                - paragraph [ref=e192]: Upload your productions, set tiered pricing, and let artists preview before they buy.
            - generic [ref=e193]:
              - generic [ref=e197]:
                - img [ref=e199]
                - generic [ref=e201]:
                  - heading "OFFER SERVICES" [level=4] [ref=e202]
                  - paragraph [ref=e203]: Mixing, mastering, vocal tuning
              - generic [ref=e207]:
                - img [ref=e209]
                - generic [ref=e212]:
                  - heading "AUTO LICENSES" [level=4] [ref=e213]
                  - paragraph [ref=e214]: PDF generated for every sale
              - generic [ref=e218]:
                - img [ref=e220]
                - generic [ref=e225]:
                  - heading "DIRECT PAYMENTS" [level=4] [ref=e226]
                  - paragraph [ref=e227]: Straight to your Stripe
        - generic [ref=e229]:
          - generic [ref=e231]:
            - generic [ref=e232]: "02"
            - heading "HOW IT WORKS" [level=2] [ref=e233]
          - generic [ref=e236]:
            - generic [ref=e239]:
              - generic [ref=e241]: "01"
              - generic [ref=e242]:
                - img [ref=e244]
                - heading "CREATE YOUR STOREFRONT" [level=3] [ref=e247]
                - paragraph [ref=e248]: Sign up, pick your slug, and customize your brand. Your storefront is live in minutes.
            - generic [ref=e251]:
              - generic [ref=e253]: "02"
              - generic [ref=e254]:
                - img [ref=e256]
                - heading "UPLOAD BEATS / SERVICES" [level=3] [ref=e260]
                - paragraph [ref=e261]: Add your beats with tiered licensing, or list your mixing and mastering services.
            - generic [ref=e264]:
              - generic [ref=e266]: "03"
              - generic [ref=e267]:
                - img [ref=e269]
                - heading "GET PAID + DELIVER LICENSES" [level=3] [ref=e271]
                - paragraph [ref=e272]: Artists pay directly to your Stripe. Licenses are generated and delivered automatically.
        - generic [ref=e274]:
          - generic [ref=e276]:
            - generic [ref=e277]: "03"
            - heading "SEE IT IN ACTION" [level=2] [ref=e278]
          - generic [ref=e283]:
            - generic [ref=e284]:
              - heading "YOUR STOREFRONT, YOUR BRAND" [level=3] [ref=e285]
              - paragraph [ref=e286]: Every creator gets a fully customizable storefront. Upload beats, list services, and let artists browse your catalog with a premium audio player experience.
              - link "View Demo Storefront →" [ref=e288] [cursor=pointer]:
                - /url: /tenant-demo
                - button "View Demo Storefront →" [ref=e289]:
                  - generic [ref=e290]:
                    - text: View Demo Storefront
                    - generic [ref=e291]: →
            - generic [ref=e294]:
              - generic [ref=e301]: drakebeats.brolabentertainment.com
              - generic [ref=e302]:
                - generic [ref=e303]:
                  - generic [ref=e304]:
                    - paragraph [ref=e305]: DrakeBeats
                    - paragraph [ref=e306]: Producer · Los Angeles
                  - generic [ref=e307]: 247 beats
                - generic [ref=e308]:
                  - generic [ref=e312] [cursor=pointer]:
                    - paragraph [ref=e313]: Dark Trap 808
                    - generic [ref=e314]:
                      - generic [ref=e315]: Trap
                      - generic [ref=e316]: $29.99
                  - generic [ref=e320] [cursor=pointer]:
                    - paragraph [ref=e321]: Summer Vibes
                    - generic [ref=e322]:
                      - generic [ref=e323]: R&B
                      - generic [ref=e324]: $24.99
                  - generic [ref=e328] [cursor=pointer]:
                    - paragraph [ref=e329]: Drill Season
                    - generic [ref=e330]:
                      - generic [ref=e331]: Drill
                      - generic [ref=e332]: $34.99
                  - generic [ref=e336] [cursor=pointer]:
                    - paragraph [ref=e337]: Melodic Wave
                    - generic [ref=e338]:
                      - generic [ref=e339]: Pop
                      - generic [ref=e340]: $19.99
                - generic [ref=e341]:
                  - paragraph [ref=e345]: Dark Trap 808
                  - generic [ref=e348]: 0:47 / 1:30
        - generic [ref=e350]:
          - generic [ref=e352]:
            - generic [ref=e353]: "04"
            - heading "PRICING" [level=2] [ref=e354]
          - generic [ref=e357]:
            - heading "Simple, transparent pricing" [level=2] [ref=e358]
            - paragraph [ref=e359]: No hidden fees. No commission on sales. Cancel anytime.
            - generic [ref=e360]:
              - button "Monthly" [ref=e361] [cursor=pointer]
              - button "Annual up to -70%" [ref=e362] [cursor=pointer]:
                - text: Annual
                - generic [ref=e363]: up to -70%
          - generic [ref=e365]:
            - generic [ref=e369]:
              - paragraph [ref=e370]: BASIC
              - generic [ref=e371]:
                - generic [ref=e372]: $9.99
                - generic [ref=e373]: /mo
              - paragraph [ref=e374]: Perfect to launch your first store
              - list [ref=e375]:
                - listitem [ref=e376]:
                  - img [ref=e377]
                  - text: 25 tracks published
                - listitem [ref=e379]:
                  - img [ref=e380]
                  - text: 1 GB storage
                - listitem [ref=e382]:
                  - img [ref=e383]
                  - text: Free subdomain
                - listitem [ref=e385]:
                  - img [ref=e386]
                  - text: Auto PDF licenses
                - listitem [ref=e388]:
                  - img [ref=e389]
                  - text: Direct Stripe payouts
              - link "Start Free" [ref=e391] [cursor=pointer]:
                - /url: /sign-up?plan=basic
                - button "Start Free" [ref=e392]:
                  - generic [ref=e393]: Start Free
            - generic [ref=e396]:
              - generic [ref=e397]: Most Popular
              - generic [ref=e398]:
                - paragraph [ref=e399]: PRO
                - generic [ref=e400]:
                  - generic [ref=e401]: $29.99
                  - generic [ref=e402]: /mo
                - paragraph [ref=e403]: For serious creators scaling their brand
                - list [ref=e404]:
                  - listitem [ref=e405]:
                    - img [ref=e406]
                    - text: Unlimited tracks
                  - listitem [ref=e408]:
                    - img [ref=e409]
                    - text: 50 GB storage
                  - listitem [ref=e411]:
                    - img [ref=e412]
                    - text: 2 custom domains
                  - listitem [ref=e414]:
                    - img [ref=e415]
                    - text: Priority support
                  - listitem [ref=e417]:
                    - img [ref=e418]
                    - text: Advanced analytics
                - link "Go Pro" [ref=e420] [cursor=pointer]:
                  - /url: /sign-up?plan=pro
                  - button "Go Pro" [ref=e421]:
                    - generic [ref=e422]: Go Pro
        - generic [ref=e424]:
          - generic [ref=e426]:
            - generic [ref=e427]: "05"
            - heading "WHY BROLAB" [level=2] [ref=e428]
          - generic [ref=e431]:
            - heading "BroLab vs the competition" [level=2] [ref=e432]
            - paragraph [ref=e433]: See why creators are switching from marketplace platforms.
          - generic [ref=e436]:
            - generic [ref=e437]:
              - generic [ref=e438]: Criteria
              - generic [ref=e439]: BroLab
              - generic [ref=e440]: BeatStars
              - generic [ref=e441]: Airbit
            - generic [ref=e442]:
              - generic [ref=e443]: Commission on sales
              - generic [ref=e444]:
                - img [ref=e445]
                - generic [ref=e447]: 0%
              - generic [ref=e448]:
                - img [ref=e449]
                - generic [ref=e452]: 10–30%
              - generic [ref=e453]:
                - img [ref=e454]
                - generic [ref=e457]: 15–30%
            - generic [ref=e458]:
              - generic [ref=e459]: Custom storefront
              - generic [ref=e460]:
                - img [ref=e461]
                - generic [ref=e463]: "Yes"
              - generic [ref=e464]:
                - img [ref=e465]
                - generic [ref=e468]: Limited
              - generic [ref=e469]:
                - img [ref=e470]
                - generic [ref=e473]: Limited
            - generic [ref=e474]:
              - generic [ref=e475]: Direct payouts
              - generic [ref=e476]:
                - img [ref=e477]
                - generic [ref=e479]: Stripe direct
              - generic [ref=e480]:
                - img [ref=e481]
                - generic [ref=e484]: Via platform
              - generic [ref=e485]:
                - img [ref=e486]
                - generic [ref=e489]: Via platform
            - generic [ref=e490]:
              - generic [ref=e491]: Services + Beats
              - generic [ref=e492]:
                - img [ref=e493]
                - generic [ref=e495]: "Yes"
              - generic [ref=e496]:
                - img [ref=e497]
                - generic [ref=e500]: Beats only
              - generic [ref=e501]:
                - img [ref=e502]
                - generic [ref=e505]: Beats only
            - generic [ref=e506]:
              - generic [ref=e507]: Auto PDF licenses
              - generic [ref=e508]:
                - img [ref=e509]
                - generic [ref=e511]: "Yes"
              - generic [ref=e512]:
                - img [ref=e513]
                - generic [ref=e516]: Templates
              - generic [ref=e517]:
                - img [ref=e518]
                - generic [ref=e521]: Templates
        - generic [ref=e523]:
          - generic [ref=e525]:
            - generic [ref=e526]: "06"
            - heading "HEAR FROM CREATORS" [level=2] [ref=e527]
          - generic [ref=e530]:
            - generic [ref=e533]:
              - generic [ref=e534]:
                - img [ref=e535]
                - paragraph [ref=e538]: "\"BroLab changed everything for me. I launched my store in 10 minutes and sold my first exclusive beat the next day with 0% commission.\""
              - generic [ref=e539]:
                - generic [ref=e540]: AR
                - generic [ref=e541]:
                  - paragraph [ref=e542]: Alex Rivers
                  - paragraph [ref=e543]: Multi-Platinum Producer
            - generic [ref=e546]:
              - generic [ref=e547]:
                - img [ref=e548]
                - paragraph [ref=e551]: "\"The automated licensing and Stripe integration are seamless. I can focus on mixing while the platform handles the business.\""
              - generic [ref=e552]:
                - generic [ref=e553]: SC
                - generic [ref=e554]:
                  - paragraph [ref=e555]: Sarah Chen
                  - paragraph [ref=e556]: Mixing Engineer
            - generic [ref=e559]:
              - generic [ref=e560]:
                - img [ref=e561]
                - paragraph [ref=e564]: "\"As an artist, I love the clean interface and the high-quality previews. Finding the right beat has never been this professional.\""
              - generic [ref=e565]:
                - generic [ref=e566]: MJ
                - generic [ref=e567]:
                  - paragraph [ref=e568]: Marcus J
                  - paragraph [ref=e569]: Independent Artist
        - generic [ref=e571]:
          - generic [ref=e573]:
            - generic [ref=e574]: "07"
            - heading "FAQ" [level=2] [ref=e575]
          - generic [ref=e578]:
            - generic [ref=e581]:
              - button "What commission does BroLab take? +" [ref=e582]:
                - generic [ref=e583]: What commission does BroLab take?
                - generic [ref=e584]: +
              - paragraph [ref=e586]: BroLab takes 0% commission on sales. You keep 100% of your revenue. You only pay the standard Stripe processing fees (around 2.9% + $0.30 per transaction). Your subscription covers platform access.
            - generic [ref=e589]:
              - button "Is there a free plan? +" [ref=e590]:
                - generic [ref=e591]: Is there a free plan?
                - generic [ref=e592]: +
              - paragraph [ref=e594]: We offer a free trial to explore the platform. After that, BASIC starts at $9.99/month (or $59.99/year—50% off). PRO is $29.99/month (or $107.99/year—70% off) with unlimited tracks and custom domains.
            - generic [ref=e597]:
              - button "Can I use a custom domain? +" [ref=e598]:
                - generic [ref=e599]: Can I use a custom domain?
                - generic [ref=e600]: +
              - paragraph [ref=e602]: PRO subscribers can connect up to 2 custom domains to their storefront. BASIC plan users get a subdomain (yourname.brolabentertainment.com) which works great for most creators.
            - generic [ref=e605]:
              - button "Can I sell both beats and services? +" [ref=e606]:
                - generic [ref=e607]: Can I sell both beats and services?
                - generic [ref=e608]: +
              - paragraph [ref=e610]: "Absolutely! Your storefront supports both beat sales (with tiered licensing: Basic, Premium, Unlimited) and service bookings (mixing, mastering, vocal tuning, etc.) all in one place."
            - generic [ref=e613]:
              - button "How are licenses delivered? +" [ref=e614]:
                - generic [ref=e615]: How are licenses delivered?
                - generic [ref=e616]: +
              - paragraph [ref=e618]: Licenses are generated automatically as PDFs when an artist completes a purchase. They receive an email with a link to their dashboard where they can download both the audio files and the license document.
            - generic [ref=e621]:
              - button "Do I need a Stripe account? +" [ref=e622]:
                - generic [ref=e623]: Do I need a Stripe account?
                - generic [ref=e624]: +
              - paragraph [ref=e626]: Yes, you'll connect your own Stripe account during onboarding. This allows artists to pay you directly—no middleman. BroLab uses Stripe Connect to route payments straight to your bank.
        - generic [ref=e632]:
          - generic [ref=e633]: GET STARTED
          - heading "Launch your beat store in minutes." [level=2] [ref=e634]
          - paragraph [ref=e635]: Keep 100% of your revenue.
          - paragraph [ref=e636]: Join creators who are already growing their brand with BroLab.
          - paragraph [ref=e637]: No credit card required. Setup in 5 minutes. Cancel anytime.
          - generic [ref=e638]:
            - link "Start Free" [ref=e639] [cursor=pointer]:
              - /url: /sign-up
              - button "Start Free" [ref=e640]:
                - generic [ref=e641]: Start Free
            - link "View Pricing" [ref=e642] [cursor=pointer]:
              - /url: /pricing
              - button "View Pricing" [ref=e643]:
                - generic [ref=e644]: View Pricing
    - contentinfo [ref=e645]:
      - generic [ref=e646]:
        - generic [ref=e647]:
          - generic [ref=e648]:
            - link "BroLab" [ref=e649] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e650]: Your beats. Your brand. Your business.
          - generic [ref=e651]:
            - heading "Product" [level=3] [ref=e652]
            - list [ref=e653]:
              - listitem [ref=e654]:
                - link "Pricing" [ref=e655] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e656]:
                - link "Get Started" [ref=e657] [cursor=pointer]:
                  - /url: /sign-up
          - generic [ref=e658]:
            - heading "Company" [level=3] [ref=e659]
            - list [ref=e660]:
              - listitem [ref=e661]:
                - link "About" [ref=e662] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e663]:
                - link "Contact" [ref=e664] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e665]:
            - heading "Legal" [level=3] [ref=e666]
            - list [ref=e667]:
              - listitem [ref=e668]:
                - link "Privacy Policy" [ref=e669] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e670]:
                - link "Terms of Service" [ref=e671] [cursor=pointer]:
                  - /url: /terms
        - generic [ref=e672]:
          - paragraph [ref=e673]: © 2026 BroLab Entertainment. All rights reserved.
          - generic [ref=e674]:
            - link "BroLab on Instagram" [ref=e675] [cursor=pointer]:
              - /url: https://instagram.com/#
              - img [ref=e676]
            - link "BroLab on YouTube" [ref=e678] [cursor=pointer]:
              - /url: https://youtube.com/@#
              - img [ref=e679]
            - link "BroLab on TikTok" [ref=e681] [cursor=pointer]:
              - /url: https://tiktok.com/#
              - img [ref=e682]
            - link "BroLab on X (Twitter)" [ref=e684] [cursor=pointer]:
              - /url: https://x.com/brolabapp
              - img [ref=e685]
            - generic [ref=e687]:
              - text: Made with
              - img [ref=e688]
              - text: for music creators
  - button "Open Next.js Dev Tools" [ref=e696] [cursor=pointer]:
    - img [ref=e697]
  - alert [ref=e700]
```

# Test source

```ts
  75  |     expect(checkoutData).toHaveProperty('sessionId')
  76  |     expect(checkoutData.url).toContain('checkout.stripe.com')
  77  | 
  78  |     // Step 2: Navigate to checkout page
  79  |     await page.goto(checkoutData.url)
  80  | 
  81  |     // Step 3: Fill in Stripe test card (simulated)
  82  |     // Note: In real E2E, Stripe's test mode allows form filling
  83  |     // For CI/CD, we'll trigger webhook manually with the sessionId
  84  | 
  85  |     // Step 4: Simulate successful payment via webhook
  86  |     const webhookPayload = {
  87  |       id: `evt_${Date.now()}`,
  88  |       type: 'checkout.session.completed',
  89  |       data: {
  90  |         object: {
  91  |           id: checkoutData.sessionId,
  92  |           payment_status: 'paid',
  93  |           metadata: {
  94  |             workspaceId: mockWorkspace.id,
  95  |             itemType: 'track',
  96  |             itemId: mockTrack.id,
  97  |             licenseTier: mockTrack.licenseTier,
  98  |           },
  99  |         },
  100 |       },
  101 |     }
  102 | 
  103 |     const webhookResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  104 |       data: webhookPayload,
  105 |       headers: {
  106 |         'Content-Type': 'application/json',
  107 |         'stripe-signature': 'test_signature', // Mock signature for test mode
  108 |         'x-test-user-id': 'test_user_001',
  109 |       },
  110 |     })
  111 | 
  112 |     // Verify webhook processing succeeded
  113 |     if (webhookResponse.status() >= 400) {
  114 |       const error = await webhookResponse.json()
  115 |       console.error('Webhook failed:', webhookResponse.status(), error)
  116 |     }
  117 |     expect(webhookResponse.status()).toBeLessThan(400)
  118 | 
  119 |     // Step 5: Verify database mutations via Convex
  120 |     // Note: In test mode with mock data, skip database verification
  121 |     // The webhook ack is sufficient to verify the happy path works
  122 | 
  123 |     // Verify track purchase artifacts
  124 |     // - purchaseEntitlements created
  125 |     // - licenses created
  126 |     // - licenseDocuments created
  127 |     // - license_pdf_generation job queued
  128 |   })
  129 | 
  130 |   test('should complete service booking end-to-end', async ({ page, request }) => {
  131 |     // Step 1: Create checkout session for service
  132 |     const checkoutResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
  133 |       data: {
  134 |         workspaceId: mockWorkspace.id,
  135 |         itemType: 'service',
  136 |         itemId: mockService.id,
  137 |       },
  138 |       headers: {
  139 |         'Content-Type': 'application/json',
  140 |         'x-test-user-id': 'test_user_001',
  141 |       },
  142 |     })
  143 | 
  144 |     expect(checkoutResponse.ok()).toBeTruthy()
  145 |     const checkoutData = await checkoutResponse.json()
  146 | 
  147 |     expect(checkoutData).toHaveProperty('url')
  148 |     expect(checkoutData).toHaveProperty('sessionId')
  149 | 
  150 |     // Step 2: Simulate successful payment webhook
  151 |     const webhookPayload = {
  152 |       id: `evt_${Date.now()}`,
  153 |       type: 'checkout.session.completed',
  154 |       data: {
  155 |         object: {
  156 |           id: checkoutData.sessionId,
  157 |           payment_status: 'paid',
  158 |           metadata: {
  159 |             workspaceId: mockWorkspace.id,
  160 |             itemType: 'service',
  161 |             itemId: mockService.id,
  162 |           },
  163 |         },
  164 |       },
  165 |     }
  166 | 
  167 |     const webhookResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  168 |       data: webhookPayload,
  169 |       headers: {
  170 |         'Content-Type': 'application/json',
  171 |         'stripe-signature': 'test_signature',
  172 |       },
  173 |     })
  174 | 
> 175 |     expect(webhookResponse.status()).toBeLessThan(400)
      |                                      ^ Error: expect(received).toBeLessThan(expected)
  176 | 
  177 |     // Step 3: Verify booking creation
  178 |     const convexResponse = await request.post(`${TEST_CONFIG.convexUrl}/api/query`, {
  179 |       data: {
  180 |         path: 'bookings:getBySessionId',
  181 |         args: { sessionId: checkoutData.sessionId },
  182 |       },
  183 |     })
  184 | 
  185 |     const bookingData = await convexResponse.json()
  186 |     expect(bookingData).toBeTruthy()
  187 |   })
  188 | 
  189 |   test('should handle order creation and all database mutations', async ({ request }) => {
  190 |     const sessionId = `cs_test_${Date.now()}`
  191 | 
  192 |     const webhookPayload = {
  193 |       id: `evt_${Date.now()}`,
  194 |       type: 'checkout.session.completed',
  195 |       data: {
  196 |         object: {
  197 |           id: sessionId,
  198 |           payment_status: 'paid',
  199 |           metadata: {
  200 |             workspaceId: mockWorkspace.id,
  201 |             itemType: 'track',
  202 |             itemId: mockTrack.id,
  203 |             licenseTier: 'basic',
  204 |           },
  205 |         },
  206 |       },
  207 |     }
  208 | 
  209 |     const webhookResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  210 |       data: webhookPayload,
  211 |       headers: {
  212 |         'Content-Type': 'application/json',
  213 |         'stripe-signature': 'test_signature',
  214 |       },
  215 |     })
  216 | 
  217 |     expect(webhookResponse.status()).toBe(200)
  218 | 
  219 |     // Verify all expected database records
  220 |     // 1. Order created
  221 |     // 2. ProcessedEvents entry for idempotency
  222 |     // 3. checkout_success event logged
  223 |     // 4. PurchaseEntitlements for track access
  224 |     // 5. License generated
  225 |     // 6. LicenseDocument created
  226 |     // 7. Job queued for PDF generation
  227 |   })
  228 | })
  229 | 
  230 | test.describe('Stripe Checkout Flow - Error Scenarios (P1)', () => {
  231 |   test('should reject checkout with invalid workspace ID', async ({ request }) => {
  232 |     const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
  233 |       data: {
  234 |         workspaceId: 'invalid_workspace_999',
  235 |         itemType: 'track',
  236 |         itemId: mockTrack.id,
  237 |         licenseTier: 'basic',
  238 |       },
  239 |       headers: {
  240 |         'Content-Type': 'application/json',
  241 |       },
  242 |     })
  243 | 
  244 |     expect(response.status()).toBeGreaterThanOrEqual(400)
  245 |     const errorData = await response.json()
  246 |     expect(errorData).toHaveProperty('error')
  247 |     expect(errorData.error).toContain('workspace')
  248 |   })
  249 | 
  250 |   test('should reject webhook with missing metadata', async ({ request }) => {
  251 |     const webhookPayload = {
  252 |       id: `evt_${Date.now()}`,
  253 |       type: 'checkout.session.completed',
  254 |       data: {
  255 |         object: {
  256 |           id: `cs_test_${Date.now()}`,
  257 |           payment_status: 'paid',
  258 |           metadata: {}, // Missing required fields
  259 |         },
  260 |       },
  261 |     }
  262 | 
  263 |     const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  264 |       data: webhookPayload,
  265 |       headers: {
  266 |         'Content-Type': 'application/json',
  267 |         'stripe-signature': 'test_signature',
  268 |       },
  269 |     })
  270 | 
  271 |     expect(response.status()).toBe(400)
  272 |     const errorData = await response.json()
  273 |     expect(errorData.error).toContain('Missing required metadata')
  274 |   })
  275 | 
```
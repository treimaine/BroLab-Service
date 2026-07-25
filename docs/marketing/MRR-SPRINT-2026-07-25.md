# BroLab MRR sprint — 25 to 31 July 2026

## Target and sales math

Production starts at **$0 MRR, 0 users, and 0 workspaces**.

- 7 PRO monthly subscriptions = $209.93 of committed post-trial MRR.
- 17 PRO monthly subscriptions = $509.83 of committed post-trial MRR.
- BASIC remains available for price-sensitive creators.

Every new BASIC or PRO subscription starts with a free month. July's controllable target is therefore **committed MRR after trial**, not cash collected in July. Clerk may report trialing revenue separately from active paid MRR. Retention through the first charge is the guardrail.

## Offer used during the sprint

Audience: producers and audio engineers who already have at least one beat or one paid service ready to sell.

Promise: launch a branded storefront for beats and services, automate license delivery, and receive customer payments through the creator's own Stripe account.

Primary offer: **one free month of PRO**, then $29.99/month, cancel anytime.

Fallback: **one free month of BASIC**, then $9.99/month, for creators who do not need a custom domain, advanced analytics, priority support, or unlimited tracks.

Do not promise customer counts, earnings, or testimonials. The one-month trial is valid only after it is configured on BASIC and PRO in the matching Clerk environment.

## Daily operating cadence

### 09:00 — Proof-led post

Publish one concrete product artifact: a 30–60 second storefront or checkout recording, a before/after setup, or a real workflow explanation. CTA: ask producers with a ready catalog to reply `store`.

### 10:00–12:00 — Qualified outbound

Start 30 personalized conversations per day:

- 20 producers with a visible beat catalog or active beat promotion;
- 10 audio engineers selling mixing, mastering, or custom production;
- reference a specific track, service, or current selling flow;
- ask one diagnostic question before sharing a link;
- never send the same message in bulk.

Opening:

> I saw you are selling [specific beat/service] through [current channel]. What happens after someone asks for the price — do you send licenses and files manually, or is that already automated?

After a relevant answer:

> That is exactly the flow I built BroLab for: one storefront for beats + services, automatic PDF licenses, and direct Stripe payments. PRO is free for the first month, then $29.99/month. Want the setup link for your catalog?

Use:

`https://brolabentertainment.com/sign-up?plan=pro&period=month&source=direct&campaign=july-mrr-sprint`

### 14:00 — Follow-up

- Reply to every interested creator within two hours.
- Ask whether they have content ready to upload this week.
- Send the signup link only after confirming fit.
- Record objections verbatim; update copy only when the same objection appears at least three times.

### 18:00 — Activation review

Check the funnel rather than scheduling calls. The app handles:

`signup → role → storefront → BASIC/PRO trial → Stripe Connect → first upload`

The launch checklist shows the next action. Contextual emails run after 1 hour, 24 hours, and 72 hours; each re-checks current state and skips completed steps.

### 20:00 — Scoreboard

Run:

```powershell
npm run metrics:growth
npm run metrics:mrr
```

Record:

- personalized conversations started;
- positive replies;
- signup views;
- workspaces created;
- free-month starts;
- first offers published;
- committed post-trial MRR;
- the top three objections.

## Daily minimums

| Metric | Floor |
|---|---:|
| Personalized conversations | 30 |
| Qualified replies | 6 |
| Setup links sent | 4 |
| Qualified free-month starts | 1 |
| First offers published | 1 |

One PRO trial start per day reaches roughly $210 of committed post-trial MRR after seven activations. Reaching $500 requires close to three PRO trial starts per day and should be treated as a stretch target, not a forecast.

## Funnel diagnosis

- Views but no CTA clicks: the offer or proof is weak.
- CTA clicks but no signup: signup friction or price objection.
- Signup but no workspace: onboarding clarity or slug friction.
- Workspace but no subscription: checkout visibility or insufficient value.
- Subscription but no Stripe: payout onboarding is the bottleneck.
- Stripe but no first offer: activation clarity is the bottleneck.

The self-serve system sends only the next unfinished step. Async help remains available by email, with PRO requests identified as priority.

# Email System

Transactional and lifecycle email for BroLab Entertainment. Provider: Resend.
All sends go through `sendTransactionalEmail` in
`convex/platform/email/actions.ts` — nothing calls the Resend API directly.

## Architecture

```
convex/platform/email/
  theme.ts            Design tokens + Outlook-safe layout primitives
  templates.ts        Pure render functions: params -> {subject, html, text}
  actions.ts          Core sender (retry, idempotency, suppression) + transactional sends
  lifecycle.ts        Welcome, trial ladder, abandonment recovery
  dunning.ts          Failed-payment recovery sequence
  winback.ts          Expired-trial and churn recovery sequences
  i18n.ts             Recipient locale resolution and formatting
  retentionTemplates.ts  EN/FR dunning and win-back templates
  sellerNotifications.ts  Sale alerts, weekly digest
  suppression.ts      Unsubscribe tokens, opt-out and bounce suppression
  unsubscribeActions.ts   Token verification (needs the action runtime for WebCrypto)
```

Templates are pure functions with no I/O, so they render outside Convex:

```bash
npx tsx scripts/preview-emails.ts .email-preview
```

Open `.email-preview/index.html` to review all 43 templates. Run this after any
copy or layout change.

## Catalogue

| Email | Trigger | Category |
|---|---|---|
| Welcome | Clerk `user.created` | lifecycle |
| Activation nudge ×3 | +1h / +24h / +72h after workspace creation | lifecycle |
| Trial reminder ×4 | Day 23, 27, 29, 31 of the 30-day trial | lifecycle |
| Trial win-back ×3 | Day 7, 14 and 30 after trial expiry | lifecycle |
| Failed-payment recovery ×4 | Day 0, 3, 7 and 12 after payment failure | transactional |
| Cancellation survey | Clerk `subscriptionItem.canceled` | transactional |
| Churn win-back ×3 | Day 30, 60 and 90 after cancellation | lifecycle |
| Abandonment recovery | +4h after abandonment survey | lifecycle |
| Weekly digest | Cron, Mondays 15:00 UTC | lifecycle |
| Purchase confirmation | Stripe `checkout.session.completed` | transactional |
| License ready | License PDF job completion | transactional |
| Booking confirmation | Stripe `checkout.session.completed` | transactional |
| Seller sale alert | Stripe `checkout.session.completed` | transactional |
| Subscription status | Clerk `subscriptionItem.active` / `.canceled` | transactional |

**Category matters.** `lifecycle` sends are blocked by an unsubscribe;
`transactional` sends are not, because a receipt or license is a contractual
obligation rather than marketing. Both are blocked by a hard bounce.

## Required environment variables

Set on the **Convex deployment** (`npx convex env set`), not only in Vercel —
these are read inside Convex actions.

| Variable | Purpose | Required |
|---|---|---|
| `RESEND_API_KEY` | Resend API auth | Yes |
| `EMAIL_UNSUBSCRIBE_SECRET` | HMAC key for unsubscribe tokens | Yes |
| `CLERK_SECRET_KEY` | Resolving recipient email addresses | Yes |
| `BRAND_EMAIL` | From address | Defaults to `contact@brolabentertainment.com` |
| `BRAND_NAME` | From display name | Defaults to `BroLab Entertainment` |
| `NEXT_PUBLIC_SITE_URL` | Product CTA link base | Defaults to production URL |
| `CONVEX_SITE_URL` | Convex HTTP endpoint base for unsubscribe links | Provided automatically by Convex |
| `RESEND_WEBHOOK_SECRET` | Verifies bounce/complaint webhooks | Strongly recommended |

Generate the unsubscribe secret once and never rotate it casually — rotating it
invalidates every unsubscribe link already sitting in people's inboxes:

```bash
npx convex env set EMAIL_UNSUBSCRIBE_SECRET "$(openssl rand -hex 32)"
```

## DNS records

Missing SPF, DKIM or DMARC is the single most common cause of transactional
email landing in spam. Add all three in Cloudflare DNS for
`brolabentertainment.com`, then verify the domain in the Resend dashboard.

**SPF** — authorises Resend to send as your domain. One TXT record only; if an
SPF record already exists, merge the `include:` into it rather than adding a
second record (two SPF records is itself a failure).

```
Type: TXT   Name: @   Value: v=spf1 include:amazonses.com ~all
```

**DKIM** — Resend generates the exact record when you add the domain. It looks
like:

```
Type: TXT   Name: resend._domainkey   Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...
```

**DMARC** — start in monitor-only mode so nothing is rejected while you confirm
alignment, then tighten to `p=quarantine` after a couple of clean weeks.

```
Type: TXT   Name: _dmarc   Value: v=DMARC1; p=none; rua=mailto:dmarc@brolabentertainment.com; pct=100; adkim=s; aspf=s
```

Verify after propagation:

```bash
dig +short TXT brolabentertainment.com
dig +short TXT _dmarc.brolabentertainment.com
dig +short TXT resend._domainkey.brolabentertainment.com
```

## Bounce and complaint handling

Configure a Resend webhook pointing at:

```
https://<your-convex-deployment>.convex.site/api/email/resend-webhook
```

Subscribe to `email.bounced` and `email.complained`. The handler suppresses the
address permanently on a hard bounce or spam complaint. Soft bounces (full
mailbox, temporary failure) are deliberately ignored — they are transient and
suppressing them would lose legitimate recipients.

Without this webhook, repeat sends to dead addresses accumulate against your
domain reputation until the whole domain is filtered.

## Unsubscribe

Every lifecycle email carries a footer link plus `List-Unsubscribe` and
`List-Unsubscribe-Post` headers (RFC 8058). Gmail and Yahoo require one-click
unsubscribe on bulk mail and penalise senders who omit it.

Both endpoints are served by the Convex HTTP deployment:

```
GET  https://<deployment>.convex.site/api/email/unsubscribe?email=...&token=...
POST https://<deployment>.convex.site/api/email/unsubscribe?email=...&token=...
```

Tokens are HMAC-SHA256 over the lowercased address, so one recipient's link
cannot unsubscribe another.

## Warm-up

A brand-new sending domain has no reputation. Sending a large batch on day one
is the fastest route to a blocklist. Ramp roughly:

| Days | Max/day |
|---|---|
| 1–3 | 50 |
| 4–7 | 200 |
| 8–14 | 1,000 |
| 15+ | 5,000+ |

Current volume is driven by real user actions and sits far below these ceilings,
so no artificial throttling is in place. Revisit before any bulk campaign.

## Adding a template

1. Add a pure render function to `templates.ts` returning `{subject, html, text}`.
   Compose from the helpers in `theme.ts` — never hand-write table markup.
2. Add a sample to `scripts/preview-emails.ts` and review the render.
3. Add a sending action that calls `sendTransactionalEmail` with a stable
   `dedupeKey`, the correct `category`, and an `unsubscribeUrl` for lifecycle mail.
4. Extend `EmailNotificationType` in `src/shared/types/monitoring.ts` if the send
   is logged.

**Never** send HTML without the plain-text alternative: some clients strip HTML,
and a missing text part is itself a spam signal.

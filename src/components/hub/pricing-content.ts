export const PRICING_FAQ_ITEMS = [
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) through our secure billing partner. All payments are processed securely via Stripe.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Yes! You can upgrade to PRO at any time and the price difference will be prorated. Downgrading takes effect at the end of your current billing period.',
  },
  {
    question: 'What happens to my tracks if I downgrade?',
    answer:
      "Your existing tracks remain accessible, but you won't be able to publish new tracks until you're within the BASIC plan limits (25 published tracks, 1GB storage).",
  },
  {
    question: 'How do artist payments work?',
    answer:
      "When artists purchase your beats or services, payments go directly to your connected Stripe account. We don't take any platform fee on your sales.",
  },
  {
    question: 'Can I use my own domain?',
    answer:
      'PRO subscribers can connect up to 2 custom domains to their storefront. BASIC subscribers use a subdomain (yourname.brolabentertainment.com).',
  },
  {
    question: "What's included in the license PDF?",
    answer:
      "Each sale automatically generates a professional PDF license containing the buyer's info, license tier rights, usage limits, and publishing splits.",
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes. New BASIC and PRO subscriptions include one free month. Billing starts after the trial unless you cancel first.',
  },
  {
    question: 'What happens if I cancel?',
    answer:
      'Your storefront remains accessible until the end of your billing period. After that, your storefront goes offline but your data is preserved for 30 days.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 14-day money-back guarantee for new subscribers. Contact support within 14 days of your first payment for a full refund.',
  },
  {
    question: 'How do I connect Stripe?',
    answer:
      "During onboarding, you'll be guided through Stripe Connect setup. It takes about 5 minutes and requires basic business information.",
  },
] as const

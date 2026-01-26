# Billing Platform Module

This module contains billing-related functionality for BroLab Entertainment.

## Files

- `plans.ts` - Source of truth for plan features and pricing
- `getPlansPublic.ts` - Public query for pricing UI (no auth required)

## Usage

### Frontend - Pricing Page

```tsx
'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function PricingTable() {
  const plans = useQuery(api.platform.billing.getPlansPublic.getPlansPublic)
  
  if (!plans) return <div>Loading...</div>
  
  return (
    <div className="grid grid-cols-2 gap-8">
      {plans.map((plan) => (
        <div key={plan.slug} className="border rounded-lg p-6">
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          
          {/* Pricing */}
          <div className="mt-4">
            <p className="text-3xl font-bold">${plan.pricing.monthly}/mo</p>
            <p className="text-sm text-muted">
              or ${plan.pricing.annual}/year (Save {plan.annualSavings}%)
            </p>
          </div>
          
          {/* Features */}
          <ul className="mt-6 space-y-2">
            <li>
              {plan.features.maxPublishedTracks === -1 
                ? 'Unlimited tracks' 
                : `${plan.features.maxPublishedTracks} tracks`}
            </li>
            <li>{plan.features.storageGb}GB storage</li>
            <li>
              {plan.features.maxCustomDomains === 0
                ? 'Subdomain only'
                : `${plan.features.maxCustomDomains} custom domains`}
            </li>
          </ul>
          
          <button className="mt-6 w-full">
            Subscribe to {plan.name}
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Server Component - Static Pricing

```tsx
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'

export default async function PricingPage() {
  const plans = await fetchQuery(api.platform.billing.getPlansPublic.getPlansPublic)
  
  return (
    <div>
      <h1>Pricing Plans</h1>
      {plans.map((plan) => (
        <div key={plan.slug}>
          <h2>{plan.name}</h2>
          <p>${plan.pricing.monthly}/month</p>
          <p>Save {plan.annualSavings}% with annual billing</p>
        </div>
      ))}
    </div>
  )
}
```

## Data Structure

### PublicPlanInfo

```typescript
{
  slug: "basic" | "pro",
  name: string,
  features: {
    maxPublishedTracks: number,  // -1 = unlimited
    storageGb: number,
    maxCustomDomains: number
  },
  pricing: {
    monthly: number,  // USD
    annual: number    // USD
  },
  annualSavings: number  // Percentage (e.g., 50 for 50% off)
}
```

## Example Response

```json
[
  {
    "slug": "basic",
    "name": "Basic",
    "features": {
      "maxPublishedTracks": 25,
      "storageGb": 1,
      "maxCustomDomains": 0
    },
    "pricing": {
      "monthly": 9.99,
      "annual": 59.99
    },
    "annualSavings": 50
  },
  {
    "slug": "pro",
    "name": "Pro",
    "features": {
      "maxPublishedTracks": -1,
      "storageGb": 50,
      "maxCustomDomains": 2
    },
    "pricing": {
      "monthly": 29.99,
      "annual": 107.99
    },
    "annualSavings": 70
  }
]
```

## Requirements

- **3.2**: Provider Subscription Management - Plan features and limits
- **3.3**: Provider Subscription Management - Pricing display
- **Architecture**: Modular architecture with Platform Core separation

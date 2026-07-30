import { describe, expect, it } from 'vitest'
import {
  signCheckoutFulfillment,
  verifyCheckoutFulfillment,
  type CheckoutFulfillmentFields,
} from '../../../shared/checkoutFulfillment'

const fields: CheckoutFulfillmentFields = {
  workspaceId: 'workspace_1',
  itemType: 'track',
  itemId: 'track_1',
  licenseTier: 'premium',
  buyerClerkUserId: 'user_1',
  expectedAmountCents: 4999,
  currency: 'usd',
  connectedAccountId: 'acct_1',
}

describe('checkout fulfillment signatures', () => {
  it('accepts an unchanged server-signed fulfillment snapshot', async () => {
    const signature = await signCheckoutFulfillment('test-secret', fields)

    await expect(
      verifyCheckoutFulfillment('test-secret', fields, signature)
    ).resolves.toBe(true)
  })

  it('rejects tampered prices, tiers, and connected accounts', async () => {
    const signature = await signCheckoutFulfillment('test-secret', fields)

    await expect(
      verifyCheckoutFulfillment(
        'test-secret',
        { ...fields, expectedAmountCents: 1 },
        signature
      )
    ).resolves.toBe(false)
    await expect(
      verifyCheckoutFulfillment(
        'test-secret',
        { ...fields, licenseTier: 'unlimited' },
        signature
      )
    ).resolves.toBe(false)
    await expect(
      verifyCheckoutFulfillment(
        'test-secret',
        { ...fields, connectedAccountId: 'acct_attacker' },
        signature
      )
    ).resolves.toBe(false)
  })
})

import {
  createLicenseSnapshot,
  formatCap,
  getLicenseTerms,
  isValidLicenseTier,
} from '../../../src/shared/licenses'
import { describe, expect, it } from 'vitest'

describe('license terms source of truth', () => {
  it('keeps stems and sync rights exclusive to the unlimited tier', () => {
    expect(getLicenseTerms('basic').includesStems).toBe(false)
    expect(getLicenseTerms('premium').includesStems).toBe(false)
    expect(getLicenseTerms('unlimited').includesStems).toBe(true)
    expect(getLicenseTerms('premium').rights.syncAllowed).toBe(false)
    expect(getLicenseTerms('unlimited').rights.syncAllowed).toBe(true)
  })

  it('creates an immutable purchase snapshot with contractual terms and producer credit', () => {
    const snapshot = createLicenseSnapshot('premium', 'Studio & Sons')

    expect(snapshot.termsVersion).toBe('v1.1-2026-01')
    expect(snapshot.creditLineTemplate).toBe('Prod. by Studio & Sons')
    expect(snapshot.prohibitedUses).toContain(
      'Uploading the Beat as-is to Content ID systems or claiming ownership of the Beat itself'
    )
    expect(snapshot.rights.audioStreamingCap).toBe(500_000)
    expect(snapshot.publishingSplit.licenseeWriterSharePercent).toBe(50)
  })

  it('validates tiers and formats contractual caps', () => {
    expect(isValidLicenseTier('unlimited')).toBe(true)
    expect(isValidLicenseTier('exclusive')).toBe(false)
    expect(formatCap(-1)).toBe('Unlimited')
    expect(formatCap(0)).toBe('Not included')
  })
})

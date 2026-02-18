/**
 * Studio Domains Page
 *
 * Provider dashboard for managing custom domains (PRO only).
 * Features:
 * - Connect custom domains (assertEntitlement: maxCustomDomains)
 * - DNS verification instructions (CNAME record)
 * - Status tracking: pending, verified, failed
 * - Disconnect domains
 * - Audit log creation (domain_connect)
 *
 * Requirements: 4.4, 19.4, 1.3
 */

import { StudioDomainsClient } from './StudioDomainsClient'

export const metadata = {
  title: 'Custom Domains | Studio | BroLab Entertainment',
  description: 'Connect custom domains to your storefront',
}

export default function StudioDomainsPage() {
  return <StudioDomainsClient />
}

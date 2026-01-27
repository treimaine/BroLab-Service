'use client'

import { TenantLayout } from '@/components/tenant'
import { WorkspaceProvider } from '@/platform/tenancy'
import { Headphones, Mail, Music } from 'lucide-react'
import { useParams } from 'next/navigation'
import { type ReactNode } from 'react'

/**
 * Tenant Layout - Dynamic workspace layout
 * 
 * This layout wraps all tenant storefront pages.
 * The route group (_t) prefix makes this an internal rewrite route
 * that is not visible in the URL.
 * 
 * URL patterns:
 * - Subdomain: slug.brolabentertainment.com → /_t/[slug]/...
 * - Custom domain: customdomain.com → /_t/[slug]/...
 * 
 * Requirements: 1.2 (multi-tenant routing), 1.3 (workspace resolution)
 * 
 * Note: This is a Client Component to allow passing Lucide icon components
 * to TenantLayout. We use useParams() from next/navigation to get the slug.
 */
export default function TenantRootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string

  // Navigation items for tenant storefront
  // Note: URLs use the slug directly (no /_t prefix) because (_t) is a route group
  const navItems = [
    { 
      id: 'beats', 
      icon: <Music className="w-6 h-6" />, 
      label: 'Beats', 
      href: `/${workspaceSlug}`,
      exact: true,
    },
    { 
      id: 'services', 
      icon: <Headphones className="w-6 h-6" />, 
      label: 'Services', 
      href: `/${workspaceSlug}/services`,
    },
    { 
      id: 'contact', 
      icon: <Mail className="w-6 h-6" />, 
      label: 'Contact', 
      href: `/${workspaceSlug}/contact`,
    },
  ]

  return (
    <WorkspaceProvider slug={workspaceSlug}>
      <TenantLayout 
        navItems={navItems}
        basePath={`/${workspaceSlug}`}
        showPlayerBar={true}
      >
        {children}
      </TenantLayout>
    </WorkspaceProvider>
  )
}

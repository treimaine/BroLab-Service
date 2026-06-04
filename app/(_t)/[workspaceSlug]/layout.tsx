'use client'

import { TenantLayout } from '@/components/tenant'
import { WorkspaceProvider, useWorkspace } from '@/platform/tenancy'
import { Headphones, Mail, Music } from 'lucide-react'
import { useParams } from 'next/navigation'
import { type ReactNode } from 'react'

/**
 * Inner layout that has access to WorkspaceContext to pass workspace name/logo
 * to TenantLayout for the TopMinimalBar brand display.
 */
function TenantLayoutInner({
  children,
  workspaceSlug,
}: Readonly<{
  children: ReactNode
  workspaceSlug: string
}>) {
  const { workspace } = useWorkspace()

  const navItems = [
    {
      id: 'beats',
      icon: Music,
      label: 'Beats',
      href: `/${workspaceSlug}`,
      exact: true,
    },
    {
      id: 'services',
      icon: Headphones,
      label: 'Services',
      href: `/${workspaceSlug}/services`,
    },
    {
      id: 'contact',
      icon: Mail,
      label: 'Contact',
      href: `/${workspaceSlug}/contact`,
    },
  ]

  return (
    <TenantLayout
      navItems={navItems}
      workspaceName={workspace?.name?.toUpperCase() ?? workspaceSlug.toUpperCase()}
      basePath={`/${workspaceSlug}`}
      showPlayerBar={true}
      secondaryAction={{ label: 'Dashboard', href: '/dashboard' }}
    >
      {children}
    </TenantLayout>
  )
}

/**
 * Tenant Layout - Dynamic workspace layout
 *
 * This layout wraps all tenant storefront pages.
 * The route group (_t) prefix makes this an internal rewrite route
 * that is not visible in the URL.
 *
 * Requirements: 1.2 (multi-tenant routing), 1.3 (workspace resolution)
 */
export default function TenantRootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string

  return (
    <WorkspaceProvider slug={workspaceSlug}>
      <TenantLayoutInner workspaceSlug={workspaceSlug}>
        {children}
      </TenantLayoutInner>
    </WorkspaceProvider>
  )
}

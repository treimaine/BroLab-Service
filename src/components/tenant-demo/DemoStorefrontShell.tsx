'use client'

import { TenantLayout, type NavItem } from '@/components/tenant'
import { StorefrontFooter } from '@/components/tenant/storefront'
import { Headphones, Mail, Music } from 'lucide-react'
import type { ReactNode } from 'react'

const demoNavItems: NavItem[] = [
  { id: 'beats', icon: Music, label: 'Beats', href: '/tenant-demo/beats' },
  { id: 'services', icon: Headphones, label: 'Services', href: '/tenant-demo/services' },
  { id: 'contact', icon: Mail, label: 'Contact', href: '/tenant-demo/contact' },
]

export function DemoStorefrontShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <TenantLayout
      navItems={demoNavItems}
      workspaceName="DEMO STUDIO"
      basePath="/tenant-demo"
      showPlayerBar
      secondaryAction={{ label: 'Dashboard', href: '/dashboard' }}
    >
      {children}
      <StorefrontFooter workspaceName="Demo Studio" basePath="/tenant-demo" year={2026} />
    </TenantLayout>
  )
}

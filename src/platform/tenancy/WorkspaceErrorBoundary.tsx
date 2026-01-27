'use client'

import { PillCTA } from '@/platform/ui'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useWorkspace } from './WorkspaceContext'

/**
 * WorkspaceErrorBoundary - Handles workspace loading, error, and inactive states
 * 
 * Wraps tenant page content and displays appropriate UI for:
 * - Loading state (spinner)
 * - Workspace not found (404)
 * - Workspace inactive (subscription expired)
 * 
 * Requirements:
 * - 1.3 (workspace resolution)
 * - 3.5 (tenant storefront remains accessible even if subscription inactive)
 * - 28.1 (data security)
 */
export function WorkspaceErrorBoundary({ children }: Readonly<{ children: ReactNode }>) {
  const { workspace, isLoading, isNotFound, isInactive } = useWorkspace()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading workspace...</p>
        </div>
      </div>
    )
  }

  // Workspace not found (404)
  if (isNotFound || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg))]">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-black text-text mb-4" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            404
          </h1>
          <h2 className="text-2xl font-bold text-text mb-4">Workspace Not Found</h2>
          <p className="text-muted mb-8">
            This workspace does not exist or has been removed.
          </p>
          <Link href="/">
            <PillCTA variant="primary" size="lg">Return to Home</PillCTA>
          </Link>
        </div>
      </div>
    )
  }

  // Workspace inactive (subscription expired)
  // Note: Per Requirement 3.5, tenant storefront remains publicly accessible
  // even if provider subscription is inactive. This is just a notice banner.
  if (isInactive) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        {/* Notice banner */}
        <div className="bg-[rgba(var(--accent),0.1)] border-b border-[rgba(var(--accent),0.3)] px-4 py-3">
          <div className="container mx-auto">
            <p className="text-sm text-center text-accent">
              This workspace is currently inactive. Some features may be limited.
            </p>
          </div>
        </div>
        
        {/* Content still accessible */}
        {children}
      </div>
    )
  }

  // Normal state - render children
  return <>{children}</>
}

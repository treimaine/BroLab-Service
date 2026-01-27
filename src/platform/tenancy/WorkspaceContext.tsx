'use client'

import { useQuery } from 'convex/react'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { api } from '../../../convex/_generated/api'

/**
 * Workspace data type
 * Represents a provider's storefront/tenant
 */
export interface Workspace {
  _id: string
  slug: string
  name: string
  type: 'producer' | 'engineer'
  ownerClerkUserId: string
  stripeAccountId?: string
  paymentsStatus: 'unconfigured' | 'pending' | 'active'
  createdAt: number
}

/**
 * Workspace context type
 * Provides workspace data and loading/error states to tenant pages
 * 
 * Requirements: 1.3 (workspace resolution), 28.1 (data security)
 */
export interface WorkspaceContextType {
  workspace: Workspace | null
  isLoading: boolean
  error: string | null
  isNotFound: boolean
  isInactive: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

/**
 * WorkspaceProvider - Provides workspace context to tenant pages
 * 
 * Fetches workspace data by slug from Convex and makes it available
 * to all child components via useWorkspace hook.
 * 
 * Handles:
 * - Workspace not found (404 state)
 * - Workspace inactive (subscription expired)
 * - Loading states
 * - Error states
 * 
 * Requirements: 
 * - 1.2 (multi-tenant architecture)
 * - 1.3 (workspace resolution)
 * - 28.1 (data security - only return published content)
 */
export function WorkspaceProvider({
  slug,
  children,
}: Readonly<{
  slug: string
  children: ReactNode
}>) {
  // Fetch workspace by slug from Convex
  const workspace = useQuery(api.platform.workspaces.getWorkspaceBySlug, { slug })
  
  // Determine loading state
  const isLoading = workspace === undefined
  
  // Determine error states
  const isNotFound = workspace === null
  const error = isNotFound ? 'Workspace not found' : null
  
  // Check if workspace is inactive (no active subscription)
  // Note: For MVP, we consider workspace always active for storefront viewing
  // Provider admin actions are blocked server-side if subscription inactive
  // Requirement 3.5: Tenant storefront remains publicly accessible even if subscription inactive
  const isInactive = false // Will be implemented when subscription system is added

  const value: WorkspaceContextType = useMemo(() => ({
    workspace: workspace ?? null,
    isLoading,
    error,
    isNotFound,
    isInactive,
  }), [workspace, isLoading, error, isNotFound, isInactive])

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

/**
 * useWorkspace - Hook to access workspace context
 * 
 * Must be used within a WorkspaceProvider.
 * Throws error if used outside provider.
 * 
 * @returns WorkspaceContextType with workspace data and states
 * @throws Error if used outside WorkspaceProvider
 */
export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext)
  
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  
  return context
}

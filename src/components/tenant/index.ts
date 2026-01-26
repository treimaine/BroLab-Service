/**
 * Tenant Components
 * 
 * Components specific to tenant storefronts (provider workspaces).
 * These components handle the responsive layout and navigation
 * for tenant pages accessed via subdomains or custom domains.
 */

export { MobileNav, type MobileNavItem, type MobileNavProps } from './MobileNav';
export { TenantLayout, type NavItem, type TenantLayoutProps } from './TenantLayout';

// Re-export audio components for convenience
export { PlayerBar, type PlayerBarProps } from '../audio';


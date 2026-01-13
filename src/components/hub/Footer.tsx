'use client'

import { ChromeSurface } from '@/platform/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'


/**
 * Hub Footer Component (Dribbble Style)
 * 
 * Provides footer navigation and information for the hub domain.
 * Uses ChromeSurface for theme-coherent background.
 * 
 * CRITICAL: Footer is a CHROME surface, not a CARD surface.
 * It must use bg tokens (--bg) to stay theme-coherent.
 * 
 * Dribbble Design Language:
 * - Dark background (bg-[rgb(var(--bg))]) matching the page
 * - Dense layout with proper spacing
 * - Responsive grid layout
 * 
 * Requirements: 17.1 (Hub Landing Page - footer component)
 * Requirements: Hub Dribbble
 * Requirements: 31 (Marketing Visual Consistency)
 * Requirements: Theme-Coherent Chrome Surfaces (no color drift)
 */
export function Footer() {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()

  // Check if a link is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Link styles with active state and focus-visible ring
  const getLinkStyles = (href: string) => {
    const active = isActive(href)
    return `text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm ${
      active 
        ? 'text-text underline underline-offset-4 decoration-accent' 
        : 'text-muted hover:text-text'
    }`
  }

  const footerLinks = {
    product: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/sign-up', label: 'Get Started' },
    ],
    company: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  }

  return (
    <ChromeSurface as="footer" mode="base">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link 
              href="/" 
              className="text-xl font-bold text-text hover:text-accent transition-colors inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm"
            >
              BroLab
            </Link>
            <p className="mt-4 text-muted text-sm leading-relaxed">
              Your beats. Your brand. Your business.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-text mb-4 text-sm uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={getLinkStyles(link.href)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-text mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={getLinkStyles(link.href)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-text mb-4 text-sm uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={getLinkStyles(link.href)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-sm">
            © {currentYear} BroLab Entertainment. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social links placeholder */}
            <span className="text-muted text-sm">
              Made with 🎵 for music creators
            </span>
          </div>
        </div>
      </div>
    </ChromeSurface>
  )
}

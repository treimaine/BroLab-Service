import { Footer } from '@/components/hub'
import type { ReactNode } from 'react'

/**
 * Hub Layout (ELECTRI-X Style)
 * 
 * The landing page has its own integrated header.
 * This layout only provides the footer.
 */
export default function HubLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col bg-app">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

'use client'

import { DribbbleCard } from '@/platform/ui'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'

type SortOption = 'newest' | 'price-low' | 'price-high'

interface MarketplaceSearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

export default function MarketplaceSearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: Readonly<MarketplaceSearchBarProps>) {
  return (
    <motion.div
      className="mb-grid-4 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <DribbbleCard padding="sm">
        <div className="flex flex-col gap-grid-2 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-grid-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              aria-label="Search beats by title, producer, or tag"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search beats…"
              className="h-14 w-full rounded-2xl border-0 bg-transparent pl-12 pr-grid-3 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-grid-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <select
              aria-label="Sort beats"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-14 min-w-[220px] cursor-pointer appearance-none rounded-2xl border-0 bg-transparent pl-12 pr-grid-3 text-text transition-all focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </DribbbleCard>
    </motion.div>
  )
}

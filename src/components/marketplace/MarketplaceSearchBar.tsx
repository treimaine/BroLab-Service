'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'

interface MarketplaceSearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: 'newest' | 'price-low' | 'price-high'
  onSortChange: (sort: 'newest' | 'price-low' | 'price-high') => void
}

export default function MarketplaceSearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: MarketplaceSearchBarProps) {
  return (
    <motion.div
      className="mb-grid-4 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col md:flex-row gap-grid-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-grid-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search beats by title, producer, or vibe..."
            className="w-full h-14 pl-12 pr-grid-3 bg-card/60 backdrop-blur-glass border border-border/[var(--border-alpha)] rounded-2xl text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-grid-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="h-14 pl-12 pr-grid-3 bg-card/60 backdrop-blur-glass border border-border/[var(--border-alpha)] rounded-2xl text-text focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </motion.div>
  )
}

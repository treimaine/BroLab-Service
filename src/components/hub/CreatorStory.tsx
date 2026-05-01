import React from 'react'

export interface CreatorStoryData {
  id: string
  name: string
  niche: string
  earnings: string
  quote: string
  image?: string
  profileUrl?: string
}

interface CreatorStoryProps {
  story: CreatorStoryData
  variant?: 'card' | 'compact'
  className?: string
}

/**
 * CreatorStory Component
 *
 * Displays individual creator success stories
 * Builds trust through social proof and real earnings examples
 *
 * Features:
 * - Creator photo/avatar
 * - Name and niche
 * - Earnings highlight
 * - Testimonial quote
 * - Link to creator profile
 * - Mobile responsive
 */
export const CreatorStory: React.FC<CreatorStoryProps> = ({
  story,
  variant = 'card',
  className = ''
}) => {
  const isCard = variant === 'card'

  return (
    <div
      className={`rounded-xl border border-border bg-[rgba(var(--bg-2),0.45)] overflow-hidden transition-all hover:border-[rgb(var(--accent))]/50 hover:shadow-lg ${
        isCard ? 'p-6' : 'p-4'
      } ${className}`}
    >
      {/* Creator Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar Placeholder */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--accent))]/30 to-[rgb(var(--accent))]/10 flex-shrink-0 flex items-center justify-center">
          <span className="text-sm font-bold text-[rgb(var(--accent))]">
            {story.name.charAt(0)}
          </span>
        </div>

        {/* Creator Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text truncate">
            {story.name}
          </h3>
          <p className="text-xs text-muted">
            {story.niche}
          </p>
        </div>
      </div>

      {/* Earnings Highlight */}
      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-[rgb(var(--accent))]/15 to-transparent border border-[rgb(var(--accent))]/20">
        <p className="text-sm font-semibold text-[rgb(var(--accent))]">
          {story.earnings}
        </p>
      </div>

      {/* Quote */}
      <p className={`text-muted mb-4 line-clamp-3 ${
        isCard ? 'text-sm' : 'text-xs'
      }`}>
        &quot;{story.quote}&quot;
      </p>

      {/* CTA Link */}
      {story.profileUrl && (
        <a
          href={story.profileUrl}
          className="text-xs font-semibold text-[rgb(var(--accent))] hover:underline inline-block"
        >
          View Profile →
        </a>
      )}
    </div>
  )
}

interface CreatorStoriesProps {
  stories: CreatorStoryData[]
  title?: string
  subtitle?: string
  maxStories?: number
  className?: string
}

/**
 * CreatorStories Component - Grid/Carousel of success stories
 *
 * Displays multiple creator success stories
 * Builds social proof and conversion confidence
 */
export const CreatorStories: React.FC<CreatorStoriesProps> = ({
  stories,
  title = 'Creator Success Stories',
  subtitle = 'See how creators are earning with BroLab',
  maxStories = 3,
  className = ''
}) => {
  const displayStories = stories.slice(0, maxStories)

  return (
    <section className={`w-full py-8 sm:py-12 px-4 sm:px-6 ${className}`}>
      {/* Header */}
      <div className="mb-8 max-w-3xl">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-text mb-2">
          {title}
        </h2>
        <p className="text-base text-muted">
          {subtitle}
        </p>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {displayStories.map((story) => (
          <CreatorStory
            key={story.id}
            story={story}
            variant="card"
          />
        ))}
      </div>
    </section>
  )
}

export default CreatorStory

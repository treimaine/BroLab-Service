'use client'

import { DribbbleCard, DribbbleSectionEnter, DribbbleStaggerItem } from '@/platform/ui'
import { Quote } from 'lucide-react'

export interface CreatorStoryData {
  id: string
  name: string
  niche?: string
  genre?: string
  role?: string
  earnings?: string
  monthlyEarnings?: number
  quote?: string
  testimonial?: string
  image?: string
  avatar?: string
  profileUrl?: string
}

interface CreatorStoriesProps {
  readonly stories: CreatorStoryData[]
  readonly title?: string
  readonly subtitle?: string
  readonly maxStories?: number
  readonly className?: string
}

/**
 * NOTE: MOCK_CREATOR_STORIES was removed. It held three fabricated creators
 * with invented monthly earnings, and was rendered on /onboarding under the
 * heading "Real creators, real earnings". Only pass this component quotes from
 * real, consenting creators.
 */
export function CreatorStories({
  stories,
  title,
  subtitle,
  maxStories = 3,
  className = ''
}: CreatorStoriesProps) {
  const displayStories = stories.slice(0, maxStories)

  return (
    <section className="px-4 py-14 bg-[rgb(var(--bg))]">
      <div className="container mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">{title}</h2>
            )}
            {subtitle && (
              <p className="text-muted text-sm">{subtitle}</p>
            )}
          </div>
        )}
        
        <DribbbleSectionEnter stagger>
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
            {displayStories.map((story) => (
              <DribbbleStaggerItem key={story.id}>
                <DribbbleCard hoverLift padding="lg" className="h-full flex flex-col justify-between">
                  <div>
                    <Quote className="w-8 h-8 text-accent opacity-20 mb-4" />
                    <p className="text-sm text-text leading-relaxed italic mb-6">
                      &quot;{story.quote || story.testimonial}&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-accent/20 to-accent-2/20 flex items-center justify-center text-xs font-bold text-accent">
                      {story.avatar || story.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text uppercase">{story.name}</p>
                      <p className="text-[10px] text-muted">{story.role || story.niche || story.genre}</p>
                    </div>
                  </div>
                </DribbbleCard>
              </DribbbleStaggerItem>
            ))}
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

export const CreatorStory = CreatorStories

export default CreatorStories

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

export const MOCK_CREATOR_STORIES: CreatorStoryData[] = [
  {
    id: '1',
    name: 'Alex Rivers',
    role: 'Multi-Platinum Producer',
    niche: 'Hip-Hop/Trap',
    avatar: 'AR',
    monthlyEarnings: 3400,
    earnings: '$3,400/month',
    quote: "BroLab changed everything for me. I launched my store in 10 minutes and sold my first exclusive beat the next day with 0% commission.",
    profileUrl: '#',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Mixing Engineer',
    niche: 'Electronic/Ambient',
    avatar: 'SC',
    monthlyEarnings: 2100,
    earnings: '$2,100/month',
    quote: "The automated licensing and Stripe integration are seamless. I can focus on mixing while the platform handles the business.",
    profileUrl: '#',
  },
  {
    id: '3',
    name: 'Marcus J',
    role: 'Independent Artist',
    niche: 'R&B/Soul',
    avatar: 'MJ',
    monthlyEarnings: 5200,
    earnings: '$5,200/month',
    quote: "As an artist, I love the clean interface and the high-quality previews. Finding the right beat has never been this professional.",
    profileUrl: '#',
  },
]

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

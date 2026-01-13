'use client'

import { LucideIcon } from 'lucide-react'
import { DribbbleCard } from './DribbbleCard'
import { PillCTA } from './PillCTA'

interface RoleCTACardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function RoleCTACard({
  icon: Icon,
  title,
  description,
  href,
  variant = 'primary',
}: RoleCTACardProps) {
  return (
    <DribbbleCard hoverLift padding="lg" className="h-full flex flex-col">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-[rgba(var(--accent),0.15)] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-accent" />
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-bold text-text mb-2 uppercase tracking-wide">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-muted text-sm leading-relaxed mb-6 flex-grow">
        {description}
      </p>
      
      {/* CTA Button */}
      <a href={href} className="block">
        <PillCTA variant={variant} size="lg" icon={Icon} className="w-full">
          {title}
        </PillCTA>
      </a>
    </DribbbleCard>
  )
}

'use client'

import { DribbbleSectionEnter, WavyLines } from '@/platform/ui'

interface StorefrontPageHeaderProps {
  eyebrow: string
  title: string
  description: string
  maxWidth?: 'default' | 'wide'
}

export function StorefrontPageHeader({
  eyebrow,
  title,
  description,
  maxWidth = 'default',
}: Readonly<StorefrontPageHeaderProps>) {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-14 lg:px-8 lg:pb-14">
      <WavyLines className="right-0 top-0 h-full w-[120px] opacity-30" />
      <div className={`container relative z-10 mx-auto ${maxWidth === 'wide' ? 'max-w-6xl' : ''}`}>
        <DribbbleSectionEnter>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-text md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}

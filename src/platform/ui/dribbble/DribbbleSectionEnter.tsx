'use client'

import { type ReactNode } from 'react'

/**
 * Base wrapper props
 */
interface BaseWrapperProps {
  children: ReactNode
  className?: string
}

/**
 * Base wrapper component - shared implementation
 */
function BaseWrapper({ children, className = '' }: Readonly<BaseWrapperProps>) {
  return <div className={className}>{children}</div>
}

/**
 * DribbbleSectionEnter - Scroll reveal wrapper (simplified - no animations for now)
 */
interface DribbbleSectionEnterProps extends BaseWrapperProps {
  stagger?: boolean
  delay?: number
}

export function DribbbleSectionEnter({
  children,
  className = '',
  // stagger and delay reserved for future animation implementation
}: Readonly<DribbbleSectionEnterProps>) {
  return <BaseWrapper className={className}>{children}</BaseWrapper>
}

DribbbleSectionEnter.displayName = 'DribbbleSectionEnter'

/**
 * DribbbleStaggerItem - Child item (simplified - no animations for now)
 */
export function DribbbleStaggerItem({
  children,
  className = '',
}: Readonly<BaseWrapperProps>) {
  return <BaseWrapper className={className}>{children}</BaseWrapper>
}

DribbbleStaggerItem.displayName = 'DribbbleStaggerItem'

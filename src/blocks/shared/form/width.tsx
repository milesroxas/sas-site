import type * as React from 'react'
import { cn } from '@/utilities/ui'

/**
 * Column span of a field inside the form grid. The CMS states a percentage per
 * field; the form is a two-column grid from `md` up, so anything at or under
 * half fills one column and everything else spans the row.
 *
 * Below `md` every field spans the single column — a half-width control on a
 * phone is unusable, and the CMS value is about the desktop rhythm.
 */
export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  const percent = typeof width === 'string' ? Number.parseFloat(width) : width
  const isHalf = typeof percent === 'number' && Number.isFinite(percent) && percent <= 50

  return (
    <div className={cn('min-w-0', isHalf ? 'md:col-span-1' : 'md:col-span-2', className)}>
      {children}
    </div>
  )
}

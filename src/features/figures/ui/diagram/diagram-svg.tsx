import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'
import { canvasStyle } from '../canvas'

/** How a drawing is named: by the figure's title when it has one, and always described by its text alternative. */
export type DiagramNaming = { describedBy: string; label: string; labelledBy?: string }

/**
 * The `<svg>` every diagram kind draws into: an image named by the frame,
 * sized by `canvasStyle` so it fills its frame up to 1:1 and stops shrinking
 * while its type still reads. A symmetric drawing centres in a wider frame; a
 * run that reads down its left edge (`align="start"`) stays on the text's
 * margin instead.
 */
export const DiagramSvg = ({
  align = 'centre',
  children,
  describedBy,
  height,
  label,
  labelledBy,
  width,
}: DiagramNaming & {
  align?: 'centre' | 'start'
  children: ReactNode
  height: number
  width: number
}) => (
  <svg
    aria-describedby={describedBy}
    aria-label={labelledBy ? undefined : label}
    aria-labelledby={labelledBy}
    className={cn('figure-diagram block font-sans', align === 'centre' && 'mx-auto')}
    role="img"
    style={canvasStyle(width)}
    viewBox={`0 0 ${width} ${height}`}
  >
    {children}
  </svg>
)

import type * as React from 'react'
import { cn } from '@/utilities/ui'

/**
 * Progressive backdrop blur — stacked `backdrop-filter` layers, each masked to
 * an overlapping band so blur strength ramps toward one edge (frosted-glass
 * gradient). Layers compound: each blurs the already-blurred output beneath
 * it, so the strongest edge reads far softer than its own radius.
 *
 * Size to the content it sits behind, not a fraction of the media — this is a
 * chrome material under a label, not a wash over the image.
 *
 * No color: the mask alpha is what applies the blur, so the weakest layer ramps
 * up from fully transparent and the material has no visible top edge.
 */

const DEFAULT_BLUR_LEVELS = [2, 4, 8, 16]

export function ProgressiveBlur({
  className,
  levels = DEFAULT_BLUR_LEVELS,
  side = 'bottom',
  ...props
}: React.ComponentProps<'div'> & {
  /** Blur radii in px, ordered from the soft edge to the strong edge. */
  levels?: number[]
  /** Edge the blur ramps toward. */
  side?: 'bottom' | 'top'
}) {
  const step = 100 / (levels.length + 1)
  const direction = side === 'bottom' ? 'to bottom' : 'to top'

  return (
    <div aria-hidden className={cn('pointer-events-none', className)} {...props}>
      {levels.map((blur, index) => {
        const isLast = index === levels.length - 1
        const stops = isLast
          ? `transparent ${index * step}%, black ${(index + 1) * step}%`
          : `transparent ${index * step}%, black ${(index + 1) * step}%, black ${(index + 2) * step}%, transparent ${(index + 3) * step}%`
        const mask = `linear-gradient(${direction}, ${stops})`

        return (
          <div
            className="absolute inset-0"
            key={`${blur}-${index}`}
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}

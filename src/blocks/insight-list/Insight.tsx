import type React from 'react'
import { ordinalLabel } from '@/blocks/shared/numbering'
import type { InsightListBlock as InsightListBlockData } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

/**
 * One insight, stated once: the Insight list block renders it in a numbered
 * run beside a heading, and the Rich text editor's Insights block renders the
 * same item inside a reading column. Either caller places the item on the
 * composition grid; the item owns only its own stack.
 */
export type InsightMarkSize = NonNullable<InsightListBlockData['markSize']>
export type InsightItem = NonNullable<InsightListBlockData['items']>[number]

/** Editor-chosen mark box; `medium` is the Paper frame's 40px slot. */
const MARK_SIZE_CLASS: Record<InsightMarkSize, string> = {
  small: 'size-7',
  medium: 'size-10',
  large: 'size-14',
}

/**
 * The SVG mark, painted as a mask over the current text color rather than as
 * an image: the file's own fills and strokes become a silhouette in whatever
 * ink the band uses, so one upload reads correctly on a light page and on an
 * inverted band alike. Decorative beside the title, hence hidden from AT.
 *
 * The slot keeps its size when an insight has no mark, so titles stay on one
 * lane across a list where only some items carry one.
 */
const Mark: React.FC<{ media: InsightItem['media']; size: InsightMarkSize }> = ({
  media,
  size,
}) => {
  const doc = media && typeof media === 'object' && media.url ? media : null
  return (
    <span
      aria-hidden="true"
      className={cn(
        'shrink-0',
        MARK_SIZE_CLASS[size],
        doc && 'bg-current mask-center mask-contain mask-no-repeat',
      )}
      style={doc ? { maskImage: `url("${getMediaUrl(doc.url, doc.updatedAt)}")` } : undefined}
    />
  )
}

/**
 * One insight: a rule, then the mark and its ordinal on one line, then the
 * copy. `group` is the reveal beat the item shares (`data-reveal-group`
 * folds consecutive markers), so insights on one row land as one thought
 * rather than a cascade; a caller keys it by row and, where a page may hold
 * several runs, by run.
 */
export const Insight: React.FC<{
  className?: string
  group: string
  index: number
  item: InsightItem
  markSize: InsightMarkSize
}> = ({ className, group, index, item, markSize }) => (
  <li
    className={cn('flex flex-col gap-5 border-t border-border pt-5', className)}
    data-reveal
    data-reveal-group={group}
  >
    <div className="flex items-center justify-between">
      <Mark media={item.media} size={markSize} />
      <span className="font-mono text-xs/none tracking-widest text-muted-foreground">
        {ordinalLabel(index)}
      </span>
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="text-xl/7 font-medium">{item.title}</h3>
      <p className="text-base text-muted-foreground">{item.description}</p>
    </div>
  </li>
)

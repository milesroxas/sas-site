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
/** A resolved upload with a URL to mask; ids and empty relations carry none. */
const markDoc = (media: InsightItem['media']) =>
  media && typeof media === 'object' && media.url ? media : null

/**
 * Whether a run has any mark to show. A list where no insight carries one
 * drops the mark lane entirely and sets the ordinal beside the title instead
 * (`compact`), so the run reads as a tight numbered list rather than a grid
 * of empty slots. Decided per run, not per item, so titles keep one lane.
 */
export const hasInsightMarks = (items: readonly InsightItem[]) =>
  items.some((item) => markDoc(item.media) !== null)

const Mark: React.FC<{ media: InsightItem['media']; size: InsightMarkSize }> = ({
  media,
  size,
}) => {
  const doc = markDoc(media)
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

const ordinalClassName = 'font-mono text-xs/none tracking-widest text-muted-foreground'

/**
 * One insight: a rule, then the mark and its ordinal on one line, then the
 * copy. `compact` (a run with no marks, see `hasInsightMarks`) drops the mark
 * line, leads the title with the ordinal, and closes the stack up. `group`
 * is the reveal beat the item shares (`data-reveal-group` folds consecutive
 * markers), so insights on one row land as one thought rather than a
 * cascade; a caller keys it by row and, where a page may hold several runs,
 * by run.
 */
export const Insight: React.FC<{
  className?: string
  compact?: boolean
  group: string
  index: number
  item: InsightItem
  markSize: InsightMarkSize
}> = ({ className, compact, group, index, item, markSize }) => (
  <li
    className={cn(
      'flex flex-col border-t border-border',
      compact ? 'gap-2 pt-4' : 'gap-5 pt-5',
      className,
    )}
    data-reveal
    data-reveal-group={group}
  >
    {compact ? null : (
      <div className="flex items-center justify-between">
        <Mark media={item.media} size={markSize} />
        <span className={ordinalClassName}>{ordinalLabel(index)}</span>
      </div>
    )}
    <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-2')}>
      <h3 className={cn('text-xl/7 font-medium', compact && 'flex items-baseline gap-3')}>
        {compact ? <span className={ordinalClassName}>{ordinalLabel(index)}</span> : null}
        {item.title}
      </h3>
      <p className="text-base text-muted-foreground">{item.description}</p>
    </div>
  </li>
)

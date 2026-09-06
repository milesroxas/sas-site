import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
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

/**
 * How one insight is built: `stack` (mark line, then copy, for a cell in a
 * multi-column run) or `row` (title lane beside description lane, for a
 * ledger where each insight takes the whole list width).
 */
export type InsightArrangement = 'row' | 'stack'

/**
 * Editor-chosen mark box (`medium` is the Paper frame's 40px slot) and, for
 * the row arrangement, the matching minimum height of the title's line so a
 * title beside a mark centers on it.
 */
const MARK_SIZE_CLASS: Record<InsightMarkSize, { box: string; line: string }> = {
  small: { box: 'size-7', line: 'min-h-7' },
  medium: { box: 'size-10', line: 'min-h-10' },
  large: { box: 'size-14', line: 'min-h-14' },
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
        MARK_SIZE_CLASS[size].box,
        doc && 'bg-current mask-center mask-contain mask-no-repeat',
      )}
      style={doc ? { maskImage: `url("${getMediaUrl(doc.url, doc.updatedAt)}")` } : undefined}
    />
  )
}

const ordinalClassName = 'font-mono text-xs/none tracking-widest text-muted-foreground'
const titleClassName = 'text-xl/7 font-medium'
const descriptionClassName = 'text-base text-muted-foreground'

type InsightProps = {
  className?: string
  compact?: boolean
  group: string
  index: number
  item: InsightItem
  markSize: InsightMarkSize
}

/**
 * The stacked insight: a rule, then the mark and its ordinal on one line,
 * then the copy. `compact` (a run with no marks, see `hasInsightMarks`)
 * drops the mark line, leads the title with the ordinal, and closes the
 * stack up.
 */
const InsightStack: React.FC<InsightProps> = ({
  className,
  compact,
  group,
  index,
  item,
  markSize,
}) => (
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
      <h3 className={cn(titleClassName, compact && 'flex items-baseline gap-3')}>
        {compact ? <span className={ordinalClassName}>{ordinalLabel(index)}</span> : null}
        {item.title}
      </h3>
      <p className={descriptionClassName}>{item.description}</p>
    </div>
  </li>
)

/**
 * The ledger row: the insight laid across the list's columns as two lanes,
 * mark and title in the first half, description and ordinal in the second.
 * The row is a subgrid of the list, so each lane is a span of page columns
 * and the caller's `className` says how many the row takes. The lanes align
 * on their first baselines, so the description's first line reads level
 * with the title whatever the mark size. The title is the title lane's only
 * baseline participant (`self-baseline`), which makes it the lane's
 * baseline (an empty mark box has none to offer), and its line is at least
 * as tall as the mark with the text centered in it, so a one-line title
 * sits centered on the mark and a wrapped one hangs beside it. `compact`
 * drops the mark. Below `md` the lanes stack, mark beside title, then the
 * description with its ordinal.
 */
const InsightRow: React.FC<InsightProps> = ({
  className,
  compact,
  group,
  index,
  item,
  markSize,
}) => (
  <BlockGrid
    as="li"
    className={cn('items-baseline gap-y-2 border-t border-border py-5', className)}
    data-reveal
    data-reveal-group={group}
    subgrid
  >
    <div className="flex items-start gap-6 md:col-span-3">
      {compact ? null : <Mark media={item.media} size={markSize} />}
      <h3
        className={cn(
          titleClassName,
          'flex items-center self-baseline',
          compact ? null : MARK_SIZE_CLASS[markSize].line,
        )}
      >
        {item.title}
      </h3>
    </div>
    <div className="flex items-baseline justify-between gap-6 md:col-span-3">
      <p className={descriptionClassName}>{item.description}</p>
      <span className={cn(ordinalClassName, 'w-6 shrink-0 text-end')}>{ordinalLabel(index)}</span>
    </div>
  </BlockGrid>
)

/**
 * One insight in either arrangement (see `InsightArrangement`). `group` is
 * the reveal beat the item shares (`data-reveal-group` folds consecutive
 * markers), so insights on one row land as one thought rather than a
 * cascade; a caller keys it by row and, where a page may hold several runs,
 * by run.
 */
export const Insight: React.FC<InsightProps & { arrangement?: InsightArrangement }> = ({
  arrangement = 'stack',
  ...props
}) => (arrangement === 'row' ? <InsightRow {...props} /> : <InsightStack {...props} />)

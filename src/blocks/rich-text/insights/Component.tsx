import type React from 'react'
import { Insight } from '@/blocks/insight-list/Insight'
import { BlockGrid } from '@/blocks/shared/grid'
import type { RichTextInsightsBlock as RichTextInsightsBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

type RichTextInsightsProps = Pick<RichTextInsightsBlockData, 'items'> & {
  /**
   * Reveal beat prefix, unique per run on the page: rows of two runs in one
   * body must not fold onto the same beat.
   */
  group: string
}

/**
 * How the run sits on the composition grid, by how many insights it holds.
 * The run starts in the reading column (column 3): a single insight fills the
 * column, two share it, and from three the run opens out to the right edge
 * (columns 3-8) with three per row, so the insights read as a wider shelf
 * under the copy rather than a stack of narrow cells.
 */
const arrangement = (count: number) =>
  count <= 1
    ? { list: 'md:col-span-4', item: 'md:col-span-4', perRow: 1 }
    : count === 2
      ? { list: 'md:col-span-4', item: 'md:col-span-2', perRow: 2 }
      : { list: 'md:col-span-6', item: 'md:col-span-2', perRow: 3 }

/**
 * The run: a subgrid of the composition grid so each insight spans the same
 * tracks the copy sits on. Placed by its caller as one cell of the block's
 * grid (`className` carries the column start); insights in the same row
 * share a reveal beat.
 */
export const RichTextInsights: React.FC<RichTextInsightsProps & { className?: string }> = ({
  className,
  group,
  items,
}) => {
  const insights = items ?? []
  if (insights.length === 0) return null

  const { item: itemClassName, list, perRow } = arrangement(insights.length)

  return (
    <BlockGrid as="ol" className={cn(list, className)} subgrid>
      {insights.map((item, index) => (
        <Insight
          className={itemClassName}
          group={`${group}-row-${Math.floor(index / perRow)}`}
          index={index}
          item={item}
          key={item.id ?? index}
          markSize="medium"
        />
      ))}
    </BlockGrid>
  )
}

import type { HTMLAttributes } from 'react'
import { cn } from '@/utilities/ui'

/**
 * The composition grid: the single horizontal-layout truth for the reorganized
 * blocks (docs/block-grid-roadmap.md).
 *
 * Eight equal columns from `md`, one column below; the gap between columns is
 * the one `--spacing-grid` token (globals.css), which also spaces the stacked
 * cells below `md`. Blocks place children with plain `md:col-start-*` and
 * `md:col-span-*` utilities and never restate the track list, the gap, or the
 * mount breakpoint. Widths come from spanning columns, not `max-w-*`; offsets
 * come from starting columns, not spacer cells or padding.
 *
 * `subgrid` is for a cell that holds a run of its own cells (a list of
 * insights beside a heading): the cell adopts the columns it spans from the
 * parent grid, so its children place on the same tracks with the same gap
 * and nothing is restated. Below `md` it stacks like any other grid. A second
 * eight-column grid inside a cell is never right: its columns would not line
 * up with the page's.
 *
 * A subgrid may itself hold a subgrid when a cell of the run is a row of
 * lanes on page columns (an Insight list ledger row: `li` inside the `ol`).
 * Both adopt the page tracks, so nothing is restated at any depth.
 *
 * The grid sits inside the page column (`container`), so column 1 starts at
 * the page gutter. Vertical rhythm inside a cell stays with `text-stack`;
 * rhythm between cells is the grid's row gap.
 */
export const BlockGrid = ({
  as: Tag = 'div',
  className,
  subgrid = false,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'li' | 'ol' | 'ul'
  subgrid?: boolean
}) => (
  <Tag
    className={cn(
      'grid grid-cols-1 gap-grid',
      subgrid ? 'md:grid-cols-subgrid' : 'md:grid-cols-8',
      className,
    )}
    {...props}
  />
)

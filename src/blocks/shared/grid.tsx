import type { ReactNode } from 'react'
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
 * The grid sits inside the page column (`container`), so column 1 starts at
 * the page gutter. Vertical rhythm inside a cell stays with `text-stack`;
 * rhythm between cells is the grid's row gap.
 */
export const BlockGrid = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('grid grid-cols-1 gap-grid md:grid-cols-8', className)}>{children}</div>
)

'use client'

import { IconArrowUp } from '@tabler/icons-react'
import { type MouseEvent, type ReactNode, useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utilities/ui'
import type { ContentsEntry } from './headings'

/** The landmark's name, and the label over the list. */
export const CONTENTS_LIST_LABEL = 'On this page'

/**
 * The two surfaces are one list at two sizes: the card's rows are pointer
 * rows, the sheet's are thumb rows (taller, larger type, rounder to stay
 * concentric with the sheet's corners). Each corner is the surface's own
 * radius less its padding, so a highlighted row nests in the surface rather
 * than floating as a lozenge inside it: the card is `--radius-menu-card`
 * (12px) over `p-2`, the sheet `--radius-sheet` (16px) over `px-2`.
 */
const DENSITY = {
  card: 'h-11 rounded-md text-sm/5',
  sheet: 'h-13 rounded-lg text-base/6',
} as const

export type ContentsDensity = keyof typeof DENSITY

/**
 * One row recipe for sections and "Back to top". Press compresses on the
 * shared recipe from the leading edge, so a wide row reads as pressed, not
 * slid; `pressable` owns the transition list, so the fill fades on it.
 */
const rowClassName = (density: ContentsDensity, current = false) =>
  cn(
    'flex w-full shrink-0 cursor-pointer items-center px-3 text-left text-popover-foreground',
    'pressable pressable-subtle origin-left outline-hidden',
    'hover:bg-accent active:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
    DENSITY[density],
    current && 'bg-accent font-medium',
  )

/** Fixed leading lane, so numbers and the arrow share one column across rows. */
const LeadingLane = ({ children, current }: { children: ReactNode; current?: boolean }) => (
  <span
    className={cn(
      'flex w-8 shrink-0 items-center font-mono text-xs/4',
      current ? 'text-popover-foreground' : 'text-muted-foreground',
    )}
  >
    {children}
  </span>
)

const position = (index: number) => String(index + 1).padStart(2, '0')

export function ContentsList({
  entries,
  current,
  density,
  onJump,
  className,
  topRowClassName,
}: {
  entries: ContentsEntry[]
  current: number
  density: ContentsDensity
  /** A section's entry, or `null` for the top of the page. */
  onJump: (entry: ContentsEntry | null) => void
  className?: string
  /** Room for whatever shares the last row (the card's close control). */
  topRowClassName?: string
}) {
  const viewportRef = useRef<HTMLDivElement>(null)

  // A long index opens with the current row in view. One read on open, by
  // offsets inside the list's own scroller, so the page never moves.
  useEffect(() => {
    const viewport = viewportRef.current
    const row = viewport?.querySelector<HTMLElement>('[aria-current]')
    if (!viewport || !row) return
    viewport.scrollTop = row.offsetTop - (viewport.clientHeight - row.offsetHeight) / 2
  }, [])

  // The rows are real in-page links (shareable, readable with no script), so
  // Lenis's `anchors` handler would also answer the click, from the window,
  // and its scroll would replace ours along with the focus move riding on it.
  // Stopping the event at the row keeps one writer per jump.
  const jump = (event: MouseEvent, entry: ContentsEntry | null) => {
    event.preventDefault()
    event.stopPropagation()
    onJump(entry)
  }

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="flex h-9 shrink-0 items-center justify-between px-3 font-mono text-xs/4 tracking-[0.08em] text-muted-foreground">
        <span className="uppercase">{CONTENTS_LIST_LABEL}</span>
        <span>
          {Math.max(current, 0) + 1} / {entries.length}
        </span>
      </div>
      {/* The list is the only part that scrolls, and the wheel stays in it.
          Each surface sets the cap (`--contents-list-max`, globals.css). */}
      <ScrollArea
        data-lenis-prevent
        // Radix sizes the viewport's inner wrapper as a table, which grows to
        // the longest label instead of letting it truncate.
        viewportClassName="max-h-(--contents-list-max) *:block!"
        viewportRef={viewportRef}
      >
        <ol className="flex flex-col">
          {entries.map((entry, index) => {
            const isCurrent = index === current
            return (
              <li key={entry.id}>
                <a
                  aria-current={isCurrent ? 'location' : undefined}
                  className={rowClassName(density, isCurrent)}
                  href={`#${entry.id}`}
                  onClick={(event) => jump(event, entry)}
                >
                  <LeadingLane current={isCurrent}>{position(index)}</LeadingLane>
                  <span className="min-w-0 grow truncate">{entry.label}</span>
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    {isCurrent && <span className="size-2 rounded-full bg-active" />}
                  </span>
                </a>
              </li>
            )
          })}
        </ol>
      </ScrollArea>
      {/* The rule spans exactly the rows' own width, so its ends and a
          highlighted row's edges agree, with equal air on both sides. */}
      <div className="shrink-0 py-1.5">
        <div className="h-px bg-border" />
      </div>
      <button
        className={cn(rowClassName(density), topRowClassName)}
        onClick={(event) => jump(event, null)}
        type="button"
      >
        <LeadingLane>
          <IconArrowUp aria-hidden className="size-4" />
        </LeadingLane>
        Back to top
      </button>
    </div>
  )
}

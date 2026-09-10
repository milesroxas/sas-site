import type React from 'react'
import { cursorTarget } from '@/features/cursor'
import { cn } from '@/utilities/ui'
import { CHAT_WINDOW_RESIZE_MS } from './motion'

/** The box the docked page frame lands on (measured by the menu's GSAP timeline). */
export const PREVIEW_WINDOW_SELECTOR = '[data-menu-preview-window]'

type MenuPreviewSlotProps = React.ComponentProps<'div'> & {
  /**
   * Chat view has claimed the slot: the window grows to fill it so the
   * transcript is not confined to the preview's 16:9 box. Set on the beat
   * the cover has painted the docked window's lower edge (the panel is
   * opaque, and the frame paints only its clipped box: anything of the
   * panel outside the window would show against the menu background
   * before that). Dropped at once on exit: the shrink back to 16:9 runs in
   * view, and the menu returns the frame only once it lands
   * (CHAT_WINDOW_RESIZE_MS, shared with the menu's exit timeline).
   */
  expanded?: boolean
}

/**
 * The takeover menu's center slot. On desktop it takes the height the
 * center cell has left above the composer and centers the 16:9 preview
 * window in it; on a phone the slot is the window (MenuAsk grows the slot
 * itself into the column the nav releases). The docked page frame lands
 * exactly on the window (`data-menu-preview-window`), so it renders whether
 * or not the Ask composer is on the site: MenuAsk mounts the transcript
 * panel inside it, with Ask hidden the menu renders the bare slot.
 *
 * The window is the one hit-testable part of the slot: the docked frame
 * above it is inert, so a click on the preview lands here and the menu
 * (which delegates from its overlay) closes on it. The slot around the
 * window stays transparent to the pointer. Chat view claims the window for
 * the transcript, so the close affordance (the cursor label) steps aside
 * with `expanded`; the menu gates the click on the same state.
 */
export const MenuPreviewSlot = ({
  expanded = false,
  className,
  children,
  ...props
}: MenuPreviewSlotProps) => (
  <div
    data-menu-preview-slot
    className={cn(
      'pointer-events-none relative aspect-video w-full md:@container md:flex md:min-h-0 md:flex-1 md:aspect-auto md:items-center',
      className,
    )}
    {...props}
  >
    <div
      data-menu-preview-window
      className={cn(
        // 16:9 of the slot's width (the column); `max-h-full` only guards a
        // viewport too short for it. Height, not aspect-ratio, so the resize
        // to and from the full slot is a plain length transition, and the
        // slot's centering keeps both edges moving together. Grow eases out,
        // shrink eases in: the same beat read in reverse.
        'pointer-events-auto relative size-full md:max-h-full md:motion-safe:transition-[height]',
        expanded ? 'md:h-full md:ease-out' : 'md:h-[calc(100cqw*9/16)] md:ease-in',
      )}
      style={{ transitionDuration: `${CHAT_WINDOW_RESIZE_MS}ms` }}
      {...(expanded ? {} : cursorTarget({ label: 'Close' }))}
    >
      {children}
    </div>
  </div>
)

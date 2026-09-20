'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'
import { onChromeScroll } from '@/components/SiteChrome/chrome-scroll'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/utilities/ui'
import { CONTENTS_LIST_LABEL, ContentsList } from './ContentsList'
import type { ContentsEntry } from './headings'
import { usePresence } from './use-presence'
import { useSheetDrag } from './use-sheet-drag'

/** Reading on is a dismissal: past this much scroll the open card steps aside. */
const SCROLL_DISMISS_PX = 64

export type ContentsPanelProps = {
  id: string
  open: boolean
  entries: ContentsEntry[]
  current: number
  /** Below `md` the index is a sheet; above, the card that grows from the button. */
  sheet: boolean
  /** The anchor holding the button and the card: a press inside it is not "outside". */
  anchorRef: RefObject<HTMLElement | null>
  /** `restoreFocus` when the close came from the keyboard and focus must not be lost. */
  onClose: (options?: { restoreFocus?: boolean }) => void
  onJump: (entry: ContentsEntry | null) => void
}

/**
 * Desktop: a non-modal disclosure. No scrim and no focus trap, so reading
 * continues behind it; Escape, a press outside, or scrolling on closes it.
 */
function ContentsCard({
  id,
  open,
  entries,
  current,
  anchorRef,
  onClose,
  onJump,
}: ContentsPanelProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const { mounted, animating } = usePresence(layerRef, open)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose({ restoreFocus: true })
    }
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !anchorRef.current?.contains(event.target)) onClose()
    }
    let openedAt: number | null = null
    const unsubscribe = onChromeScroll((scrollY) => {
      openedAt ??= scrollY
      if (Math.abs(scrollY - openedAt) > SCROLL_DISMISS_PX) onClose()
    })
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      unsubscribe()
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, anchorRef, onClose])

  if (!mounted) return null
  return (
    // Offset by the card's padding, so the button's circle is the card's
    // close slot and the clip can open from exactly where the button sits.
    <div
      className="contents-card-layer absolute -right-2 -bottom-2 w-80"
      data-animating={animating || undefined}
      data-open={open}
      inert={!open}
      ref={layerRef}
    >
      <div
        aria-hidden
        className="contents-card-ambient pointer-events-none absolute inset-0 rounded-menu-card shadow-[0_24px_64px_rgb(0_0_0/0.16)]"
      />
      <div className="contents-shape-shadow">
        <nav
          aria-label={CONTENTS_LIST_LABEL}
          className="contents-card bg-popover p-2 text-popover-foreground"
          id={id}
        >
          <ContentsList
            className="contents-card-body"
            current={current}
            density="card"
            entries={entries}
            onJump={onJump}
            // The button sits over the end of this row as the close control.
            topRowClassName="mr-12 h-14 w-auto"
          />
        </nav>
      </div>
    </div>
  )
}

/**
 * Phone: a floating sheet with a scrim, in thumb reach. Tap the scrim, press
 * Escape, or drag it down by the handle. A jump waits for the sheet to leave:
 * the dialog holds the scroll lock until then.
 */
function ContentsSheet({ id, open, entries, current, onClose, onJump }: ContentsPanelProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const pendingJump = useRef<ContentsEntry | null | undefined>(undefined)
  // A drag has already played the exit; the dialog must not play it again.
  const [dragged, setDragged] = useState(false)
  const dragHandlers = useSheetDrag(sheetRef, () => {
    setDragged(true)
    onClose()
  })

  return (
    <Sheet onOpenChange={(next) => !next && onClose()} open={open}>
      <SheetContent
        aria-describedby={undefined}
        className={cn(
          'contents-sheet gap-0 rounded-sheet px-2 pb-3 shadow-[0_-8px_40px_rgb(0_0_0/0.2)]',
          'data-[side=bottom]:inset-x-2 data-[side=bottom]:bottom-[max(0.5rem,env(safe-area-inset-bottom))] data-[side=bottom]:border-t-0',
          'duration-300 ease-(--ease-out-quint) data-closed:duration-200',
          'data-[side=bottom]:data-open:slide-in-from-bottom-full data-[side=bottom]:data-closed:slide-out-to-bottom-full',
          'motion-reduce:data-[side=bottom]:data-open:slide-in-from-bottom-0 motion-reduce:data-[side=bottom]:data-closed:slide-out-to-bottom-0',
          dragged && 'data-closed:animate-none',
        )}
        data-lenis-prevent
        id={id}
        onCloseAutoFocus={(event) => {
          setDragged(false)
          const entry = pendingJump.current
          pendingJump.current = undefined
          // Focus goes where the close was headed: to the heading after a
          // jump, otherwise back to the button (which the dialog cannot find
          // on its own, since the button is not its trigger).
          event.preventDefault()
          if (entry === undefined) onClose({ restoreFocus: true })
          else onJump(entry)
        }}
        // Land on the sheet itself, not its first row: the dialog's default
        // autofocus would paint that row in the highlight before any touch.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          sheetRef.current?.focus({ preventScroll: true })
        }}
        overlayClassName="bg-black/30 supports-backdrop-filter:backdrop-blur-none"
        ref={sheetRef}
        showCloseButton={false}
        side="bottom"
      >
        <SheetTitle className="sr-only">{CONTENTS_LIST_LABEL}</SheetTitle>
        <div
          aria-hidden
          // The handle is small; its hit area also covers the label row under it.
          className="relative flex h-6 shrink-0 touch-none items-center justify-center before:absolute before:inset-x-0 before:top-0 before:h-15"
          {...dragHandlers}
        >
          <span className="h-1.25 w-9 rounded-full bg-foreground/20" />
        </div>
        <nav aria-label={CONTENTS_LIST_LABEL}>
          <ContentsList
            current={current}
            density="sheet"
            entries={entries}
            onJump={(entry) => {
              pendingJump.current = entry
              onClose()
            }}
          />
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default function ContentsPanel(props: ContentsPanelProps) {
  return props.sheet ? <ContentsSheet {...props} /> : <ContentsCard {...props} />
}

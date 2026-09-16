'use client'

import { useGSAP } from '@gsap/react'
import { IconChevronDown } from '@tabler/icons-react'
import gsap from 'gsap'
import { type ReactNode, useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { CHAR_PRESETS, createScrambleTween, scrambleTweenDefaults } from '@/shared/ui/scramble-text'
import { SCROLL_REVEAL_SWAP } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

gsap.registerPlugin(useGSAP)

/* Deltas from SCRAMBLE_TEXT_DEFAULTS for the inline headline swap: the
   sentence must settle with the block's swap, so the duration rides the
   swap text timing (not the scroll entrance), and the churn refreshes
   faster to read as a quick flicker rather than a cycle. */
const SCRAMBLE_DURATION_S = SCROLL_REVEAL_SWAP.textDuration * 1.4
const SCRAMBLE_SPEED = 0.8

/* Continuation dim while the scramble churns — drops early, recovers over the
   tween's tail so the sentence settles back to full ink as it resolves. */
const SCRAMBLE_DIM_OPACITY = 0.5
const SCRAMBLE_DIM_IN_S = 0.12
const SCRAMBLE_DIM_OUT_S = 0.2

/**
 * The option vocabulary's one type setting. The chip shows the picked option
 * and the menu lists the rest, so both set the same mono at the same size:
 * `leading-none` keeps the chip shorter than the heading's line box (it rides
 * the text baseline without stretching wrapped lines) and gives the rows the
 * design's 30px/30px.
 */
const OPTION_TYPE = 'font-mono text-xl md:text-3xl leading-none'

/**
 * One option row, for the desktop menu and the phone sheet alike (Paper:
 * "Industry work - C Spotlight ledger" menu). Rows are bare type on the
 * popover plate; the highlight is the theme's accent fill (`focus:` is the
 * hover state too, since Radix moves focus with the pointer, and the keyboard
 * one; `active:` gives the sheet's touch rows the same fill on press). The
 * picked row sits on the accent fill in primary ink and keeps that ink under
 * the highlight. Press
 * compresses on the shared recipe, `pressable-subtle` and a left origin so
 * the wide row's leading edge stays pinned and it reads as a press, not a
 * slide. `pressable` owns the transition list, so the fill fades on it.
 */
const optionRowClassName = (selected: boolean, lowercase?: boolean) =>
  cn(
    'min-h-0 w-full cursor-pointer rounded-md px-4 py-3.5 text-left whitespace-nowrap text-popover-foreground',
    OPTION_TYPE,
    'focus:bg-accent focus:text-accent-foreground',
    'active:bg-accent active:text-accent-foreground',
    'pressable pressable-subtle origin-left outline-hidden',
    lowercase && 'lowercase',
    selected && 'bg-accent text-primary focus:text-primary active:text-primary',
  )

const composeContinuation = (subheading: string, secondLine?: string | null) =>
  secondLine ? `${subheading} ${secondLine}` : subheading

type PickerProps = {
  options: string[]
  activeIndex: number
  /** Chip label, or the sheet's title. */
  heading: string
  lowercase?: boolean
  onPick: (index: number) => void
}

/**
 * The chip: the sentence's one action, so it takes the primary pair. Bands
 * never remap `--primary`, so it reads the same on light, dark and neutral
 * sections. `pressable` owns the transition list (color, background, scale):
 * 150ms ease-out compress on press, springy release. The chip is
 * heading-sized from md, so 0.97 would be a visible shrink;
 * `pressable-subtle` (0.985) keeps it felt, not seen. Hover and open lift
 * the plate toward its ink (same mix the secondary button uses) rather than
 * fading it, so the chip never goes translucent over a band.
 */
const chipClassName = (lowercase?: boolean) =>
  cn(
    'group inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1',
    'bg-primary align-baseline text-primary-foreground',
    OPTION_TYPE,
    'pressable pressable-subtle outline-none select-none',
    'hover:bg-[color-mix(in_oklch,var(--primary),var(--primary-foreground)_12%)]',
    'data-[state=open]:bg-[color-mix(in_oklch,var(--primary),var(--primary-foreground)_12%)]',
    'focus:outline-none focus:ring-0',
    'focus-visible:ring-2 focus-visible:ring-ring/30',
    lowercase && 'lowercase',
  )

const Chevron = () => (
  <IconChevronDown className="size-6 shrink-0 transition-transform duration-200 ease-(--ease-out-quint) group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
)

/**
 * Both surfaces open on pointer or keyboard. A pointer-opened menu hands
 * focus back to nobody on close (the trigger would otherwise flash its
 * focus ring mid-sentence); a keyboard-opened one returns it to the chip.
 */
const useOpenedWithPointer = () => {
  const openedWithPointerRef = useRef(false)
  return {
    triggerProps: {
      onPointerDown: () => {
        openedWithPointerRef.current = true
      },
      onKeyDown: () => {
        openedWithPointerRef.current = false
      },
    },
    onCloseAutoFocus: (event: Event) => {
      if (openedWithPointerRef.current) {
        event.preventDefault()
        openedWithPointerRef.current = false
      }
    },
  }
}

/**
 * Pointer surface (md and up): a Radix dropdown anchored to the chip. A
 * big-type menu is heavier than the primitive's 100ms chrome popover: it
 * settles over 200ms on the site's ease-out and starts at 0.98 (almost its
 * full size, never from nothing) from the trigger's corner, the origin the
 * primitive already sets. Exit is shorter since the user has already
 * decided. The retunes carry the primitive's own variants so they replace
 * its values (`cn` merges tw-animate groups) instead of losing to the
 * variant's specificity. Reduced motion keeps the fade and drops the scale
 * and travel.
 */
const OptionMenu = ({
  options,
  activeIndex,
  heading,
  lowercase,
  onPick,
  children,
}: PickerProps & { children: ReactNode }) => {
  const { triggerProps, onCloseAutoFocus } = useOpenedWithPointer()
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={`${heading}: ${options[activeIndex] ?? ''}`}
        className={chipClassName(lowercase)}
        {...triggerProps}
      >
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        collisionPadding={16}
        sideOffset={4}
        className={cn(
          // The design's 560px plate; never narrower than the chip, never
          // wider than the viewport (collision padding keeps it off the edge).
          'flex w-[35rem] max-w-[calc(100vw-2rem)] min-w-(--radix-dropdown-menu-trigger-width) flex-col gap-0.5 rounded-lg p-2 shadow-xl',
          'duration-200 ease-(--ease-out-quint) data-open:zoom-in-98 data-closed:zoom-out-98',
          'data-closed:duration-150',
          'motion-reduce:data-open:zoom-in-100 motion-reduce:data-closed:zoom-out-100',
          'motion-reduce:data-[side=bottom]:slide-in-from-top-0',
        )}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {options.map((option, index) => {
          const selected = index === activeIndex
          return (
            <DropdownMenuItem
              aria-current={selected ? 'true' : undefined}
              className={optionRowClassName(selected, lowercase)}
              key={`${index}-${option}`}
              onSelect={() => onPick(index)}
            >
              {option}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Touch surface (below md): a bottom sheet instead of a popover. A menu
 * anchored to a chip mid-sentence lands wherever the sentence wrapped and
 * fights the viewport edge; a sheet always rises from the same place, sits
 * in thumb reach, keeps the design's row height as a full tap target, and
 * the scrim makes the choice the one thing on screen. It arrives as a
 * material from the bottom edge (full-height slide, 300ms on the site's
 * ease-out, faster out since the user has decided); reduced motion keeps the
 * fade and drops the travel. Picking a row closes it.
 */
const OptionSheet = ({
  options,
  activeIndex,
  heading,
  lowercase,
  onPick,
  children,
}: PickerProps & { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const { triggerProps, onCloseAutoFocus } = useOpenedWithPointer()
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={`${heading}: ${options[activeIndex] ?? ''}`}
        className={chipClassName(lowercase)}
        {...triggerProps}
      >
        {children}
      </SheetTrigger>
      <SheetContent
        aria-describedby={undefined}
        className={cn(
          'gap-0.5 rounded-t-2xl border-t-0 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]',
          'duration-300 ease-(--ease-out-quint) data-closed:duration-200',
          'data-[side=bottom]:data-open:slide-in-from-bottom-full data-[side=bottom]:data-closed:slide-out-to-bottom-full',
          'motion-reduce:data-[side=bottom]:data-open:slide-in-from-bottom-0 motion-reduce:data-[side=bottom]:data-closed:slide-out-to-bottom-0',
        )}
        data-lenis-prevent
        onCloseAutoFocus={onCloseAutoFocus}
        // Land on the sheet itself, not its first row: the dialog's default
        // autofocus would paint that row in the highlight before any touch.
        // Tab still reaches the rows, and the highlight then means keyboard.
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          sheetRef.current?.focus({ preventScroll: true })
        }}
        ref={sheetRef}
        showCloseButton={false}
        side="bottom"
      >
        <SheetTitle className="px-4 pt-3 pb-2 font-mono text-xs/none font-medium text-muted-foreground">
          {heading}
        </SheetTitle>
        {options.map((option, index) => {
          const selected = index === activeIndex
          return (
            <button
              aria-current={selected ? 'true' : undefined}
              className={optionRowClassName(selected, lowercase)}
              key={`${index}-${option}`}
              onClick={() => {
                onPick(index)
                setOpen(false)
              }}
              type="button"
            >
              {option}
            </button>
          )
        })}
      </SheetContent>
    </Sheet>
  )
}

/**
 * Headline sentence with an inline mono chip: static heading, the active
 * option in the chip, then the continuation in one wrapping text run. The
 * chip opens a dropdown on pointer layouts and a bottom sheet on phones (one
 * row recipe, one type setting, one pick handler for both). The whole line
 * carries `data-reveal` for the shell's entrance; on panel change the
 * continuation scrambles to the incoming sentence itself (dimmed,
 * height-tweened) instead of joining the `useRevealSwap` fade.
 */
export const HeadingDropdown = ({
  heading,
  options,
  activeIndex,
  onSelect,
  subheading,
  secondLine,
  continuationFor,
  lowercase,
}: {
  heading: string
  /** Dropdown labels, one per panel, in panel order. */
  options: string[]
  activeIndex: number
  onSelect: (index: number) => void
  /** Continues the sentence inline after the chip. */
  subheading: string
  /** Optional further continuation — same run, wraps with the sentence. */
  secondLine?: string | null
  /**
   * Incoming continuation per option. When provided, the scramble starts the
   * instant an item is clicked — in parallel with the owning block's swap
   * choreography — instead of waiting for the post-swap re-render.
   */
  continuationFor?: (index: number) => { subheading: string; secondLine?: string | null }
  /** Render options lowercase — taxonomy names sitting mid-sentence. */
  lowercase?: boolean
}) => {
  const isMobile = useIsMobile()
  const current = options[activeIndex] ?? options[0]
  const continuation = composeContinuation(subheading, secondLine)

  const continuationRef = useRef<HTMLSpanElement>(null)
  /** Sentence the scramble last targeted (or rendered) — the from-text. */
  const prevContinuationRef = useRef(continuation)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  // createScrambleTween expects a listener ref; nothing subscribes here.
  const notifyRef = useRef<((scrambling: boolean) => void) | undefined>(undefined)
  const prefersReducedMotion = usePrefersReducedMotion()

  // The continuation opts out of the shared blur swap (no `data-swap`):
  // it scrambles from the outgoing sentence to the incoming one, dimmed while
  // churning. Tween lifecycle is manual (kill + clearProps before each run)
  // rather than revertOnUpdate: the eager click-time scramble must survive
  // the re-render that lands mid-flight once the swap's exit half completes.
  const runScramble = (fromText: string, toText: string) => {
    const el = continuationRef.current
    if (!el || fromText === toText || prefersReducedMotion) return

    tlRef.current?.kill()
    tlRef.current = null
    const h2 = el.closest('h2')
    // Drop any leftovers from an interrupted run so measurement sees the
    // natural layout, not a pinned height.
    if (h2) gsap.set(h2, { clearProps: 'height,overflow' })
    gsap.set(el, { clearProps: 'opacity' })

    // Measure the final layout with the incoming text, then swap back to the
    // outgoing text — synchronous writes, nothing paints in between.
    el.textContent = toText
    const toHeight = h2?.offsetHeight ?? 0
    el.textContent = fromText
    const fromHeight = h2?.offsetHeight ?? 0

    const tween = {
      ...scrambleTweenDefaults(notifyRef),
      duration: SCRAMBLE_DURATION_S,
      speed: SCRAMBLE_SPEED,
      charPool: CHAR_PRESETS.lowerCase as string,
    }
    const tl = gsap.timeline()
    // When the sentence changes line count, tween the heading's height
    // between the two layouts (clipped) so the churn never pops an extra
    // line or shifts the section mid-transition; clear on settle so the
    // heading goes back to flowing naturally.
    if (h2 && fromHeight !== toHeight) {
      tl.set(h2, { overflow: 'clip' }, 0)
        .fromTo(
          h2,
          { height: fromHeight },
          { height: toHeight, duration: SCRAMBLE_DURATION_S, ease: 'power2.inOut' },
          0,
        )
        .set(h2, { clearProps: 'height,overflow' })
    }
    tl.add(createScrambleTween(el, fromText, toText, tween), 0)
      .to(el, { opacity: SCRAMBLE_DIM_OPACITY, duration: SCRAMBLE_DIM_IN_S }, 0)
      .to(
        el,
        { opacity: 1, duration: SCRAMBLE_DIM_OUT_S },
        SCRAMBLE_DURATION_S - SCRAMBLE_DIM_OUT_S,
      )
    tlRef.current = tl
  }

  const { contextSafe } = useGSAP(
    // Reactive fallback: consumers without `continuationFor` scramble when
    // the re-rendered continuation lands. The eager path has already moved
    // prevContinuationRef to the target by then, so this run no-ops.
    () => {
      const fromText = prevContinuationRef.current
      prevContinuationRef.current = continuation
      if (fromText !== continuation) runScramble(fromText, continuation)
    },
    { dependencies: [continuation, prefersReducedMotion] },
  )

  // Click-time start: resolve the incoming sentence from the panel data and
  // scramble now, alongside the block's exit choreography.
  const scrambleOnSelect = contextSafe((index: number) => {
    if (!continuationFor || index === activeIndex) return
    const next = continuationFor(index)
    const fromText = prevContinuationRef.current
    prevContinuationRef.current = composeContinuation(next.subheading, next.secondLine)
    runScramble(fromText, prevContinuationRef.current)
  })

  const onPick = (index: number) => {
    scrambleOnSelect(index)
    onSelect(index)
  }

  const Picker = isMobile ? OptionSheet : OptionMenu

  return (
    // Inline flow (not flex): the chip and continuation sit in the same text
    // run as the heading, so the sentence wraps word by word instead of
    // dropping whole segments to a new line.
    <h2
      className="max-w-4xl text-2xl md:text-3xl leading-normal font-light text-foreground/80"
      data-reveal
    >
      {heading}{' '}
      <Picker
        activeIndex={activeIndex}
        heading={heading}
        lowercase={lowercase}
        onPick={onPick}
        options={options}
      >
        {current}
        <Chevron />
      </Picker>{' '}
      {/* wrap-anywhere: mid-churn glyph runs may lack the target's spaces;
          let them break so the scramble never escapes the heading's max-w. */}
      <span className="wrap-anywhere" ref={continuationRef}>
        {continuation}
      </span>
    </h2>
  )
}

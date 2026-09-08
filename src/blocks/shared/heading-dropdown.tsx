'use client'

import { useGSAP } from '@gsap/react'
import { IconChevronDown } from '@tabler/icons-react'
import gsap from 'gsap'
import { useRef } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

const composeContinuation = (subheading: string, secondLine?: string | null) =>
  secondLine ? `${subheading} ${secondLine}` : subheading

/**
 * Headline sentence with an inline mono dropdown chip: static heading, the
 * active option in the chip, then the continuation in one wrapping text run.
 * The whole line carries `data-reveal` for the shell's entrance; on panel
 * change the continuation scrambles to the incoming sentence itself (dimmed,
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
  const openedWithPointerRef = useRef(false)
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

  return (
    // Inline flow (not flex): the chip and continuation sit in the same text
    // run as the heading, so the sentence wraps word by word instead of
    // dropping whole segments to a new line.
    <h2
      className="max-w-4xl text-2xl md:text-3xl leading-normal font-light text-foreground/80"
      data-reveal
    >
      {heading}{' '}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={cn(
            'group inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1',
            // The chip is the sentence's one action, so it takes the primary
            // pair. Bands never remap `--primary`, so the chip reads the same
            // on light, dark and neutral sections. leading-none keeps it
            // shorter than the line box so it rides the text baseline
            // without stretching wrapped lines.
            'bg-primary align-baseline text-xl md:text-3xl leading-none font-mono text-primary-foreground',
            // `pressable` owns the transition list (color, background, scale):
            // 150ms ease-out compress on press, springy release. Hover and
            // open lift the plate toward its ink (same mix the secondary
            // button uses) rather than fading it, so the chip never goes
            // translucent over a band.
            'pressable outline-none select-none',
            'hover:bg-[color-mix(in_oklch,var(--primary),var(--primary-foreground)_12%)]',
            'data-[state=open]:bg-[color-mix(in_oklch,var(--primary),var(--primary-foreground)_12%)]',
            'focus:outline-none focus:ring-0',
            'focus-visible:ring-2 focus-visible:ring-ring/30',
            lowercase && 'lowercase',
          )}
          onPointerDown={() => {
            openedWithPointerRef.current = true
          }}
          onKeyDown={() => {
            openedWithPointerRef.current = false
          }}
        >
          {current}
          <IconChevronDown className="size-6 shrink-0 transition-transform duration-200 ease-(--ease-out-quint) group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className={cn(
            'w-max min-w-(--radix-dropdown-menu-trigger-width) rounded-md bg-popover p-3 pr-14',
            'flex flex-col gap-2 md:gap-6 text-popover-foreground',
            // A big-type menu is heavier than the primitive's 100ms chrome
            // popover: it settles over 200ms on the site's ease-out and starts
            // at 0.98 (almost its full size, never from nothing) from the
            // trigger's corner, the origin the primitive already sets. Exit
            // is shorter since the user has already decided. The retunes
            // carry the primitive's own variants so they replace its values
            // (`cn` merges tw-animate groups) instead of losing to the
            // variant's specificity. Reduced motion keeps the fade and drops
            // the scale and travel.
            'duration-200 ease-(--ease-out-quint) data-open:zoom-in-98 data-closed:zoom-out-98',
            'data-closed:duration-150',
            'motion-reduce:data-open:zoom-in-100 motion-reduce:data-closed:zoom-out-100',
            'motion-reduce:data-[side=bottom]:slide-in-from-top-0',
          )}
          onCloseAutoFocus={(event) => {
            if (openedWithPointerRef.current) {
              event.preventDefault()
              openedWithPointerRef.current = false
            }
          }}
        >
          {options.map((option, index) => {
            const selected = index === activeIndex
            return (
              <DropdownMenuItem
                key={`${index}-${option}`}
                className={cn(
                  'group/option min-h-0 cursor-pointer rounded-none p-0 font-mono text-base md:text-heading-3 whitespace-nowrap text-popover-foreground',
                  // Radix moves focus with the pointer, so `focus:` is the
                  // hover state too (and the keyboard one). Rows are bare
                  // type on the popover plate: highlight is an ink shift to
                  // primary, no fill. The descendant rule retunes the
                  // primitive's own (which would paint the label span in
                  // accent ink over the row's color) rather than adding to it.
                  'focus:bg-transparent focus:text-primary',
                  'not-data-[variant=destructive]:focus:**:text-primary',
                  // Press compresses the row on the shared recipe. The
                  // subtle token and a left origin keep the wide row's
                  // leading edge pinned so it reads as a press, not a slide.
                  'pressable pressable-subtle origin-left',
                  lowercase && 'lowercase',
                  selected && 'opacity-50',
                )}
                onSelect={() => {
                  scrambleOnSelect(index)
                  onSelect(index)
                }}
              >
                {/* The nudge lives on a child, never the hover target: moving
                    the row itself would pull it out from under the cursor and
                    flicker. Reduced motion keeps the ink shift only. */}
                <span className="inline-block transition-transform duration-150 ease-(--ease-out-quint) motion-safe:group-focus/option:translate-x-1 motion-reduce:transition-none">
                  {option}
                </span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>{' '}
      {/* wrap-anywhere: mid-churn glyph runs may lack the target's spaces;
          let them break so the scramble never escapes the heading's max-w. */}
      <span className="wrap-anywhere" ref={continuationRef}>
        {continuation}
      </span>
    </h2>
  )
}

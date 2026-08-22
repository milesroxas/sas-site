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
import { SCROLL_REVEAL_UNDER_MEDIA } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

gsap.registerPlugin(useGSAP)

/* Deltas from SCRAMBLE_TEXT_DEFAULTS for the inline headline swap: the
   sentence must settle before the block's own swap entrance does, so the
   duration rides the under-media text timing at a fraction of it, and the
   churn refreshes faster to read as a quick flicker rather than a cycle. */
const SCRAMBLE_DURATION_S = SCROLL_REVEAL_UNDER_MEDIA.textDuration * 0.75
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
 * height-tweened) instead of joining the `useRevealSwap` blur choreography.
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
    <h2 className="max-w-4xl text-heading-2/normal text-foreground" data-reveal>
      {heading}{' '}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={cn(
            'group inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1',
            // Chip ink uses the popover pair so it stays independent of the
            // section remapping `--foreground` → tertiary (dark bands would
            // otherwise paint light type on `bg-muted`).
            // leading-none keeps the chip shorter than the line box so it
            // rides the text baseline without stretching wrapped lines.
            'bg-muted align-baseline text-heading-2 leading-none font-mono text-popover-foreground',
            'outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
            'focus:outline-none focus:ring-0',
            'focus-visible:ring-2 focus-visible:ring-ring/30',
            'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
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
          <IconChevronDown className="size-6 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className={cn(
            'w-max min-w-(--radix-dropdown-menu-trigger-width) rounded-md bg-popover p-3 pr-14',
            'flex flex-col gap-6 text-popover-foreground',
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
                  'min-h-0 cursor-pointer rounded-none p-0 font-mono text-heading-3 whitespace-nowrap text-popover-foreground',
                  'focus:bg-transparent focus:text-popover-foreground',
                  lowercase && 'lowercase',
                  selected && 'opacity-50',
                )}
                onSelect={() => {
                  scrambleOnSelect(index)
                  onSelect(index)
                }}
              >
                {option}
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

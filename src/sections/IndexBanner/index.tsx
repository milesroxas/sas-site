'use client'

import { useGSAP } from '@gsap/react'
import { IconArrowRight } from '@tabler/icons-react'
import gsap from 'gsap'
import Link from 'next/link'
import type React from 'react'
import { useId, useRef, useState } from 'react'
import { themeClasses } from '@/blocks/shared/section'
import { Button } from '@/components/ui/button'
import { Visual } from '@/components/Visual'
import { VisualMotionToggle } from '@/features/immersive/visual'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import {
  observeRevealGate,
  SCROLL_REVEAL_TRIGGER_DEFAULTS,
  SCROLL_REVEAL_UNDER_MEDIA,
} from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import type { IndexBannerData } from './resolve'
import { type SampleControlRow, SampleControls, sampleControlRows } from './SampleControls'

gsap.registerPlugin(useGSAP)

/** Bespoke choreography, shared gate. */
const { enterOffset: ENTER_OFFSET } = SCROLL_REVEAL_TRIGGER_DEFAULTS

/**
 * The slab is media with copy on it, so every value the under-media reveal
 * also owns (the wipe, the copy's drop) is imported from it, not restated.
 */
const {
  mediaDuration: WIPE_DURATION,
  mediaEase: WIPE_EASE,
  textY: COPY_Y,
  textBlurPx: COPY_BLUR_PX,
  textDuration: COPY_DURATION,
  textEase: COPY_EASE,
} = SCROLL_REVEAL_UNDER_MEDIA

/**
 * What only this choreography owns. The copy waits until the wipe has opened
 * the slab's head, the heading first; the panel follows the last line as one
 * object, and its sliders draw up from zero as it lands. Over the banner the
 * sliders retune: a move on screen, so it eases both ways, and the way back is
 * the shorter half. Each value lives here once.
 */
const INDEX_BANNER = {
  copyAt: 0.2,
  copyStagger: 0.08,
  panelAt: 0.45,
  drawAt: 0.65,
  drawDuration: 0.9,
  drawStagger: 0.07,
  drawEase: 'power3.out',
  tuneDuration: 0.5,
  restDuration: 0.35,
  tuneStagger: 0.04,
  tuneEase: 'power2.inOut',
} as const

/** Tween one row's value; the proxy carries it so a retarget starts where the last write left it. */
const tweenRow = (
  row: SampleControlRow,
  proxy: { value: number },
  value: number,
  vars: gsap.TweenVars,
) => gsap.to(proxy, { value, overwrite: true, onUpdate: () => row.apply(proxy.value), ...vars })

export type Props = IndexBannerData & {
  /**
   * Render the document's pause control inside the slab. The owner turns it
   * off when another surface on the page already carries it (an index ground).
   */
  motionToggle?: boolean
  className?: string
}

/**
 * The index banner: a dark slab between an index title and its listing, copy
 * and action leading, the drawn Playground panel trailing, a visual slot
 * behind both.
 *
 * It sits inside the index's intro `ScrollReveal`, so its targets carry their
 * own `data-banner-*` markers rather than `data-reveal`: a shell tweens every
 * `[data-reveal]` under it, and two shells on one node is two entrances. The
 * entrance plays once off the shared gate; the live field is held until it has
 * landed, so a canvas never composites inside the wipe's `clip-path`.
 * Server-rendered children stay visible without JavaScript; reduced motion
 * renders the final state and keeps the sliders still.
 */
export const IndexBanner: React.FC<Props> = ({
  heading,
  body,
  link,
  visual,
  motionToggle = true,
  className,
}) => {
  const rootRef = useRef<HTMLElement>(null)
  const rowsRef = useRef<{ row: SampleControlRow; proxy: { value: number } }[]>([])
  const prefersReducedMotion = usePrefersReducedMotion()
  const [entered, setEntered] = useState(false)
  const headingId = useId()

  const { contextSafe } = useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const copy = Array.from(root.querySelectorAll<HTMLElement>('[data-banner-copy]'))
      const panel = root.querySelector<HTMLElement>('[data-banner-panel]')
      const rows = sampleControlRows(root).map((row) => ({
        row,
        proxy: { value: row.control.rest as number },
      }))
      rowsRef.current = rows
      const rest = () => {
        for (const { row, proxy } of rows) {
          proxy.value = row.control.rest
          row.apply(proxy.value)
        }
      }

      const moving = [...copy, ...(panel ? [panel] : [])]

      if (prefersReducedMotion) {
        gsap.set([root, ...moving], { clearProps: 'all' })
        rest()
        setEntered(true)
        return
      }

      const tl = gsap.timeline({
        paused: true,
        // Promote each paint-bound target for the length of the entrance only
        // (docs/animations.md, "Scroll cost"); `pressable` on the action would
        // otherwise re-transition every per-frame opacity write.
        onStart: () => {
          gsap.set(root, { willChange: 'clip-path' })
          gsap.set(copy, { transition: 'none', willChange: 'filter, opacity, transform' })
          if (panel) gsap.set(panel, { willChange: 'opacity, transform' })
        },
        onComplete: () => {
          // The wipe's final inset still clips at the border box: drop it with
          // the hints, so the slab's focus rings and shadow are its own again.
          gsap.set(root, { clearProps: 'clipPath,willChange' })
          gsap.set(moving, { clearProps: 'transition,willChange,filter' })
          setEntered(true)
        },
      })
      tl.fromTo(
        root,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: WIPE_DURATION, ease: WIPE_EASE },
        0,
      )
      copy.forEach((target, index) => {
        tl.fromTo(
          target,
          { autoAlpha: 0, y: -COPY_Y, filter: `blur(${COPY_BLUR_PX}px)` },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: COPY_DURATION, ease: COPY_EASE },
          INDEX_BANNER.copyAt + index * INDEX_BANNER.copyStagger,
        )
      })
      if (panel) {
        // One object: the panel arrives whole, without blur (a filter over a
        // surface this size repaints every frame), and only its sliders move
        // after it.
        tl.fromTo(
          panel,
          { autoAlpha: 0, y: -COPY_Y },
          { autoAlpha: 1, y: 0, duration: COPY_DURATION, ease: COPY_EASE },
          INDEX_BANNER.panelAt,
        )
      }
      rows.forEach(({ row, proxy }, index) => {
        tl.fromTo(
          proxy,
          { value: row.control.min },
          {
            value: row.control.rest,
            duration: INDEX_BANNER.drawDuration,
            ease: INDEX_BANNER.drawEase,
            onUpdate: () => row.apply(proxy.value),
          },
          INDEX_BANNER.drawAt + index * INDEX_BANNER.drawStagger,
        )
      })
      // A `fromTo` holds its DOM targets at their opening state from hydration;
      // a proxy reaches the DOM only through `onUpdate`, so draw that state here.
      for (const { row } of rows) row.apply(row.control.min)

      const stop = observeRevealGate(root, ENTER_OFFSET, () => tl.play())
      return () => {
        stop()
        // A revert rewinds the proxies, not the writes made through them.
        rest()
      }
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true },
  )

  // Hover is a mouse and pen affordance: a tap fires `pointerenter` with no
  // leave to answer it, which would strand the sliders on their tuned values.
  const tune = contextSafe((event: React.PointerEvent, tuned: boolean) => {
    if (event.pointerType === 'touch' || !entered || prefersReducedMotion) return
    rowsRef.current.forEach(({ row, proxy }, index) => {
      tweenRow(row, proxy, tuned ? row.control.tuned : row.control.rest, {
        duration: tuned ? INDEX_BANNER.tuneDuration : INDEX_BANNER.restDuration,
        ease: INDEX_BANNER.tuneEase,
        delay: index * INDEX_BANNER.tuneStagger,
      })
    })
  })

  const effect = visual !== null && visual.kind !== 'media'
  const pausable = effect && motionToggle

  return (
    <aside
      aria-labelledby={headingId}
      className={cn(
        'relative isolate overflow-clip rounded-xl',
        'flex flex-col gap-10 px-6 py-8 md:flex-row md:items-center md:justify-between md:gap-16 md:px-12 md:py-10',
        themeClasses.dark,
        className,
      )}
      data-index-banner
      onPointerEnter={(event) => tune(event, true)}
      onPointerLeave={(event) => tune(event, false)}
      ref={rootRef}
    >
      {visual && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Visual
            active={entered}
            fill
            imgClassName="object-cover select-none"
            placement="block"
            size="(min-width: 1536px) 1440px, 100vw"
            visual={visual}
          />
          {/* An upload has no ink of its own to hold the copy's contrast. */}
          {!effect && <div className="absolute inset-0 bg-background/60" />}
        </div>
      )}

      {/* Stacked, the pause control shares the head of the slab with the copy. */}
      <div className={cn('flex max-w-xl flex-col items-start gap-5', pausable && 'max-md:pr-8')}>
        <h2
          className="max-w-md text-heading-3 leading-tight tracking-tight text-balance text-foreground"
          data-banner-copy
          id={headingId}
        >
          {heading}
        </h2>
        {body && (
          <p className="text-base/relaxed text-pretty text-muted-foreground" data-banner-copy>
            {body}
          </p>
        )}
        {/* The slab is dark in both site themes, so its action takes the dark
            palette's primary: the light one is tuned for a white page and goes
            dim on this ground. */}
        <div className="pt-1" data-banner-copy data-theme="dark">
          <Button asChild size="xl">
            <Link
              href={link.href}
              {...(link.newTab
                ? { rel: 'noopener noreferrer', target: '_blank' }
                : { transitionTypes: [...forwardNavTransitionTypes] })}
            >
              {link.label}
              <IconArrowRight
                aria-hidden
                className="transition-transform duration-200 ease-(--ease-out-quint) group-hover/button:translate-x-0.5 motion-reduce:transition-none"
                data-icon="inline-end"
              />
            </Link>
          </Button>
        </div>
      </div>

      <SampleControls className="w-full shrink-0 md:w-80 lg:w-100" />

      {pausable && <VisualMotionToggle className="absolute top-3 right-3" />}
    </aside>
  )
}

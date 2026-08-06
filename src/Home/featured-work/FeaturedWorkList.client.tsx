'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useRef } from 'react'
import { Container } from '@/blocks/shared/container'
import { Media } from '@/components/Media'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import { SCROLL_REVEAL_INTRO, SCROLL_REVEAL_UNDER_MEDIA } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import type { FeaturedWorkEntry } from './resolveEntry'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger)
}

/**
 * The pinned featured-work roll: the section holds the viewport while scroll
 * walks the list, keeping the active entry locked to the vertical center.
 * Everything this choreography owns lives here once; the media wipe and the
 * shared ease are imported from the scroll-reveal source of truth, never
 * restated.
 *
 * `dimOpacity` / `dimBlurPx` are mirrored by the `opacity-30 blur-xs` classes
 * on non-first items so the server-rendered frame matches the settled state —
 * change one, change both.
 */
const FEATURED_WORK_PIN = {
  /** Scroll depth (svh) each item transition consumes. */
  stepSvh: 70,
  /** Fraction of each step the list rests with an item centered. */
  dwell: 0.35,
  /** Inactive title resting opacity (class mirror: `opacity-30`). */
  dimOpacity: 0.3,
  /** Inactive title resting blur (class mirror: `blur-xs` = 4px). */
  dimBlurPx: 4,
  /** Inactive title settles slightly back, origin left. */
  dimScale: 0.98,
  /** Activation tween length; ease is the site text ease. */
  activateDuration: 0.5,
  activateEase: SCROLL_REVEAL_INTRO.textEase,
  /** Meta line rises this many px as it fades in. */
  metaY: 10,
  /** Counter roll travel (px), signed by scroll direction. */
  counterY: 10,
} as const

const {
  mediaDuration: MEDIA_DURATION,
  mediaEase: MEDIA_EASE,
  mediaScaleFrom: MEDIA_SCALE_FROM,
} = SCROLL_REVEAL_UNDER_MEDIA

const padIndex = (index: number) => String(index + 1).padStart(2, '0')

type Props = {
  eyebrow?: string | null
  entries: FeaturedWorkEntry[]
}

const EyebrowRule: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2.5">
    <span aria-hidden className="block h-px w-8 shrink-0 bg-muted-foreground" />
    <p className="font-mono text-base/none font-medium text-muted-foreground uppercase">{label}</p>
  </div>
)

const MetaLine: React.FC<{ entry: FeaturedWorkEntry; className?: string }> = ({
  entry,
  className,
}) => {
  const parts = [entry.client, entry.industry].filter(Boolean)
  return (
    // Height is reserved even when empty so activation never reflows the list.
    <p
      className={cn('mt-3 h-4 font-mono text-xs/none text-muted-foreground', className)}
      data-work-meta
    >
      {parts.join(' · ')}
    </p>
  )
}

/** Reduced motion collapses the interaction to its final state: a plain list. */
const StaticList: React.FC<Props> = ({ eyebrow, entries }) => (
  <Container className="py-16 md:py-24" width="standard">
    <div className="flex flex-col gap-16 md:gap-20">
      {eyebrow ? <EyebrowRule label={eyebrow} /> : null}
      <ul className="flex flex-col">
        {entries.map((entry) => (
          <li className="border-b border-muted-foreground" key={entry.id}>
            <Link
              className="block py-8 outline-none"
              href={entry.href}
              transitionTypes={[...forwardNavTransitionTypes]}
            >
              <h3 className="text-2xl/9 font-light text-foreground md:text-3xl/9">{entry.title}</h3>
              <MetaLine entry={entry} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </Container>
)

export const FeaturedWorkList: React.FC<Props> = ({ eyebrow, entries }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const activateRef = useRef<((index: number) => void) | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const count = entries.length

  useGSAP(
    (_, contextSafe) => {
      const root = rootRef.current
      if (!root || prefersReducedMotion || count === 0) return

      const list = root.querySelector<HTMLElement>('[data-work-list]')
      if (!list) return
      const items = Array.from(list.querySelectorAll<HTMLElement>('[data-work-item]'))
      const frames = Array.from(root.querySelectorAll<HTMLElement>('[data-work-media]'))
      const counter = root.querySelector<HTMLElement>('[data-work-counter]')

      const centers = () => items.map((item) => item.offsetTop + item.offsetHeight / 2)
      const { activateDuration, activateEase, dimOpacity, dimBlurPx, dimScale, metaY, counterY } =
        FEATURED_WORK_PIN

      let current = -1
      const activate = (next: number, immediate = false) => {
        if (next === current) return
        const direction = next > current ? 1 : -1
        current = next
        const duration = immediate ? 0 : activateDuration

        items.forEach((item, index) => {
          const on = index === next
          const title = item.querySelector('[data-work-title]')
          const marker = item.querySelector('[data-work-marker]')
          const meta = item.querySelector('[data-work-meta]')
          if (title) {
            gsap.to(title, {
              opacity: on ? 1 : dimOpacity,
              scale: on ? 1 : dimScale,
              transformOrigin: 'left center',
              filter: `blur(${on ? 0 : dimBlurPx}px)`,
              duration,
              ease: activateEase,
              overwrite: 'auto',
            })
          }
          if (marker) {
            gsap.to(marker, {
              autoAlpha: on ? 1 : 0,
              scaleX: on ? 1 : 0,
              transformOrigin: 'left center',
              duration,
              ease: activateEase,
              overwrite: 'auto',
            })
          }
          if (meta) {
            gsap.to(meta, {
              autoAlpha: on ? 1 : 0,
              y: on ? 0 : metaY,
              duration,
              ease: activateEase,
              overwrite: 'auto',
            })
          }
        })

        frames.forEach((frame, index) => {
          if (index === next) {
            // Incoming frame wipes open from the top over the outgoing one —
            // the site's media reveal, on the block's own beat.
            gsap.set(frame, { zIndex: 2 })
            gsap.fromTo(
              frame,
              { autoAlpha: 1, clipPath: 'inset(0% 0% 100% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: immediate ? 0 : MEDIA_DURATION,
                ease: MEDIA_EASE,
                overwrite: 'auto',
              },
            )
            const content = frame.firstElementChild
            if (content) {
              gsap.fromTo(
                content,
                { scale: MEDIA_SCALE_FROM },
                { scale: 1, duration: immediate ? 0 : MEDIA_DURATION, ease: MEDIA_EASE },
              )
            }
          } else {
            gsap.to(frame, {
              autoAlpha: 0,
              zIndex: 1,
              duration: immediate ? 0 : MEDIA_DURATION / 2,
              overwrite: 'auto',
            })
          }
        })

        if (counter) {
          counter.textContent = padIndex(next)
          if (!immediate) {
            gsap.fromTo(
              counter,
              { autoAlpha: 0, y: counterY * direction },
              { autoAlpha: 1, y: 0, duration: activateDuration, ease: activateEase },
            )
          }
        }
      }

      activateRef.current = contextSafe?.((index: number) => activate(index)) ?? null

      // Settle the initial frame: first item centered, everything else dimmed.
      gsap.set(list, { y: -centers()[0] })
      activate(0, true)

      let timeline: gsap.core.Timeline | null = null
      if (count > 1) {
        const { dwell } = FEATURED_WORK_PIN
        timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate(self) {
              activate(Math.round(self.progress * (count - 1)))
            },
            onRefresh(self) {
              // Function-based tween values re-measure themselves; the resting
              // start state is owned here.
              if (self.progress === 0) gsap.set(list, { y: -centers()[0] })
            },
          },
        })
        // One unit of timeline time per transition: dwell splits around each
        // move so every item rests at center before the next slide.
        for (let index = 1; index < count; index++) {
          timeline.fromTo(
            list,
            { y: () => -centers()[index - 1] },
            { y: () => -centers()[index], duration: 1 - dwell, immediateRender: false },
            index - 1 + dwell / 2,
          )
        }
        timeline.to({}, { duration: dwell / 2 }, '>')
      }

      // Content-size changes inside the list (font swap, wrapping) re-derive
      // the centering; window resizes already refresh ScrollTrigger itself.
      const observer = new ResizeObserver(() => {
        if (timeline) ScrollTrigger.refresh()
        else gsap.set(list, { y: -centers()[0] })
      })
      observer.observe(list)
      return () => observer.disconnect()
    },
    { scope: rootRef, dependencies: [prefersReducedMotion, count], revertOnUpdate: true },
  )

  if (count === 0) return null
  if (prefersReducedMotion) return <StaticList entries={entries} eyebrow={eyebrow} />

  return (
    <div
      className="relative"
      ref={rootRef}
      style={{ height: `calc(100svh + ${(count - 1) * FEATURED_WORK_PIN.stepSvh}svh)` }}
    >
      {/* Padding mirrors the fixed header/footer bars so `top-1/2` anchors —
          the list and the media frame — center within the visible content
          area, not the raw viewport. Absolute children (masks, eyebrow) are
          unaffected and stay on the physical viewport edges. */}
      <div className="sticky top-0 h-svh overflow-hidden pt-(--header-height) pb-(--footer-height)">
        <Container className="relative h-full" width="standard">
          <div className="grid h-full md:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
            <div className="relative h-full">
              <ul className="absolute inset-x-0 top-1/2 will-change-transform" data-work-list>
                {entries.map((entry, index) => (
                  <li data-work-item key={entry.id}>
                    <Link
                      className="group block py-5 outline-none md:py-6 md:pl-13"
                      href={entry.href}
                      onFocus={() => activateRef.current?.(index)}
                      transitionTypes={[...forwardNavTransitionTypes]}
                    >
                      <h3
                        className={cn(
                          'relative text-2xl/9 font-light text-foreground md:text-3xl/9',
                          index > 0 && 'opacity-30 blur-xs',
                        )}
                        data-work-title
                      >
                        {/* Anchored to the first line via `lh` so wrapped titles keep the rule on line one. */}
                        <span
                          aria-hidden
                          className={cn(
                            'absolute top-[0.5lh] right-full mr-5 hidden h-px w-8 bg-foreground md:block',
                            index > 0 && 'opacity-0',
                          )}
                          data-work-marker
                        />
                        {entry.title}
                      </h3>
                      <MetaLine className={cn(index > 0 && 'opacity-0')} entry={entry} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative hidden h-full md:block">
              <div className="absolute top-1/2 right-0 ml-auto w-full max-w-135.75 -translate-y-1/2">
                <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                  {entries.map((entry, index) => (
                    <div
                      className={cn('absolute inset-0', index > 0 && 'opacity-0')}
                      data-work-media
                      key={entry.id}
                    >
                      {/* First child owns the frame's full box — it is the wipe's scale target. */}
                      <div className="absolute inset-0">
                        {entry.media ? (
                          <Media
                            fill
                            htmlElement={null}
                            imgClassName="object-cover"
                            resource={entry.media}
                            size="544px"
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>

        <div className="absolute inset-x-0 top-(--header-height) z-30 pt-8">
          <Container className="flex items-center justify-between" width="standard">
            {eyebrow ? <EyebrowRule label={eyebrow} /> : <span />}
            {count > 1 ? (
              <p className="font-mono text-xs/none font-medium text-muted-foreground">
                <span className="text-foreground" data-work-counter>
                  01
                </span>
                {` / ${padIndex(count - 1)}`}
              </p>
            ) : null}
          </Container>
        </div>

        {/* Edge masks: list rows dissolve into the section surface instead of clipping. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-36 bg-linear-to-b from-background to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-linear-to-t from-background to-transparent"
        />
      </div>
    </div>
  )
}

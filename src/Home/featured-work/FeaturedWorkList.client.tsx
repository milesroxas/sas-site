'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useRef } from 'react'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import {
  SCROLL_REVEAL_INTRO,
  SCROLL_REVEAL_UNDER_MEDIA,
  scrollRevealTrackStarts,
} from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger)
}

/**
 * The pinned featured-work roll: the section holds the viewport while scroll
 * walks the list, keeping the active entry locked to the vertical center. The
 * band stays blank through the approach and the site reveal staggers
 * everything in the moment the pin engages (`entranceStart`); the next scroll
 * input walks the list. Everything this
 * choreography owns lives here once; the media wipe and the shared ease are
 * imported from the scroll-reveal source of truth, never restated.
 *
 * Inactive titles dim with distance from the active item
 * (`restingTitleOpacity`), which also styles the server-rendered frame
 * inline; `dimBlurPx` is mirrored by the `blur-xs` class on non-first items —
 * change one, change both.
 */
const FEATURED_WORK_PIN = {
  /** Scroll depth (svh) each item transition consumes. */
  stepSvh: 70,
  /**
   * Scroll depth (svh) held at the top of the pin while the entrance plays:
   * the list stays put, so arrival momentum can't carry the roll past the
   * first item before the reveal lands.
   */
  entranceHoldSvh: 40,
  /**
   * Scroll maps to the list continuously — no rest plateaus, so input always
   * moves something. Centering comes from the snap glide instead: after the
   * last input the list settles on the nearest item.
   */
  snapDuration: { min: 0.2, max: 0.5 },
  /** Pause after the last scroll input before the snap glide starts (s). */
  snapDelay: 0.05,
  /**
   * Fraction of a step to travel, in the scroll direction, before the glide
   * commits to the next item; anything shorter settles back. Low enough that
   * a flick advances, high enough that arrival overshoot can't skip item one.
   */
  snapAdvanceFraction: 0.35,
  /** Resting opacity of the inactive titles nearest the active one. */
  dimOpacity: 0.3,
  /** Each further step from the active item multiplies the dim by this. */
  dimFalloff: 0.6,
  /** Depth floor: no title dims past this, so the roll stays legible. */
  dimMinOpacity: 0.08,
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
  /** Entrance gate: the reveal plays the moment the pin engages. */
  entranceStart: 'top top',
} as const

/**
 * Depth model for the media switch: the incoming frame wipes open along the
 * scroll direction while its content settles against the wipe (parallax), and
 * the outgoing frame pushes toward the viewer and dims underneath — a layered
 * pass, not a crossfade. Durations and eases stay on the shared media beat.
 */
const FEATURED_WORK_SWITCH = {
  /** Incoming content starts offset this far against the wipe (yPercent, signed). */
  parallaxPct: 8,
  /** Outgoing content pushes to this scale as the wipe covers it. */
  departScale: 1.08,
  /** Outgoing content drifts along the scroll direction while covered (yPercent). */
  departDriftPct: 4,
  /** Outgoing frame dims to this brightness under the incoming wipe. */
  departBrightness: 0.55,
} as const

const {
  mediaDuration: MEDIA_DURATION,
  mediaEase: MEDIA_EASE,
  mediaScaleFrom: MEDIA_SCALE_FROM,
} = SCROLL_REVEAL_UNDER_MEDIA

const padIndex = (index: number) => String(index + 1).padStart(2, '0')

/**
 * Resting opacity for a title `distance` steps from the active item: full at
 * center, `dimOpacity` beside it, falling off toward the floor with depth.
 * Also styles the server-rendered frame (distance from item one) so the
 * settled state matches before hydration.
 */
const restingTitleOpacity = (distance: number) => {
  const { dimOpacity, dimFalloff, dimMinOpacity } = FEATURED_WORK_PIN
  if (distance === 0) return 1
  return Math.max(dimMinOpacity, dimOpacity * dimFalloff ** (distance - 1))
}

type Props = {
  eyebrow?: string | null
  entries: WorkEntry[]
}

const EyebrowRule: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2.5">
    <span aria-hidden className="block h-px w-8 shrink-0 bg-muted-foreground" />
    <p className="font-mono text-sm/none font-medium text-muted-foreground uppercase">{label}</p>
  </div>
)

const MetaLine: React.FC<{ entry: WorkEntry; className?: string }> = ({ entry, className }) => {
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
  <Container className="py-16 md:py-24" width="default">
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
      const { activateDuration, activateEase, dimBlurPx, dimScale, metaY, counterY } =
        FEATURED_WORK_PIN

      let current = -1
      const activate = (next: number, immediate = false) => {
        if (next === current) return
        const direction = next > current ? 1 : -1
        const previous = current
        current = next
        const duration = immediate ? 0 : activateDuration

        items.forEach((item, index) => {
          const on = index === next
          const title = item.querySelector('[data-work-title]')
          const meta = item.querySelector('[data-work-meta]')
          if (title) {
            gsap.to(title, {
              opacity: restingTitleOpacity(Math.abs(index - next)),
              scale: on ? 1 : dimScale,
              transformOrigin: 'left center',
              filter: `blur(${on ? 0 : dimBlurPx}px)`,
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

        const { parallaxPct, departScale, departDriftPct, departBrightness } = FEATURED_WORK_SWITCH
        frames.forEach((frame, index) => {
          const content = frame.firstElementChild
          if (index === next) {
            // Incoming frame wipes open along the scroll direction while its
            // content settles against the wipe — the site's media reveal with
            // a parallax layer for depth. Kill first: a still-delayed depart
            // hide is invisible to `overwrite: 'auto'` and would blank the
            // frame after it lands.
            gsap.killTweensOf(frame)
            gsap.set(frame, { zIndex: 2 })
            gsap.fromTo(
              frame,
              {
                autoAlpha: 1,
                filter: 'brightness(1)',
                clipPath: direction >= 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)',
              },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: immediate ? 0 : MEDIA_DURATION,
                ease: MEDIA_EASE,
                overwrite: 'auto',
              },
            )
            if (content) {
              gsap.fromTo(
                content,
                { scale: MEDIA_SCALE_FROM, yPercent: direction * -parallaxPct },
                {
                  scale: 1,
                  yPercent: 0,
                  duration: immediate ? 0 : MEDIA_DURATION,
                  ease: MEDIA_EASE,
                  overwrite: 'auto',
                },
              )
            }
          } else if (index === previous && !immediate) {
            // Outgoing frame stays fully opaque beneath the wipe — no surface
            // flash — while it pushes toward the viewer, drifts with the
            // scroll and dims; it only unmounts from the stack once covered.
            gsap.set(frame, { zIndex: 1 })
            gsap.to(frame, {
              filter: `brightness(${departBrightness})`,
              duration: MEDIA_DURATION,
              ease: MEDIA_EASE,
              overwrite: 'auto',
            })
            if (content) {
              gsap.to(content, {
                scale: departScale,
                yPercent: direction * departDriftPct,
                duration: MEDIA_DURATION,
                ease: MEDIA_EASE,
                overwrite: 'auto',
              })
            }
            gsap.to(frame, {
              autoAlpha: 0,
              duration: 0,
              delay: MEDIA_DURATION,
              overwrite: 'auto',
            })
          } else {
            gsap.set(frame, { autoAlpha: 0, zIndex: 1 })
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

      // Entrance: the band stays blank through the approach; the moment the
      // pin engages the site reveal plays — eyebrow and counter lead, titles
      // cascade, the media frame mask-wipes open on the under-media offset.
      // Play-once: scrolling back up never reverses or replays it.
      const leads = Array.from(root.querySelectorAll<HTMLElement>('[data-work-entrance="lead"]'))
      const mediaShell = root.querySelector<HTMLElement>('[data-work-entrance="media"]')
      const entranceText = [...leads, ...items]
      const { textStart, mediaStart } = scrollRevealTrackStarts(
        SCROLL_REVEAL_UNDER_MEDIA.mediaOffset,
        Boolean(mediaShell),
      )
      const { textY, textBlurPx, textDuration, textEase, stagger } = SCROLL_REVEAL_INTRO
      const entrance = gsap.timeline({ paused: true })
      entranceText.forEach((target, index) => {
        entrance.fromTo(
          target,
          { autoAlpha: 0, y: -textY, filter: `blur(${textBlurPx}px)` },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: textDuration, ease: textEase },
          textStart + index * stagger,
        )
      })
      if (mediaShell) {
        entrance.fromTo(
          mediaShell,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: MEDIA_DURATION, ease: MEDIA_EASE },
          mediaStart,
        )
        // First child owns the shell's full box — the whole frame stack
        // settles down from the zoom behind the mask, matching the site wipe.
        const stack = mediaShell.firstElementChild
        if (stack) {
          entrance.fromTo(
            stack,
            { scale: MEDIA_SCALE_FROM },
            { scale: 1, duration: MEDIA_DURATION, ease: MEDIA_EASE },
            mediaStart,
          )
        }
      }
      ScrollTrigger.create({
        trigger: root,
        start: FEATURED_WORK_PIN.entranceStart,
        once: true,
        onEnter: () => entrance.play(),
      })

      let timeline: gsap.core.Timeline | null = null
      if (count > 1) {
        const { snapDuration, snapDelay, snapAdvanceFraction, entranceHoldSvh, stepSvh } =
          FEATURED_WORK_PIN
        // Timeline time in step units; the hold is a fraction of a step.
        const hold = entranceHoldSvh / stepSvh
        const total = hold + count - 1
        // Item i rests centered at time `hold + i`. The glide commits to the
        // next item only past `snapAdvanceFraction` of a step in the scroll
        // direction — a flick advances, but arrival overshoot (which lands in
        // the hold or barely past it) always settles back on item one.
        const snapToItem = (value: number, self?: ScrollTrigger) => {
          const step = gsap.utils.clamp(0, count - 1, value * total - hold)
          const fraction = step - Math.floor(step)
          const threshold =
            (self?.direction ?? 1) < 0 ? 1 - snapAdvanceFraction : snapAdvanceFraction
          const index = fraction >= threshold ? Math.ceil(step) : Math.floor(step)
          return (hold + index) / total
        }
        timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            snap: {
              snapTo: snapToItem,
              duration: snapDuration,
              ease: activateEase,
              delay: snapDelay,
              // Judge from position, not projected momentum — a hard flick
              // must not overshoot items the eye never saw.
              inertia: false,
            },
            invalidateOnRefresh: true,
            onUpdate(self) {
              const time = self.progress * total
              activate(gsap.utils.clamp(0, count - 1, Math.round(time - hold)))
            },
            onRefresh(self) {
              // Function-based tween values re-measure themselves; the resting
              // start state is owned here.
              if (self.progress === 0) gsap.set(list, { y: -centers()[0] })
            },
          },
        })
        // The hold, then one unit of timeline time per transition, continuous
        // to the end — the snap glide, not a plateau, owns the centered rest.
        timeline.to({}, { duration: hold }, 0)
        for (let index = 1; index < count; index++) {
          timeline.fromTo(
            list,
            { y: () => -centers()[index - 1] },
            { y: () => -centers()[index], duration: 1, immediateRender: false },
            hold + index - 1,
          )
        }
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
      style={{
        height: `calc(100svh + ${
          count > 1
            ? FEATURED_WORK_PIN.entranceHoldSvh + (count - 1) * FEATURED_WORK_PIN.stepSvh
            : 0
        }svh)`,
      }}
    >
      {/* Padding mirrors the fixed header/footer bars so `top-1/2` anchors —
          the list and the media frame — center within the visible content
          area, not the raw viewport. Absolute children (masks, eyebrow) are
          unaffected and stay on the physical viewport edges. */}
      <div className="sticky top-0 h-svh overflow-hidden pt-(--header-height) pb-(--footer-height)">
        <Container className="relative h-full" width="default">
          <div className="grid h-full md:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
            <div className="relative h-full">
              <ul className="absolute inset-x-0 top-1/2 will-change-transform" data-work-list>
                {entries.map((entry, index) => (
                  <li data-work-item key={entry.id}>
                    <Link
                      className="group block py-5 outline-none md:py-6"
                      href={entry.href}
                      onFocus={() => activateRef.current?.(index)}
                      transitionTypes={[...forwardNavTransitionTypes]}
                    >
                      <h3
                        className={cn(
                          'text-2xl/9 font-light text-foreground md:text-3xl/9',
                          index > 0 && 'blur-xs',
                        )}
                        data-work-title
                        style={{ opacity: restingTitleOpacity(index) }}
                      >
                        {entry.title}
                      </h3>
                      <MetaLine className={cn(index > 0 && 'opacity-0')} entry={entry} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative hidden h-full md:block">
              <div className="absolute top-1/2 right-0 ml-auto w-full -translate-y-1/2">
                <div
                  className="relative aspect-video overflow-hidden rounded-md bg-muted"
                  data-work-entrance="media"
                >
                  {/* Entrance scale target: the whole frame stack zooms behind the shell's mask. */}
                  <div className="absolute inset-0">
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
                              size="(min-width: 768px) 55vw, 100vw"
                            />
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>

        <div className="absolute inset-x-0 top-(--header-height) z-30 pt-8">
          <Container className="flex items-center justify-between" width="default">
            {eyebrow ? (
              <div data-work-entrance="lead">
                <EyebrowRule label={eyebrow} />
              </div>
            ) : (
              <span />
            )}
            {count > 1 ? (
              <p
                className="font-mono text-xs/none font-medium text-muted-foreground"
                data-work-entrance="lead"
              >
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

'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

gsap.registerPlugin(useGSAP)

/**
 * Every tunable the reveal timeline reads. Targets run on two tracks — text
 * (`data-reveal`) and media (`data-reveal="media"`) — each staggered in
 * document order; `mediaOffset` shifts the media track against the text track.
 */
export type ScrollRevealTuning = {
  /** Drop distance text targets settle down from (px). */
  textY?: number
  /** Blur the text settles out of (px). */
  textBlurPx?: number
  /** Text entrance duration (s). */
  textDuration?: number
  /** GSAP ease for text targets. */
  textEase?: string
  /** Document-order delay between consecutive targets on the same track (s). */
  stagger?: number
  /** Media entrance duration (s). */
  mediaDuration?: number
  /** GSAP ease for media targets. */
  mediaEase?: string
  /**
   * Scale the media content settles down from during the wipe: the
   * `data-reveal="media"` container is a clipped window (its mask holds the
   * frame) while its first child zooms out to rest. 1 = no scale.
   *
   * The first child must own the window's full box (be in-flow with size, or
   * `absolute inset-0` against the container). The scale transform makes it
   * the containing block for absolutely-positioned descendants, so a zero-size
   * static wrapper (e.g. `<Media fill>`'s default div — pass
   * `htmlElement={null}` instead) collapses the media to nothing.
   */
  mediaScaleFrom?: number
  /**
   * Media-track start relative to the text track (s): negative = media leads
   * and text settles in while the wipe finishes, 0 = both tracks start
   * together, positive = media trails the text. Ignored when the shell has no
   * media targets, so a reveal carrying an offset stays safe on text-only
   * content.
   */
  mediaOffset?: number
  /** Fraction of the shell that must be visible before the entrance plays. */
  enterThreshold?: number
}

export type ScrollRevealProps = ScrollRevealTuning & {
  /** `div` for blocks that render their own `<section>` root. */
  as?: 'section' | 'div'
  className?: string
  children: ReactNode
  /** Bump to rebuild the timeline and replay the entrance (demo replay buttons). */
  replayKey?: number
  /**
   * Which of the two site reveals this shell plays; explicit tuning props
   * still win over the variant's values.
   */
  variant?: ScrollRevealVariant
}

/**
 * The complete reveal for introduction / text-only blocks: copy carries the
 * moment, so lines get more air between them. Owned in full here,
 * independently of the under-media reveal — tuning one never moves the other.
 * Tune on /demo/transitions ("Reveal — intro / text only"), paste back; every
 * block tagged `variant="intro"` reads exactly these values.
 */
export const SCROLL_REVEAL_INTRO = {
  textY: 28,
  textBlurPx: 6,
  textDuration: 0.9,
  textEase: 'power3.out',
  stagger: 0.12,
} as const satisfies ScrollRevealTuning

/**
 * The complete reveal for copy paired with media: its own text tuning, the
 * top-origin mask wipe with the content settling down from a slight zoom
 * behind the clipped frame (no fade, no blur — expensive to composite on
 * large media), and the offset that lets the wipe lead while the text settles
 * in beneath it. Owned in full here, independently of the intro reveal. Tune
 * on /demo/transitions ("Reveal — media + text"), paste back; every block
 * tagged `variant="underMedia"` reads exactly these values.
 */
export const SCROLL_REVEAL_UNDER_MEDIA = {
  textY: 20,
  textBlurPx: 10,
  textDuration: 0.6,
  textEase: 'power3.out',
  stagger: 0.04,
  mediaDuration: 0.6,
  mediaEase: 'power3.out',
  mediaScaleFrom: 1.15,
  mediaOffset: -0.5,
} as const satisfies ScrollRevealTuning

/**
 * Shared viewport gate: one observer per shell drives both reveals alike.
 * Entrances hold until half the shell is on screen, so content is near
 * mid-viewport before it plays; shells taller than twice the viewport clamp
 * to what their box can actually reach (see the observer setup). Each
 * entrance plays once — scrolling back past a revealed section never
 * reverses or replays it.
 */
export const SCROLL_REVEAL_TRIGGER_DEFAULTS = {
  enterThreshold: 0.5,
} as const satisfies ScrollRevealTuning

/**
 * Click-driven swap exits (panel/tab swaps) lift the outgoing content out
 * faster than the entrance settles it in. Scroll exits don't animate at all —
 * entrances are play-once.
 */
export const SCROLL_REVEAL_EXIT_TIME_SCALE = 1.6

/**
 * Enter gate for full-viewport shells (`fullViewportSectionClassName`
 * surfaces): a band that holds the whole screen waits for half visibility so
 * the entrance lands while the section owns the view. Kept as its own export
 * so the two gates can diverge again without touching call sites.
 */
export const SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD = 0.5

/** The two block shapes; each variant is a complete, independently tuned reveal. */
const SCROLL_REVEAL_VARIANTS = {
  intro: SCROLL_REVEAL_INTRO,
  underMedia: SCROLL_REVEAL_UNDER_MEDIA,
} as const

export type ScrollRevealVariant = keyof typeof SCROLL_REVEAL_VARIANTS

/**
 * Resolution floor for shells that pass no variant: the intro reveal's text
 * language, media-track values referenced from the under-media reveal (a
 * variant-less shell with media targets still wipes like the site), tracks
 * aligned, shared gate. Values are imported, never restated.
 */
const BASE = {
  ...SCROLL_REVEAL_INTRO,
  mediaDuration: SCROLL_REVEAL_UNDER_MEDIA.mediaDuration,
  mediaEase: SCROLL_REVEAL_UNDER_MEDIA.mediaEase,
  mediaScaleFrom: SCROLL_REVEAL_UNDER_MEDIA.mediaScaleFrom,
  mediaOffset: 0,
  ...SCROLL_REVEAL_TRIGGER_DEFAULTS,
} as const satisfies Required<ScrollRevealTuning>

/**
 * Track start times for a shell: the signed `mediaOffset` splits into two
 * non-negative timeline positions. Exported so the demo's timing diagram plots
 * exactly what the timeline builds.
 */
export function scrollRevealTrackStarts(mediaOffset: number, hasMediaTargets: boolean) {
  return {
    // Text never waits on an empty media track.
    textStart: hasMediaTargets ? Math.max(0, -mediaOffset) : 0,
    mediaStart: Math.max(0, mediaOffset),
  }
}

/** Base ← variant reveal ← explicit props; an undefined prop never overrides. */
function resolveTuning(
  variant: ScrollRevealVariant | undefined,
  overrides: ScrollRevealTuning,
): Required<ScrollRevealTuning> {
  const resolved: Required<ScrollRevealTuning> = {
    ...BASE,
    ...(variant ? SCROLL_REVEAL_VARIANTS[variant] : undefined),
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) (resolved as Record<string, unknown>)[key] = value
  }
  return resolved
}

/**
 * The site's scroll-entrance motion language, owned in one place: descendants
 * marked `data-reveal` drop into place with a blur settle when the shell
 * enters the viewport, and `data-reveal="media"` targets mask-wipe open from
 * the top. The entrance plays once — scrolling back past a revealed shell
 * never reverses or replays it. Text and media run as separate tracks so
 * `mediaOffset` can sync or sequence them. Server-rendered children stay
 * visible without JavaScript; reduced motion renders the final state.
 */
export function ScrollReveal({
  as: Tag = 'section',
  className,
  children,
  replayKey = 0,
  variant,
  ...tuning
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const {
    textY,
    textBlurPx,
    textDuration,
    textEase,
    stagger,
    mediaDuration,
    mediaEase,
    mediaScaleFrom,
    mediaOffset,
    enterThreshold,
  } = resolveTuning(variant, tuning)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
      if (!targets.length) return

      if (prefersReducedMotion) {
        gsap.set(targets, { clearProps: 'all' })
        return
      }

      const textTargets = targets.filter((target) => target.dataset.reveal !== 'media')
      const mediaTargets = targets.filter((target) => target.dataset.reveal === 'media')
      const { textStart, mediaStart } = scrollRevealTrackStarts(
        mediaOffset,
        mediaTargets.length > 0,
      )

      // Reveal targets may also be `pressable`, whose CSS transition covers
      // opacity — left on, it would re-transition every per-frame GSAP write
      // and smear the entrance. Suspend transitions for the tween, restore after.
      const tl = gsap.timeline({
        paused: true,
        onStart: () => gsap.set(targets, { transition: 'none' }),
        onComplete: () => {
          gsap.set(targets, { clearProps: 'transition' })
          // The wipe's final inset(0) still clips at the border box, which
          // would pin media that intentionally overflows its frame (WebGL
          // edge bleed) inside it — drop the mask once the entrance is done.
          // Guarded: gsap.set([]) logs a "target not found" warning on
          // text-only shells.
          if (mediaTargets.length) gsap.set(mediaTargets, { clearProps: 'clipPath' })
        },
      })
      textTargets.forEach((target, index) => {
        tl.fromTo(
          target,
          { autoAlpha: 0, y: -textY, filter: `blur(${textBlurPx}px)` },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: textDuration, ease: textEase },
          textStart + index * stagger,
        )
      })
      mediaTargets.forEach((target, index) => {
        const at = mediaStart + index * stagger
        tl.fromTo(
          target,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: mediaDuration, ease: mediaEase },
          at,
        )
        // The container is the window: its clip mask holds the frame while the
        // content inside settles down from a slight zoom on the same beat.
        const content = target.firstElementChild
        if (content && mediaScaleFrom !== 1) {
          tl.fromTo(
            content,
            { scale: mediaScaleFrom },
            { scale: 1, duration: mediaDuration, ease: mediaEase },
            at,
          )
        }
      })

      // A shell taller than the viewport can never expose a large fraction of
      // itself, so the gate caps at the ratio its box can actually reach —
      // with headroom for rounding — or tall content would never play.
      const reachableRatio =
        root.offsetHeight > 0 ? Math.min(1, (window.innerHeight / root.offsetHeight) * 0.85) : 1
      const gate = Math.min(enterThreshold, reachableRatio)

      // Play-once: the observer's only job is to start the entrance, so it
      // disconnects the moment the gate is met — no exit reverse, no replay.
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return
          if (entry.intersectionRatio >= gate) {
            tl.play()
            observer.disconnect()
          }
        },
        { threshold: [0, gate] },
      )
      observer.observe(root)
      return () => observer.disconnect()
    },
    {
      scope: rootRef,
      dependencies: [
        prefersReducedMotion,
        replayKey,
        textY,
        textBlurPx,
        textDuration,
        textEase,
        stagger,
        mediaDuration,
        mediaEase,
        mediaScaleFrom,
        mediaOffset,
        enterThreshold,
      ],
      revertOnUpdate: true,
    },
  )

  return (
    <Tag className={className} ref={rootRef}>
      {children}
    </Tag>
  )
}

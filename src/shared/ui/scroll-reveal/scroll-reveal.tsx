'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

gsap.registerPlugin(useGSAP)

/**
 * Every tunable the reveal timeline reads. Targets run on two tracks — text
 * (`data-reveal`, plus `data-reveal="panel"` for opacity + y without blur)
 * and media (`data-reveal="media"`) — each staggered in document order and
 * gated on its own target; `mediaOffset` delays one track after its gate.
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
   * Track delay after that track's own gate (s): negative = media leads
   * (text waits `-mediaOffset` after the copy is in view), 0 = a track
   * plays as soon as it has entered, positive = media waits after the
   * media gate. Ignored when the shell has no media targets, so a reveal
   * carrying an offset stays safe on text-only content. Side-by-side
   * layouts still read as one beat because both gates fire together.
   */
  mediaOffset?: number
  /**
   * How far a track's own target must rise past the fold before that
   * track plays, as a fraction of the viewport height (0.15 = a sixth of
   * the screen). Position, not visible fraction — see `observeRevealGate`.
   */
  enterOffset?: number
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
  /**
   * Selector for an in-flow element whose position gates every track
   * together, for shells that cannot report their own scroll position — a
   * sticky or fixed band is on screen from the first paint, so its own box
   * would fire immediately. Resolved document-wide. Without this, each
   * track gates on its own uppermost target.
   */
  gateSelector?: string
  /**
   * Fires once the entrance has settled (or immediately under reduced
   * motion). Use it to mount work that must not composite during the wipe
   * or scale — a WebGL canvas inside a `clip-path` / `scale` tween.
   */
  onComplete?: () => void
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
 * Shared viewport gate: one observer per track drives every reveal alike.
 * Each track holds until its own target has risen this fraction of the
 * viewport past the fold — media wipes when the image is on screen, copy
 * drops in when the copy is on screen. Each track plays once — scrolling
 * back past a revealed section never reverses or replays it.
 */
export const SCROLL_REVEAL_TRIGGER_DEFAULTS = {
  enterOffset: 0.15,
} as const satisfies ScrollRevealTuning

/**
 * Click-driven panel swaps (dropdown industry / audience). Distinct from the
 * scroll entrance: opacity only — no blur, no lift. Those are first-seen
 * language; a switch the user will fire while browsing must feel like a
 * response, not a replay of the section reveal. Durations stay under 250ms.
 */
export const SCROLL_REVEAL_SWAP = {
  textDuration: 0.2,
  textEase: 'power2.out',
  stagger: 0.03,
  mediaDuration: 0.22,
  mediaEase: 'power2.out',
} as const

/**
 * Click-driven swap exits (panel/tab swaps) finish faster than the incoming
 * half settles. Scroll exits don't animate at all — entrances are play-once.
 */
export const SCROLL_REVEAL_EXIT_TIME_SCALE = 1.6

/**
 * Enter gate for a curtain band — a closing screen the page unmasks by
 * scrolling off it. Its gate element is the flow line where the band starts,
 * so the offset reads directly as unmask progress: the copy starts settling
 * once a fifth of the band has cleared the fold, rather than waiting for the
 * whole screen to open and then playing to an audience that has already
 * arrived.
 */
export const SCROLL_REVEAL_CURTAIN_ENTER_OFFSET = 0.2

/**
 * Play-once viewport gate shared by every reveal shell, bespoke ones
 * included: fires when `gate`'s top edge has risen `enterOffset` of the
 * viewport height past the fold, then disconnects — no exit reverse, no
 * replay.
 *
 * Position, not visible fraction. A shell several screens tall can never
 * expose a useful ratio of itself, and one whose copy sits at its bottom edge
 * exposes its ratio from the wrong end — either way a ratio gate fires while
 * the copy is still below the fold and the settle is over before anyone sees
 * it. Measuring each track's own distance past the fold is the same trigger
 * at every block height: media-first layouts wipe when the image arrives,
 * and the copy still has an entrance once it reaches the same line.
 */
export function observeRevealGate(gate: Element, enterOffset: number, onEnter: () => void) {
  // A -100% bottom margin collapses the root box to a zero-height line that
  // nothing can intersect, which would strand the entrance paused forever.
  const offset = Math.round(Math.min(Math.max(enterOffset, 0), 0.9) * 100)
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      onEnter()
      observer.disconnect()
    },
    { rootMargin: `0px 0px -${offset}% 0px`, threshold: 0 },
  )
  observer.observe(gate)
  return () => observer.disconnect()
}

/**
 * The reveal target whose top edge is highest in the viewport. Each track
 * gates on its own uppermost node so a media-first layout wipes as soon as
 * the image has entered, and the copy still waits until it has entered too.
 */
export function uppermostRevealTarget(targets: readonly HTMLElement[]): HTMLElement | undefined {
  if (targets.length === 0) return undefined
  return targets.reduce((highest, target) =>
    target.getBoundingClientRect().top < highest.getBoundingClientRect().top ? target : highest,
  )
}

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
 * Track start times after that track's own gate: the signed `mediaOffset`
 * splits into two non-negative delays. Exported so the demo's timing diagram
 * plots exactly what each timeline builds.
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
 * marked `data-reveal` drop into place with a blur settle when that copy
 * enters the viewport, `data-reveal="panel"` is the same track without blur
 * (opacity + y only — so glass surfaces keep `backdrop-filter`), and
 * `data-reveal="media"` targets mask-wipe open from the top when the media
 * itself has entered. Each track plays once — scrolling back past a revealed
 * shell never reverses or replays it. `mediaOffset` delays one track after
 * its own gate so a wipe can still lead the copy when both are on screen
 * together. Server-rendered children stay visible without JavaScript;
 * reduced motion renders the final state.
 */
export function ScrollReveal({
  as: Tag = 'section',
  className,
  children,
  replayKey = 0,
  variant,
  gateSelector,
  onComplete,
  ...tuning
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
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
    enterOffset,
  } = resolveTuning(variant, tuning)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
      if (!targets.length) return

      if (prefersReducedMotion) {
        gsap.set(targets, { clearProps: 'all' })
        onCompleteRef.current?.()
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
      const suspendTransitions = () => gsap.set(targets, { transition: 'none' })
      let remaining = 0
      const arm = (tl: gsap.core.Timeline) => {
        remaining += 1
        tl.eventCallback('onStart', suspendTransitions)
        tl.eventCallback('onComplete', () => {
          remaining -= 1
          if (remaining !== 0) return
          gsap.set(targets, { clearProps: 'transition' })
          // The wipe's final inset(0) still clips at the border box, which
          // would pin media that intentionally overflows its frame (WebGL
          // edge bleed) inside it — drop the mask once the entrance is done.
          // Guarded: gsap.set([]) logs a "target not found" warning on
          // text-only shells.
          if (mediaTargets.length) gsap.set(mediaTargets, { clearProps: 'clipPath' })
          onCompleteRef.current?.()
        })
      }

      const addTextTweens = (tl: gsap.core.Timeline, start: number) => {
        textTargets.forEach((target, index) => {
          // Glass / functional panels can't take `filter` — it kills
          // `backdrop-filter` on the same node. Same beat, opacity + y only.
          const panel = target.dataset.reveal === 'panel'
          tl.fromTo(
            target,
            {
              autoAlpha: 0,
              y: -textY,
              ...(panel ? {} : { filter: `blur(${textBlurPx}px)` }),
            },
            {
              autoAlpha: 1,
              y: 0,
              ...(panel ? {} : { filter: 'blur(0px)' }),
              duration: textDuration,
              ease: textEase,
            },
            start + index * stagger,
          )
        })
      }

      const addMediaTweens = (tl: gsap.core.Timeline, start: number) => {
        mediaTargets.forEach((target, index) => {
          const at = start + index * stagger
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
      }

      // A sticky/fixed shell cannot report its own scroll position — one
      // in-flow marker gates every track together. Otherwise each track
      // waits on its own target so a media-first layout wipes when the
      // image arrives, and the copy still drops in once it has entered.
      const overrideGate = gateSelector ? document.querySelector(gateSelector) : null
      if (overrideGate) {
        const tl = gsap.timeline({ paused: true })
        addTextTweens(tl, textStart)
        addMediaTweens(tl, mediaStart)
        arm(tl)
        return observeRevealGate(overrideGate, enterOffset, () => tl.play())
      }

      const stops: Array<() => void> = []
      if (textTargets.length) {
        const textTl = gsap.timeline({ paused: true })
        addTextTweens(textTl, textStart)
        arm(textTl)
        const textGate = uppermostRevealTarget(textTargets) ?? root
        stops.push(observeRevealGate(textGate, enterOffset, () => textTl.play()))
      }
      if (mediaTargets.length) {
        const mediaTl = gsap.timeline({ paused: true })
        addMediaTweens(mediaTl, mediaStart)
        arm(mediaTl)
        const mediaGate = uppermostRevealTarget(mediaTargets) ?? root
        stops.push(observeRevealGate(mediaGate, enterOffset, () => mediaTl.play()))
      }
      return () => {
        for (const stop of stops) stop()
      }
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
        enterOffset,
        gateSelector,
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

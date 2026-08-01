'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

gsap.registerPlugin(useGSAP)

export type ScrollRevealProps = {
  /** `div` for blocks that render their own `<section>` root. */
  as?: 'section' | 'div'
  className?: string
  children: ReactNode
  /** Bump to rebuild the timeline and replay the entrance (demo replay buttons). */
  replayKey?: number
  /** Rise distance for text targets (px). */
  textY?: number
  /** Blur the text settles out of (px). */
  textBlurPx?: number
  /** Text entrance duration (s). */
  textDuration?: number
  /** GSAP ease for text targets. */
  textEase?: string
  /** Document-order delay between consecutive targets (s). */
  stagger?: number
  /** Starting scale media targets settle down from. */
  mediaScale?: number
  /** Media entrance duration (s). */
  mediaDuration?: number
  /** GSAP ease for media targets. */
  mediaEase?: string
  /** Fraction of the shell that must be visible before the entrance plays. */
  enterThreshold?: number
  /** Exit reverses faster than the entrance so it never lags a quick scroll. */
  exitTimeScale?: number
}

/**
 * Site-standard values for `data-reveal` text targets: rise into place with a
 * blur settle. Tune on /demo/transitions, paste back here — every consumer
 * (case-study reveal shell, and any future one) reads these.
 */
export const SCROLL_REVEAL_TEXT_DEFAULTS = {
  textY: 28,
  textBlurPx: 6,
  textDuration: 0.9,
  textEase: 'power3.out',
  stagger: 0.08,
} as const satisfies Partial<ScrollRevealProps>

/**
 * Site-standard values for `data-reveal="media"` targets: fade in while the
 * scale settles — blur on large images is expensive to composite.
 */
export const SCROLL_REVEAL_MEDIA_DEFAULTS = {
  mediaScale: 1.04,
  mediaDuration: 1.1,
  mediaEase: 'power2.out',
} as const satisfies Partial<ScrollRevealProps>

/** Shared viewport gate: one observer per shell drives text and media alike. */
export const SCROLL_REVEAL_TRIGGER_DEFAULTS = {
  enterThreshold: 0.35,
  exitTimeScale: 1.6,
} as const satisfies Partial<ScrollRevealProps>

const DEFAULTS = {
  ...SCROLL_REVEAL_TEXT_DEFAULTS,
  ...SCROLL_REVEAL_MEDIA_DEFAULTS,
  ...SCROLL_REVEAL_TRIGGER_DEFAULTS,
}

/**
 * The site's scroll-entrance motion language, owned in one place: descendants
 * marked `data-reveal` rise into place with a blur settle when the shell
 * enters the viewport, `data-reveal="media"` targets scale down instead, and
 * the whole timeline reverses out when the shell fully leaves so each pass
 * replays. Server-rendered children stay visible without JavaScript; reduced
 * motion renders the final state.
 */
export function ScrollReveal({
  as: Tag = 'section',
  className,
  children,
  replayKey = 0,
  textY = DEFAULTS.textY,
  textBlurPx = DEFAULTS.textBlurPx,
  textDuration = DEFAULTS.textDuration,
  textEase = DEFAULTS.textEase,
  stagger = DEFAULTS.stagger,
  mediaScale = DEFAULTS.mediaScale,
  mediaDuration = DEFAULTS.mediaDuration,
  mediaEase = DEFAULTS.mediaEase,
  enterThreshold = DEFAULTS.enterThreshold,
  exitTimeScale = DEFAULTS.exitTimeScale,
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

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

      const tl = gsap.timeline({ paused: true })
      targets.forEach((target, index) => {
        const isMedia = target.dataset.reveal === 'media'
        tl.fromTo(
          target,
          isMedia
            ? { autoAlpha: 0, scale: mediaScale }
            : { autoAlpha: 0, y: textY, filter: `blur(${textBlurPx}px)` },
          isMedia
            ? { autoAlpha: 1, scale: 1, duration: mediaDuration, ease: mediaEase }
            : {
                autoAlpha: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: textDuration,
                ease: textEase,
              },
          index * stagger,
        )
      })

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return
          if (entry.intersectionRatio >= enterThreshold) {
            tl.timeScale(1).play()
          } else if (!entry.isIntersecting) {
            tl.timeScale(exitTimeScale).reverse()
          }
        },
        { threshold: [0, enterThreshold] },
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
        mediaScale,
        mediaDuration,
        mediaEase,
        enterThreshold,
        exitTimeScale,
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

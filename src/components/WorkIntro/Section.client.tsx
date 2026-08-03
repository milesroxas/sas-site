'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { SCROLL_REVEAL_INTRO, SCROLL_REVEAL_TRIGGER_DEFAULTS } from '@/shared/ui/scroll-reveal'

gsap.registerPlugin(useGSAP)

/** Shared viewport gate — same enter fraction and exit speed as every reveal shell. */
const { enterThreshold: ENTER_THRESHOLD, exitTimeScale: EXIT_TIME_SCALE } =
  SCROLL_REVEAL_TRIGGER_DEFAULTS

/**
 * The choreography here is bespoke (title leads, eyebrow and body follow on
 * their own offsets), but this is the site's introduction moment — every value
 * the intro reveal also owns is imported from it, not restated.
 */
const {
  textEase: EASE,
  textDuration: TITLE_DURATION,
  textBlurPx: BODY_BLUR_PX,
  stagger: BODY_STAGGER,
} = SCROLL_REVEAL_INTRO

/**
 * Full-screen shell for the work intro. Copy drops into place when the band
 * enters the viewport and reverses out when it fully leaves, so each pass
 * through the section replays as its own moment. Server-rendered children stay
 * visible without JavaScript; reduced motion renders the final state.
 */
export function WorkIntroSection({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      // Resolve optional nodes from the scoped root — eyebrow/body are often absent.
      const title = root.querySelector<HTMLElement>('[data-intro-title]')
      const eyebrow = root.querySelector<HTMLElement>('[data-intro-eyebrow]')
      const paragraphs = root.querySelectorAll<HTMLElement>('[data-intro-body] p')
      const targets = [title, eyebrow, ...paragraphs].filter(
        (el): el is HTMLElement => el != null,
      )
      if (!targets.length) return

      if (prefersReducedMotion) {
        gsap.set(targets, { clearProps: 'all' })
        return
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } })
      if (title) {
        tl.fromTo(
          title,
          { autoAlpha: 0, y: -32, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: TITLE_DURATION },
          0,
        )
      }
      if (eyebrow) {
        tl.fromTo(eyebrow, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.3)
      }
      if (paragraphs.length) {
        tl.fromTo(
          paragraphs,
          { autoAlpha: 0, y: -24, filter: `blur(${BODY_BLUR_PX}px)` },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: BODY_STAGGER },
          0.4,
        )
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return
          if (entry.intersectionRatio >= ENTER_THRESHOLD) {
            tl.timeScale(1).play()
          } else if (!entry.isIntersecting) {
            tl.timeScale(EXIT_TIME_SCALE).reverse()
          }
        },
        { threshold: [0, ENTER_THRESHOLD] },
      )
      observer.observe(root)
      return () => observer.disconnect()
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true },
  )

  return (
    <section
      className="flex min-h-[calc(100svh-var(--footer-height))] flex-col justify-center overflow-clip bg-background py-16 text-foreground md:py-20 lg:py-24"
      ref={rootRef}
    >
      {children}
    </section>
  )
}

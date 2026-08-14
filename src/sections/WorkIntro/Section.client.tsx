'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { fullViewportSectionClassName, themeClasses } from '@/blocks/shared/section'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD,
  SCROLL_REVEAL_INTRO,
} from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

gsap.registerPlugin(useGSAP)

/** Full-viewport shell: fullscreen enter gate. */
const ENTER_THRESHOLD = SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD

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
 * What only this choreography owns: the title's deeper drop and heavier blur,
 * and the fixed follow-on offsets/drops for eyebrow and body. Each value lives
 * here once — tune here, nowhere else.
 */
const WORK_INTRO = {
  titleY: 32,
  titleBlurPx: 8,
  eyebrowY: 12,
  eyebrowDuration: 0.6,
  eyebrowAt: 0.3,
  bodyY: 24,
  bodyDuration: 0.8,
  bodyAt: 0.4,
} as const

/**
 * Full-screen shell for the work intro. Copy drops into place once, when the
 * band first enters the viewport — scrolling back past it never reverses or
 * replays the entrance. Server-rendered children stay visible without
 * JavaScript; reduced motion renders the final state.
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
      const targets = [title, eyebrow, ...paragraphs].filter((el): el is HTMLElement => el != null)
      if (!targets.length) return

      if (prefersReducedMotion) {
        gsap.set(targets, { clearProps: 'all' })
        return
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } })
      if (title) {
        tl.fromTo(
          title,
          { autoAlpha: 0, y: -WORK_INTRO.titleY, filter: `blur(${WORK_INTRO.titleBlurPx}px)` },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: TITLE_DURATION },
          0,
        )
      }
      if (eyebrow) {
        tl.fromTo(
          eyebrow,
          { autoAlpha: 0, y: -WORK_INTRO.eyebrowY },
          { autoAlpha: 1, y: 0, duration: WORK_INTRO.eyebrowDuration },
          WORK_INTRO.eyebrowAt,
        )
      }
      if (paragraphs.length) {
        tl.fromTo(
          paragraphs,
          { autoAlpha: 0, y: -WORK_INTRO.bodyY, filter: `blur(${BODY_BLUR_PX}px)` },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: WORK_INTRO.bodyDuration,
            stagger: BODY_STAGGER,
          },
          WORK_INTRO.bodyAt,
        )
      }

      // Play-once: start the entrance at the gate, then disconnect.
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return
          if (entry.intersectionRatio >= ENTER_THRESHOLD) {
            tl.play()
            observer.disconnect()
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
    <section className={cn(fullViewportSectionClassName, themeClasses.light)} ref={rootRef}>
      {children}
    </section>
  )
}

'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { SCROLL_REVEAL_TRIGGER_DEFAULTS } from '@/shared/ui/scroll-reveal'

gsap.registerPlugin(useGSAP)

/** Shared viewport gate — same enter fraction and exit speed as every reveal shell. */
const { enterThreshold: ENTER_THRESHOLD, exitTimeScale: EXIT_TIME_SCALE } =
  SCROLL_REVEAL_TRIGGER_DEFAULTS

/**
 * Full-screen shell for the work intro. Copy rises into place when the band
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

      const title = '[data-intro-title]'
      const eyebrow = '[data-intro-eyebrow]'
      const paragraphs = '[data-intro-body] p'

      if (prefersReducedMotion) {
        gsap.set([title, eyebrow, paragraphs], { clearProps: 'all' })
        return
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      tl.fromTo(
        title,
        { autoAlpha: 0, y: 32, filter: 'blur(8px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9 },
        0,
      )
      tl.fromTo(eyebrow, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.3)
      tl.fromTo(
        paragraphs,
        { autoAlpha: 0, y: 24, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12 },
        0.4,
      )

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

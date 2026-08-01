'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type ReactNode, useRef } from 'react'
import { type SectionTheme, themeClasses } from '@/blocks/shared/section'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'

gsap.registerPlugin(useGSAP)

/** Fraction of the section that must be visible before the entrance plays. */
const ENTER_THRESHOLD = 0.35
/** Exit reverses faster than the entrance so it never lags a quick scroll. */
const EXIT_TIME_SCALE = 1.6
/** Document-order delay between consecutive reveal targets. */
const STAGGER = 0.08

/**
 * Full-viewport shell for work-page composition blocks, sharing the
 * WorkIntroSection motion language: descendants marked `data-reveal` rise into
 * place with a blur settle when the band enters the viewport, and reverse out
 * when it fully leaves so each pass replays. `data-reveal="media"` targets
 * scale down instead — blur on large images is expensive to composite.
 * Server-rendered children stay visible without JavaScript; reduced motion
 * renders the final state.
 *
 * `as="div"` is for blocks that render their own `<section>` root; the shell
 * then only supplies the surface, viewport height, and entrance.
 */
export function RevealSection({
  as: Tag = 'section',
  theme = 'light',
  className,
  children,
}: {
  as?: 'section' | 'div'
  theme?: SectionTheme | null
  className?: string
  children: ReactNode
}) {
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
          isMedia ? { autoAlpha: 0, scale: 1.04 } : { autoAlpha: 0, y: 28, filter: 'blur(6px)' },
          isMedia
            ? { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power2.out' }
            : { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' },
          index * STAGGER,
        )
      })

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
    <Tag
      className={cn(
        'flex min-h-[calc(100svh-var(--footer-height))] flex-col justify-center overflow-clip py-16 md:py-24',
        themeClasses[theme || 'light'],
        className,
      )}
      ref={rootRef}
    >
      {children}
    </Tag>
  )
}

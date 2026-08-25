'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type RefObject, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  SCROLL_REVEAL_EXIT_TIME_SCALE as EXIT_TIME_SCALE,
  SCROLL_REVEAL_UNDER_MEDIA,
} from './scroll-reveal'

gsap.registerPlugin(useGSAP)

/**
 * Panel-swap choreography for dropdown-driven blocks, speaking the under-media
 * reveal's language — text drops with a blur settle, media settles from the
 * same zoom — so every value is imported from the reveal that owns it, never
 * restated. Swap targets (`data-swap`) are distinct nodes from a shell's
 * `data-reveal` targets, so the entrance timeline and the swap tweens never
 * write to the same element.
 */
const {
  textY: TEXT_Y,
  textBlurPx: TEXT_BLUR_PX,
  textDuration: TEXT_DURATION,
  textEase: TEXT_EASE,
  stagger: STAGGER,
  mediaDuration: MEDIA_DURATION,
  mediaEase: MEDIA_EASE,
  mediaScaleFrom: MEDIA_SCALE_FROM,
} = SCROLL_REVEAL_UNDER_MEDIA

const SWAP_TEXT = '[data-swap="text"]'
const SWAP_MEDIA = '[data-swap="media"]'

/**
 * Two-half swap: the current panel's `data-swap` targets lift out (sped up
 * like every swap exit), `onSwap` re-renders the next panel, and the
 * entrance half plays over the fresh nodes. Reduced motion swaps state
 * directly. Returns the context-safe select function.
 */
export function useRevealSwap({
  rootRef,
  active,
  onSwap,
  onSwapStart,
  onSettled,
}: {
  rootRef: RefObject<HTMLElement | null>
  /** Currently rendered panel index; the entrance half keys on its change. */
  active: number
  /** State setter invoked once the exit half finishes. */
  onSwap: (index: number) => void
  /** Fires as the exit half begins — unmount work that must not composite during the scale. */
  onSwapStart?: () => void
  /** Fires once the entrance half has settled (or immediately under reduced motion). */
  onSettled?: () => void
}) {
  const swapTlRef = useRef<gsap.core.Timeline | null>(null)
  const swappingRef = useRef(false)
  const targetIndexRef = useRef(active)
  const onSwapStartRef = useRef(onSwapStart)
  onSwapStartRef.current = onSwapStart
  const onSettledRef = useRef(onSettled)
  onSettledRef.current = onSettled
  const prefersReducedMotion = usePrefersReducedMotion()

  const { contextSafe } = useGSAP(
    () => {
      // Entrance half of a swap only — the shell's ScrollReveal owns the
      // first entrance, so mount and reduced-motion renders stay untouched.
      if (!swappingRef.current) return
      swappingRef.current = false
      const root = rootRef.current
      if (!root || prefersReducedMotion) return

      const texts = root.querySelectorAll<HTMLElement>(SWAP_TEXT)
      const media = root.querySelector<HTMLElement>(SWAP_MEDIA)
      const tl = gsap.timeline({ onComplete: () => onSettledRef.current?.() })
      if (texts.length) {
        tl.fromTo(
          texts,
          { autoAlpha: 0, y: -TEXT_Y, filter: `blur(${TEXT_BLUR_PX}px)` },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: TEXT_DURATION,
            ease: TEXT_EASE,
            stagger: STAGGER,
          },
          0,
        )
      }
      if (media) {
        tl.fromTo(
          media,
          { autoAlpha: 0, scale: MEDIA_SCALE_FROM },
          { autoAlpha: 1, scale: 1, duration: MEDIA_DURATION, ease: MEDIA_EASE },
          0,
        )
      }
      swapTlRef.current = tl
    },
    { scope: rootRef, dependencies: [active, prefersReducedMotion] },
  )

  return contextSafe((index: number) => {
    if (index === targetIndexRef.current) return
    targetIndexRef.current = index
    onSwapStartRef.current?.()
    const root = rootRef.current
    if (!root || prefersReducedMotion) {
      onSwap(index)
      onSettledRef.current?.()
      return
    }

    // Exit half: current content lifts out, then the state swap re-renders
    // and the entrance effect above plays.
    swapTlRef.current?.kill()
    swappingRef.current = true
    const texts = root.querySelectorAll<HTMLElement>(SWAP_TEXT)
    const media = root.querySelector<HTMLElement>(SWAP_MEDIA)
    const tl = gsap.timeline({ onComplete: () => onSwap(index) }).timeScale(EXIT_TIME_SCALE)
    if (texts.length) {
      tl.to(
        texts,
        {
          autoAlpha: 0,
          y: -TEXT_Y,
          filter: `blur(${TEXT_BLUR_PX}px)`,
          duration: TEXT_DURATION,
          ease: TEXT_EASE,
          stagger: STAGGER,
        },
        0,
      )
    }
    if (media) {
      tl.to(
        media,
        { autoAlpha: 0, scale: MEDIA_SCALE_FROM, duration: MEDIA_DURATION, ease: MEDIA_EASE },
        0,
      )
    }
    swapTlRef.current = tl
  })
}

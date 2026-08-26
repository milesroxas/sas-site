'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'
import { Media } from '@/components/Media'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { Media as MediaDoc } from '@/payload-types'
import { FOOTER_CLOSING_GATE_SELECTOR } from './curtain'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Depth travel for the closing band's background. Scrubbed 1:1 with scroll
 * (linear — constant motion, not a UI ease). Overscan on the layer must
 * exceed this travel so the photo never shows an edge.
 */
const FOOTER_CLOSING_PARALLAX = {
  yPercentFrom: 10,
  yPercentTo: -8,
} as const

/**
 * Which element the parallax scrubs against: the band's flow marker, since a
 * pinned band's own rect never moves. Falls back to the section around it.
 */
const resolveScrubTrigger = (root: HTMLElement): HTMLElement =>
  document.querySelector<HTMLElement>(FOOTER_CLOSING_GATE_SELECTOR) ??
  root.closest('section') ??
  root

/**
 * Full-bleed background for the closing band: an oversized layer scrubs
 * against scroll so the photo sits on a deeper plane than the copy while the
 * curtain uncovers the band. The scrub runs against the band's flow marker
 * (`./curtain`), not the band itself — pinned, the band's own rect never
 * moves — from the moment the band starts to uncover to the moment it is
 * fully open.
 */
export function ClosingMedia({ media }: { media: MediaDoc }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const root = rootRef.current
      const layer = layerRef.current
      if (!root || !layer || prefersReducedMotion) return

      gsap.fromTo(
        layer,
        { yPercent: FOOTER_CLOSING_PARALLAX.yPercentFrom },
        {
          yPercent: FOOTER_CLOSING_PARALLAX.yPercentTo,
          ease: 'none',
          scrollTrigger: {
            trigger: resolveScrubTrigger(root),
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        },
      )
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true },
  )

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
    >
      <div ref={layerRef} className="absolute inset-x-0 top-[-20%] h-[140%]">
        <Media fill htmlElement={null} imgClassName="object-cover" resource={media} size="100vw" />
      </div>
      {/* Vignette stays put while the photo drifts — the frame of the band,
          not another parallax layer. Sibling of the scaled layer so the
          mask stays put while the photo settles. */}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-background/60" />
    </div>
  )
}

'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'
import { Media } from '@/components/Media'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { Media as MediaDoc } from '@/payload-types'

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
 * Full-bleed background for the closing band: the outer node is the shared
 * media-wipe window; an oversized inner layer scrubs against scroll so the
 * photo sits on a deeper plane than the copy.
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

      const trigger = root.closest('section') ?? root

      gsap.fromTo(
        layer,
        { yPercent: FOOTER_CLOSING_PARALLAX.yPercentFrom },
        {
          yPercent: FOOTER_CLOSING_PARALLAX.yPercentTo,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'bottom bottom',
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
      data-reveal="media"
    >
      {/* First child owns the window so the wipe's zoom has a containing
          block (see ScrollReveal `mediaScaleFrom`). */}
      <div className="absolute inset-0">
        <div ref={layerRef} className="absolute inset-x-0 top-[-20%] h-[140%]">
          <Media
            fill
            htmlElement={null}
            imgClassName="object-cover"
            resource={media}
            size="100vw"
          />
        </div>
      </div>
      {/* Vignette stays put while the photo drifts — the frame of the band,
          not another parallax layer. Sibling of the scaled layer so the
          mask stays put while the photo settles. */}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-background/60" />
    </div>
  )
}

'use client'

import type React from 'react'
import { StreakVisual, type StreakVisualDescriptor } from '@/features/immersive/visual'
import { useHeroIntroSettled } from '@/heros/HeroBand'

/**
 * Hero backdrop for a Streak Field visual: the poster paints first (and is
 * what the takeover menu clones from `data-hero-media`), and the live field
 * waits for the page intro to settle before it is admitted, exactly as the
 * lens does over a media backdrop. The hero band pins its own palette, so the
 * slot reads its ground from the band rather than the site theme.
 */
export const HeroStreakBackground: React.FC<{ descriptor: StreakVisualDescriptor }> = ({
  descriptor,
}) => {
  const introSettled = useHeroIntroSettled()
  return (
    <div
      aria-hidden
      // data-hero-media: takeover-menu dissolve source (src/Header/Menu); the
      // poster img is the element cloned, never the canvas.
      data-hero-media
      className="pointer-events-none absolute inset-0 -z-10 opacity-85"
    >
      <StreakVisual
        active={introSettled}
        descriptor={descriptor}
        fill
        imgClassName="object-cover select-none"
        placement="hero"
        priority
        sizes="100vw"
      />
    </div>
  )
}

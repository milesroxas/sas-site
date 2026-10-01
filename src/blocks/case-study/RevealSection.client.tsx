'use client'

import type { ReactNode } from 'react'
import { type BandTheme, sectionThemeClass } from '@/blocks/shared/band-theme'
import { BAND_SPACING, type BandSpacing } from '@/blocks/shared/section'
import { ScrollReveal, type ScrollRevealVariant } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

/**
 * Composition band for work-page blocks: the same rhythm and surface as
 * `Section`, plus the block's scroll entrance.
 *
 * The entrance itself — `data-reveal` text drop, `data-reveal="media"`
 * top-down mask reveal, replay on each pass — lives in
 * `shared/ui/scroll-reveal`; this wrapper only supplies the band and the
 * block's reveal `variant` (`intro` for text-only shapes, `underMedia` when
 * copy sits with a media reveal).
 *
 * Spacing is the shared scale, so a work page and a Page stack the same block
 * with the same gap. Bands are never forced to viewport height.
 *
 * `bare` keeps the scroll entrance but drops the band (spacing + surface) for
 * a block nested inside a Section block, whose `SectionBand` owns both.
 */
export function RevealSection({
  bare = false,
  children,
  className,
  spacing = 'normal',
  theme,
  variant,
}: {
  bare?: boolean
  children: ReactNode
  className?: string
  spacing?: BandSpacing
  theme?: BandTheme | null
  variant?: ScrollRevealVariant
}) {
  return (
    <ScrollReveal
      as="section"
      variant={variant}
      className={cn(
        !bare && cn(BAND_SPACING[spacing], sectionThemeClass(theme)),
        'overflow-clip',
        className,
      )}
    >
      {children}
    </ScrollReveal>
  )
}

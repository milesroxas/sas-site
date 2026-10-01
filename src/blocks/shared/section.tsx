import type { ReactNode } from 'react'
import { type BandTheme, sectionThemeClass } from '@/blocks/shared/band-theme'
import { VISUAL_HOST } from '@/features/immersive/visual'
import { cn } from '@/utilities/ui'

/**
 * One rhythm. `band` is the outer `py-*` of a composition shell; `stack` is
 * the `space-y-*` between nested blocks inside a Section. Full class strings
 * live here so Tailwind can see them. Tune the steps here, never at a call site.
 *
 * Adjacent bands add (padding, so nothing collapses), which makes the gap
 * between two top-level blocks' content the sum of the two steps:
 *
 * - normal + normal → 8rem / 12rem — every text and contained block
 * - loose  + normal → 12rem / 18rem — full-bleed media next to copy
 * - loose  + loose  → 16rem / 24rem — two images in a row
 *
 * The steps double: tight 2/3rem, normal 4/6rem, loose 8/12rem. `loose` used
 * to sit 1.5rem above normal, too small a step to read as a decision, and too
 * little inset for a painted band, whose edge is visible and so cannot borrow
 * the neighbouring block's padding the way a `default` band does.
 *
 * A `stack` step is that sum, not the single band step: two blocks inside a
 * Section sit exactly as far apart as the same two blocks stacked at the top
 * level, so a Section regroups a run under one surface without retuning its
 * rhythm. Halving it instead capped a Section's widest setting at half the
 * page (128px against 256px on a work page, whose blocks are pinned loose),
 * which read as a dead select.
 *
 * `tight` is the editor-facing step below normal: a Section block holding a
 * short run of related blocks that should read as one beat.
 *
 * `none` is for a shell that owns its own size (featured work) or a Section
 * whose nested blocks should sit flush.
 */
export const SPACING_SCALE = {
  none: { band: 'py-0', stack: 'space-y-0' },
  tight: { band: 'py-8 md:py-12', stack: 'space-y-16 md:space-y-24' },
  normal: { band: 'py-16 md:py-24', stack: 'space-y-32 md:space-y-48' },
  loose: { band: 'py-32 md:py-48', stack: 'space-y-64 md:space-y-96' },
} as const

export type BandSpacing = keyof typeof SPACING_SCALE

export const BAND_SPACING = {
  none: SPACING_SCALE.none.band,
  tight: SPACING_SCALE.tight.band,
  normal: SPACING_SCALE.normal.band,
  loose: SPACING_SCALE.loose.band,
} as const

export const STACK_SPACING = {
  none: SPACING_SCALE.none.stack,
  tight: SPACING_SCALE.tight.stack,
  normal: SPACING_SCALE.normal.stack,
  loose: SPACING_SCALE.loose.stack,
} as const

/**
 * Full-viewport band for **page-level** sections that centre one piece of
 * content — the home statement, the work intro, the footer closing.
 *
 * Composition blocks do not use this: an editor stacking blocks in the
 * Composition tab gets the shared rhythm, never a forced screenful each.
 * A block only fills the viewport when its own design is a pinned scroll
 * shell (featured work, industry work), and that shell owns the height.
 */
export const fullViewportSectionClassName = cn(
  'flex min-h-[calc(100svh-var(--footer-height))] flex-col justify-center overflow-clip',
  BAND_SPACING.normal,
)

/**
 * The composition band: the single shell every block renders as its root.
 * Owns the vertical rhythm and the surface, nothing else.
 *
 * `bare` is for a block whose renderer already supplied the band — the
 * work-page reveal shell wraps the same components — so the band is never
 * painted twice.
 */
export const Section = ({
  bare = false,
  children,
  className,
  spacing = 'normal',
  theme,
}: {
  bare?: boolean
  children: ReactNode
  className?: string
  spacing?: BandSpacing
  theme?: BandTheme | null
}) => {
  if (bare) return <>{children}</>
  return (
    <section
      className={cn(BAND_SPACING[spacing], sectionThemeClass(theme), className)}
      {...VISUAL_HOST}
    >
      {children}
    </section>
  )
}

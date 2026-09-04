import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

/**
 * Block surface themes. Values are semantic tokens that follow the visitor's
 * site theme (html[data-theme]) — they never force an absolute light/dark mode.
 *
 * - light: default page surface
 * - dark: contrasted band within the active theme (tertiary; always low-luminance)
 * - neutral: quiet stripe (`--neutral`; not `--secondary`, a control fill)
 * - brand: brand accent surface
 *
 * `dark` surfaces are low-luminance in both site themes, so rich text needs
 * `prose-invert` even when the site itself is in light mode (site-level
 * `dark:prose-invert` only applies under html[data-theme=dark]).
 *
 * `band-dark` (globals.css) carries the band's whole surface set — muted,
 * card, secondary, accent, border, input — not just background/foreground.
 * A dark band that only remapped those two left every other token on the site
 * theme, so on a light-theme visit a `bg-muted` media plate painted a
 * near-white sheet inside the band and its subpixel edge read as a white
 * hairline around the image. Add new surface tokens there, never inline here.
 *
 * `band-neutral` only remaps the canvas pair; nested chrome stays on the
 * site theme so the light stripe keeps its current plate contrast.
 */
export const themeClasses = {
  light: 'bg-background text-foreground',
  dark: [
    'band-dark bg-tertiary text-tertiary-foreground',
    '[&_.payload-richtext]:prose-invert',
  ].join(' '),
  neutral: 'band-neutral bg-neutral text-neutral-foreground',
  brand: 'bg-brand text-brand-foreground',
} as const

export type SectionTheme = keyof typeof themeClasses

/**
 * One rhythm. `band` is the outer `py-*` of a composition shell; `stack` is
 * the `space-y-*` between nested blocks inside a Section. Full class strings
 * live here so Tailwind can see them. Tune the steps here, never at a call site.
 *
 * Adjacent bands add (padding, so nothing collapses), which makes the gap
 * between two top-level blocks' content the sum of the two steps:
 *
 * - normal + normal → 8rem / 12rem — every text and contained block
 * - loose  + normal → 10rem / 14rem — full-bleed media next to copy
 * - loose  + loose  → 12rem / 16rem — two images in a row
 *
 * `tight` is the editor-facing step below normal: a Section block holding a
 * short run of related blocks that should read as one beat.
 *
 * `none` is for a shell that owns its own size (featured work) or a Section
 * whose nested blocks should sit flush.
 */
export const SPACING_SCALE = {
  none: { band: 'py-0', stack: 'space-y-0' },
  tight: { band: 'py-8 md:py-12', stack: 'space-y-8 md:space-y-12' },
  normal: { band: 'py-16 md:py-24', stack: 'space-y-16 md:space-y-24' },
  loose: { band: 'py-24 md:py-32', stack: 'space-y-24 md:space-y-32' },
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
 * Surface classes for an editor-chosen theme, stated once so every shell —
 * `Section`, the work-page reveal shell, and blocks that own a bespoke shell —
 * resolves a null/absent theme the same way.
 */
export const sectionThemeClass = (theme?: SectionTheme | null) => themeClasses[theme || 'light']

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
  theme = 'light',
}: {
  bare?: boolean
  children: ReactNode
  className?: string
  spacing?: BandSpacing
  theme?: SectionTheme | null
}) => {
  if (bare) return <>{children}</>
  return (
    <section className={cn(BAND_SPACING[spacing], sectionThemeClass(theme), className)}>
      {children}
    </section>
  )
}

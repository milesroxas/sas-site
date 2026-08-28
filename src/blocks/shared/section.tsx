import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

/**
 * Block surface themes. Values are semantic tokens that follow the visitor's
 * site theme (html[data-theme]) — they never force an absolute light/dark mode.
 *
 * - light: default page surface
 * - dark: contrasted band within the active theme (tertiary; always low-luminance)
 * - neutral: secondary/muted surface
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
 */
export const themeClasses = {
  light: 'bg-background text-foreground',
  dark: [
    'band-dark bg-tertiary text-tertiary-foreground',
    '[&_.payload-richtext]:prose-invert',
  ].join(' '),
  neutral: 'bg-secondary text-secondary-foreground',
  brand: 'bg-brand text-brand-foreground',
} as const

export type SectionTheme = keyof typeof themeClasses

/**
 * Vertical rhythm of a composition band — the one place a block's outer
 * spacing is stated. Blocks never write their own `py-*`/`my-*`, and theme
 * never changes spacing: a band pads the same whether it paints a surface or
 * sits on the page.
 *
 * Adjacent bands add (padding, so nothing collapses), which makes the gap
 * between two blocks' content the sum of the two steps:
 *
 * - normal + normal → 8rem / 12rem — every text and contained block
 * - loose  + normal → 10rem / 14rem — full-bleed media next to copy
 * - loose  + loose  → 12rem / 16rem — two images in a row
 *
 * `none` is for blocks that own a pinned or self-sized shell (featured work),
 * where the band only supplies the surface.
 */
export const BAND_SPACING = {
  none: 'py-0',
  normal: 'py-16 md:py-24',
  loose: 'py-24 md:py-32',
} as const

export type BandSpacing = keyof typeof BAND_SPACING

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

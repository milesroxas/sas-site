/**
 * Band themes: the surface a composition band paints, stated once for every
 * surface that offers the choice (each block's `theme` select, the Section
 * block, hero bands) and for every shell that renders it (`Section`, the
 * work-page `RevealSection`, blocks with a bespoke shell). A plain module so
 * Payload config can import it without pulling React into the config graph.
 *
 * Values are stored in the DB (one Postgres enum per table): relabel freely,
 * never re-value without a migration.
 *
 * The band is how an editor flips a section against its neighbours. It never
 * replaces the visitor's light/dark preference, it works relative to it:
 *
 * - `default`: the page surface, in whichever palette the visitor chose.
 * - `inverted`: the other palette. Dark on a light visit, light on a dark
 *   one. `band-inverted` is a polarity scope (the `dark` variant in
 *   src/styles/shadcn-theme.css), so every token, `dark:` utility, prose
 *   style and visual poster inside it follows the flipped ground.
 * - `neutral`: a quiet stripe inside the visitor's palette (`--neutral`).
 * - `brand`: the brand surface (`--brand`).
 */
export const BAND_THEME_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Inverted', value: 'inverted' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Brand', value: 'brand' },
] as const

export type BandTheme = (typeof BAND_THEME_OPTIONS)[number]['value']

/**
 * Surface classes per theme. Full class strings live here so Tailwind can
 * see them. `bg-background` / `text-foreground` on the inverted band read
 * the flipped palette the band's own scope declares, so it needs no tokens
 * of its own. `band-neutral` remaps only the canvas pair (globals.css).
 */
export const themeClasses: Record<BandTheme, string> = {
  default: 'bg-background text-foreground',
  inverted: 'band-inverted bg-background text-foreground',
  neutral: 'band-neutral bg-neutral text-neutral-foreground',
  brand: 'bg-brand text-brand-foreground',
}

/**
 * Surface classes for a stored theme. A null/absent value (a row saved before
 * the field existed) is the page surface, so every shell resolves it the same
 * way.
 */
export const sectionThemeClass = (theme?: BandTheme | null) => themeClasses[theme || 'default']

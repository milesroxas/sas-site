import type { BandSpacing, SectionTheme } from '@/blocks/shared/section'

/**
 * Editor-facing Section options, stated once so the block config (selects) and
 * `SectionBand` (rendering) can never drift. Values are stored in the DB:
 * relabel freely, never re-value without a migration.
 *
 * The editor vocabulary is intentionally not the internal one: editors choose
 * a role (`inherit`, `secondary`, `accent`, `inverted`), and the map below
 * resolves it to the shared band surface in `@/blocks/shared/section`.
 */
export const SECTION_THEME_OPTIONS = [
  { label: 'Inherit', value: 'inherit' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Accent', value: 'accent' },
  { label: 'Inverted', value: 'inverted' },
] as const

export type SectionBlockTheme = (typeof SECTION_THEME_OPTIONS)[number]['value']

/**
 * `inherit` resolves to the page surface (`light`), which is exactly what
 * every block painted before Sections existed, so adjacent inherit sections
 * blend with the page and with each other.
 */
export const SECTION_THEME_TO_BAND: Record<SectionBlockTheme, SectionTheme> = {
  inherit: 'light',
  secondary: 'neutral',
  accent: 'brand',
  inverted: 'dark',
}

export const SECTION_SPACING_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Tight', value: 'tight' },
  { label: 'Loose', value: 'loose' },
  { label: 'None', value: 'none' },
] as const

export type SectionBlockSpacing = (typeof SECTION_SPACING_OPTIONS)[number]['value']

export const SECTION_SPACING_TO_BAND: Record<SectionBlockSpacing, BandSpacing> = {
  default: 'normal',
  tight: 'tight',
  loose: 'loose',
  none: 'none',
}

/**
 * Resolve an editor Default/Tight/Loose/None value to a `SPACING_SCALE` key.
 * Customize off (or a missing value) always returns Default → `normal`, even
 * if the hidden field still stores something else.
 */
export const resolveSectionSpacing = (
  customize?: boolean | null,
  value?: SectionBlockSpacing | null,
): BandSpacing => SECTION_SPACING_TO_BAND[(customize && value) || 'default']

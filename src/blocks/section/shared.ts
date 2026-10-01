import type { BandSpacing } from '@/blocks/shared/section'

/**
 * The Section's nested block list. Blocks read it to tell whether they sit
 * inside a Section (where the Section paints the band) from the admin field
 * path, so the name is stated here and nowhere else.
 */
export const SECTION_CHILDREN_FIELD = 'blocks'

/** True when an admin field path runs through a Section's nested blocks. */
export const isInsideSection = (path?: readonly (number | string)[]) =>
  Boolean(path?.includes(SECTION_CHILDREN_FIELD))

/**
 * Editor-facing Section options, stated once so the block config (selects) and
 * `SectionBand` (rendering) can never drift. Values are stored in the DB:
 * relabel freely, never re-value without a migration. The Section's theme is
 * the shared band theme (`@/blocks/shared/band-theme`), the same select every
 * block offers, so a block moved into a Section keeps its value as-is.
 */
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

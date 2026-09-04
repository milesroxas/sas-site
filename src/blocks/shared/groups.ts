/**
 * Blocks-drawer group labels, keyed by UI pattern — never by content domain.
 * Single source of truth: always assign `admin.group` from here so drawer
 * sections (and the drawer's group tabs) stay consistent across every
 * collection's composition field. A block that swaps data source but keeps
 * its pattern stays in the same group (e.g. a future carousel → interactive).
 */
export const BLOCK_GROUPS = {
  /** Page structure: the Section wrapper other blocks nest inside. */
  structure: 'Structure',
  /** Rich text and typographic copy sections. */
  text: 'Text',
  /** Long-form story sections. */
  narrative: 'Narrative',
  /** Copy bands that open or bridge a run of sections (transitions, offsets). */
  sectionHeading: 'Section heading',
  /** Image / video presentation: single, full-bleed, pairs, showcases. */
  media: 'Media',
  /** Media beside or above authored copy. */
  mediaContent: 'Media and content',
  /** Two-column text + media composites. */
  split: 'Split layouts',
  /** Large typographic statements, pull quotes, testimonials. */
  statements: 'Statements',
  /** Tabs, switchers, marquees, carousels, accordions (FAQ). */
  interactive: 'Interactive',
  /** Numbered runs, card grids, listings, facts, metrics, related content. */
  lists: 'Lists',
  /** Forms, signups, calls to action. */
  forms: 'Forms & CTAs',
  /** Free-form escape hatch: column builders with no fixed pattern. */
  custom: 'Custom',
} as const

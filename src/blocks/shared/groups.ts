/**
 * Blocks-drawer group labels, keyed by UI pattern — never by content domain.
 * Single source of truth: always assign `admin.group` from here so drawer
 * sections (and the drawer's group tabs) stay consistent across every
 * collection's composition field. A block that swaps data source but keeps
 * its pattern stays in the same group (e.g. a future carousel → interactive).
 */
export const BLOCK_GROUPS = {
  /** Rich text and typographic copy sections. */
  text: 'Text',
  /** Long-form story sections and rich transitions. */
  narrative: 'Narrative',
  /** Image / video presentation: single, full-bleed, pairs, showcases. */
  media: 'Media',
  /** Two-column text + media composites. */
  split: 'Split layouts',
  /** Large typographic statements, pull quotes, testimonials. */
  statements: 'Statements',
  /** Tabs, switchers, marquees — and future carousels. */
  interactive: 'Interactive',
  /** Card grids, listings, facts, metrics, related content. */
  lists: 'Lists & grids',
  /** Forms, signups, calls to action. */
  forms: 'Forms & CTAs',
} as const

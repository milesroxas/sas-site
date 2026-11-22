/**
 * The site's text roles, stated once. Every block takes its type from its
 * role here; no block chooses a size, and editors get no type-size controls.
 * The tokens (size, leading, tracking, weight) live in `globals.css` `@theme`.
 *
 * | Role                                   | Class            | Mobile → desktop |
 * | -------------------------------------- | ---------------- | ---------------- |
 * | Hero, Statement layout                 | `text-display`    | 48 → 96px        |
 * | Page title, a Section's opener         | `text-heading`    | 32 → 48px        |
 * | A block's own heading, prose h2        | `text-subheading` | 24 → 28px        |
 * | Deck, statement, item title, prose h3  | `text-lead`       | 20 → 24px        |
 * | All running copy, prose h4 (medium)    | `text-body`       | 16 → 18px        |
 * | Captions, meta, list items             | `text-sm`         | 14px             |
 * | Kicker above a heading                 | `eyebrowClassName`| 12px mono        |
 *
 * The one rule a block needs: inside a Section, the opener (Standard heading,
 * Heading offset) is `text-heading`; every other block's heading is
 * `text-subheading`.
 */

/**
 * The kicker above a heading, in every block. Style only: the gap to the
 * heading belongs to the `text-stack` utility (see `globals.css`), so a call
 * site sets this class and no margin of its own. Copy keeps the case the
 * editor typed.
 */
export const eyebrowClassName = 'font-mono text-xs/none font-medium'

/** Image and figure captions. */
export const captionClassName = 'text-sm text-muted-foreground'

/**
 * Headings inside a reading column (Story beats, a Prose Standard heading),
 * the same ladder Rich text's prose headings use (`components/RichText`), so
 * an opener, its beats and an authored passage read as one outline. The level
 * select is `proseHeadingLevelField` (`./fields.ts`).
 */
export const proseHeadingClassNames = {
  h2: 'text-subheading',
  h3: 'text-lead font-medium',
  h4: 'text-body font-medium',
} as const

export type ProseHeadingLevel = keyof typeof proseHeadingClassNames

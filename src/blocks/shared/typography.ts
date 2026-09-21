/**
 * The kicker above a heading: the media and split block family (full-media,
 * split-content) and the Section heading (Standard) block. Stated once so the
 * same CMS `eyebrow` field never renders in two different treatments.
 *
 * Style only: the gap to the heading belongs to the `text-stack` utility (see
 * `globals.css`), so a call site sets this class and no margin of its own.
 *
 * The legacy Story section blocks (lab, case-study) and Lab facts use a
 * second, larger uppercase-tracked kicker. That is a deliberate second voice,
 * not drift: keep the two apart rather than folding them together here.
 */
export const eyebrowClassName = 'font-mono text-xs/none font-medium'

/**
 * Prose type scale: a heading inside the reading column, measured against the
 * copy it opens (Story beats and Rich text render Tailwind Typography's
 * `prose` base: 16px on a 28px line), not against the page type scale:
 * `text-heading-1` beside 16px body is a page title standing inside an
 * article, and the two read as separate documents rather than one passage.
 *
 * So the levels are plain Tailwind sizes, a 1.25 ladder over that body:
 * 30 / 24 / 20px. Their default line heights (2.25rem, 2rem, 1.75rem) sit on
 * or just above the body's 28px line, so the passage keeps one rhythm, and
 * the two larger steps take `tracking-tight` because the text-box-trimmed
 * cluster otherwise reads loose at those sizes. At h4 the step over the body
 * is only 4px, so weight carries the hierarchy instead, the way the in-prose
 * headings do (`prose-h4:font-medium` in components/RichText).
 *
 * Levels are not restated in `em`: the gaps around the heading already are
 * (`text-stack`), so the whole cluster tracks whichever level the editor
 * picks. The level select is `proseHeadingLevelField` (`./fields.ts`).
 */
export const proseHeadingClassNames = {
  h2: 'text-3xl tracking-tight',
  h3: 'text-2xl tracking-tight',
  h4: 'text-xl font-medium',
} as const

export type ProseHeadingLevel = keyof typeof proseHeadingClassNames

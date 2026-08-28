/**
 * The kicker above a heading in the media and split block family — full-media
 * and split-content today. Stated once so the same CMS `eyebrow` field never
 * renders in two different treatments.
 *
 * Style only: the gap to the heading belongs to the `text-stack` utility (see
 * `globals.css`), so a call site sets this class and no margin of its own.
 *
 * The editorial blocks (rich-transition, feature, lab) use a second, larger
 * uppercase-tracked kicker. That is a deliberate second voice, not drift —
 * keep the two apart rather than folding them together here.
 */
export const eyebrowClassName = 'font-mono text-xs/none font-medium'

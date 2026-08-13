import type { Field, SelectField } from 'payload'

/** Eyebrow + heading pair shared by feature section blocks. */
export const featureHeaderFields: Field[] = [
  {
    name: 'eyebrow',
    type: 'text',
    admin: { description: 'Short kicker above the heading.' },
  },
  { name: 'heading', type: 'text', required: true },
]

/**
 * Canonical case-study sections a feature block can pull rich-text copy from.
 * Kept in sync with the CaseStudy story fields and the case-study block `source`.
 */
export const FEATURE_SOURCE_OPTIONS = [
  'custom',
  'context',
  'challenge',
  'strategy',
  'approach',
  'outcome-summary',
  'learnings',
] as const

/**
 * Select that lets a feature block pull its rich-text body from canonical
 * case-study copy. Only resolves on Work pages (case-study context); elsewhere
 * `custom` is the only meaningful value and the written copy is used as-is.
 */
export const featureSourceField = (name = 'source'): SelectField => ({
  name,
  type: 'select',
  defaultValue: 'custom',
  options: [...FEATURE_SOURCE_OPTIONS],
  admin: {
    description:
      'On Work pages, pull this copy from the canonical case study. "Custom" uses the copy written here; writing copy always overrides the pulled source.',
  },
})

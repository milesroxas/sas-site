import type { Field, SelectField } from 'payload'
import { STORY_SOURCE_OPTIONS } from '@/collections/story/narrative'

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
 * Select that lets a feature block pull its rich-text body from canonical
 * story copy. Only resolves on pages that present a story record (Work and Lab
 * Pages); elsewhere `custom` is the only meaningful value and the written copy
 * is used as-is.
 */
export const featureSourceField = (name = 'source'): SelectField => ({
  name,
  type: 'select',
  defaultValue: 'custom',
  options: [...STORY_SOURCE_OPTIONS],
  admin: {
    description:
      'On Work and Lab pages, pull this copy from the canonical story. "Custom" uses the copy written here; writing copy always overrides the pulled source.',
  },
})

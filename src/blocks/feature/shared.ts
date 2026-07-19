import type { Field } from 'payload'

/** Eyebrow + heading pair shared by feature section blocks. */
export const featureHeaderFields: Field[] = [
  {
    name: 'eyebrow',
    type: 'text',
    admin: { description: 'Short kicker above the heading.' },
  },
  { name: 'heading', type: 'text', required: true },
]

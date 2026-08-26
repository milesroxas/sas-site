import type { DataFromGlobalSlug } from 'payload'

/**
 * Fallback content for the Home global: rendered when the global has no hero
 * title and no layout blocks (fresh database, or content cleared in the admin),
 * so the homepage is never blank.
 */
export const homeStatic = {
  _status: 'published',
  hero: {
    type: 'left',
    title: 'Make it make sense',
    description:
      'We bring clarity, character, and creative momentum to businesses with complex offerings, niche audiences, and more to say than their current brand can express.',
  },
  meta: {
    description:
      'We bring clarity, character, and creative momentum to businesses with complex offerings and niche audiences.',
    title: 'Suits & Sandals',
  },
  title: 'Home',
  layout: [],
} as Omit<DataFromGlobalSlug<'home'>, 'id'>

import type { DataFromGlobalSlug } from 'payload'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic = {
  _status: 'published',
  hero: {
    type: 'left',
    title: 'Make it make sense',
    description:
      'We bring clarity, character, and creative momentum to businesses with complex offerings, niche audiences, and more to say than their current brand can express.',
  },
  meta: {
    description: 'An open-source website built with Payload and Next.js.',
    title: 'Payload Website Template',
  },
  title: 'Home',
  layout: [],
} as Omit<DataFromGlobalSlug<'home'>, 'id'>

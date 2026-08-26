import { taxonomyCollection } from './taxonomy'

export const Platforms = taxonomyCollection({
  slug: 'platforms',
  description:
    'Shared vocabulary of platforms and products work is delivered on (e.g. Webflow, Shopify, Figma). Projects link to these — add new platforms deliberately and reuse existing ones instead of creating near-duplicates.',
  nameDescription: 'Public platform name, e.g. "Webflow". Use official product spelling.',
  termDescription: 'Optional. What this platform is and when we reach for it. May appear publicly.',
})

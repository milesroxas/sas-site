import type { Block } from 'payload'

export const NewsletterSignup: Block = {
  slug: 'newsletterSignup',
  interfaceName: 'NewsletterSignupBlock',
  labels: { singular: 'Newsletter signup', plural: 'Newsletter signups' },
  fields: [
    { name: 'eyebrow', type: 'text', defaultValue: 'Newsletter' },
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Notes on clarity, trust, and momentum',
    },
    {
      name: 'body',
      type: 'textarea',
      defaultValue:
        'Occasional letters from the studio on making complex organizations make sense. No noise — unsubscribe anytime.',
    },
    { name: 'buttonLabel', type: 'text', required: true, defaultValue: 'Subscribe' },
    {
      name: 'audience',
      type: 'relationship',
      relationTo: 'audiences',
      required: true,
      filterOptions: { allowPublicSignup: { equals: true } },
      admin: {
        description:
          'Signups join this audience (after confirming their email). Only audiences with "Allow public signup" enabled appear here.',
      },
    },
  ],
}

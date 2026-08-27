import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'

import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { linkGroup } from '@/fields/linkGroup'

export const TestimonialsMarquee: Block = {
  slug: 'testimonialsMarquee',
  admin: { group: BLOCK_GROUPS.interactive },
  interfaceName: 'TestimonialsMarqueeBlock',
  labels: { singular: 'Testimonials marquee', plural: 'Testimonials marquees' },
  fields: [
    {
      name: 'richText',
      type: 'richText',
      label: 'Description',
      admin: {
        description:
          'Renders in muted ink. Bold a word or phrase to emphasize it — emphasized text renders in foreground ink.',
      },
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: { maxRows: 2 },
    }),
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      required: true,
      minRows: 1,
      filterOptions: { approvalStatus: { equals: 'approved-public' } },
      admin: {
        description:
          'Cards loop through these in order. Only published, publicly approved testimonials render.',
      },
    },
    themeField(),
  ],
}

import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { link } from '@/fields/link'
import { linkGroup } from '@/fields/linkGroup'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: { group: 'Website' },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'location',
      type: 'text',
      required: true,
      defaultValue: 'Brooklyn, NY / Philadelphia, PA',
      admin: {
        description: 'Shown on the left side of the site footer, rendered in uppercase.',
      },
    },
    link({
      appearances: false,
      overrides: {
        name: 'getInTouch',
        label: 'Get in touch link',
        admin: {
          description: 'Centered call-to-action in the site footer.',
        },
      },
    }),
    {
      name: 'closing',
      type: 'group',
      label: 'Closing section',
      admin: {
        description:
          'Full-screen media band above the footer bar on Home, Pages and the Posts index.',
      },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          admin: { description: 'Short kicker above the heading, e.g. “Ready to start?”' },
        },
        {
          name: 'heading',
          type: 'text',
          admin: { description: 'Closing statement over the background media.' },
        },
        linkGroup({
          overrides: {
            maxRows: 2,
            admin: {
              description: 'Call-to-action buttons under the heading, up to two.',
              initCollapsed: true,
            },
          },
        }),
        {
          name: 'ask',
          type: 'group',
          label: 'Ask panel',
          admin: {
            description: 'Intro copy above the “Ask anything” composer in the right-hand panel.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: { description: 'Panel lead-in, e.g. “A homepage can only tell you so much…”' },
            },
            {
              name: 'body',
              type: 'textarea',
              admin: { description: 'Supporting copy between the lead-in and the composer.' },
            },
          ],
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Background image or video. Optional — without one the band renders on the plain dark surface.',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}

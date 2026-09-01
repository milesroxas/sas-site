import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { closingContentFields } from '@/fields/closing'
import { link } from '@/fields/link'
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
          'Default full-screen band above the footer bar. Home, Pages, Posts, Work, Audience, and Expertise inherit this unless a page hides or overrides it.',
      },
      fields: closingContentFields(),
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}

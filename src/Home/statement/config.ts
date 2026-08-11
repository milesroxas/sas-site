import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Field } from 'payload'

export const homeStatement: Field = {
  name: 'statement',
  type: 'group',
  interfaceName: 'HomeStatement',
  admin: {
    description: 'Large statement band rendered after the hero.',
  },
  fields: [
    {
      name: 'hidden',
      type: 'checkbox',
      label: 'Hide statement section',
      defaultValue: false,
      admin: {
        description: 'Hide the statement band on the homepage without deleting its content.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Statement',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      admin: {
        description:
          'Renders in muted ink. Bold a word or phrase to emphasize it — emphasized text renders in foreground ink.',
      },
    },
  ],
}

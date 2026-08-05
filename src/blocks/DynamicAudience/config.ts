import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'

/**
 * Headline with an inline audience dropdown. Selecting an option swaps the
 * intro, item list, and 4:5 media (image or video) for that audience.
 */
export const DynamicAudience: Block = {
  slug: 'dynamicAudience',
  // Per-parent table name: reused on Pages and Home.
  dbName: ({ tableName }) => `${tableName}_dyn_aud`,
  interfaceName: 'DynamicAudienceBlock',
  labels: { singular: 'Dynamic audience', plural: 'Dynamic audiences' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'How we help',
      admin: { description: 'Static text before the audience dropdown.' },
    },
    {
      name: 'audiences',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Audience', plural: 'Audiences' },
      admin: {
        initCollapsed: true,
        description:
          'Each row is a dropdown option. Selecting it swaps the subheading, intro, list, and media.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Dropdown label',
          required: true,
          admin: { description: 'Shown in the dropdown (e.g. teams, leaders).' },
        },
        {
          name: 'subheading',
          type: 'text',
          required: true,
          admin: { description: 'Continues the headline after the dropdown for this audience.' },
        },
        {
          name: 'intro',
          type: 'textarea',
          required: true,
          admin: { description: 'Lead paragraph for this audience.' },
        },
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Item', plural: 'Items' },
          fields: [{ name: 'text', type: 'text', required: true }],
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Image or video for this audience. Cropped to 4:5.',
          },
        },
      ],
    },
    themeField(),
  ],
}

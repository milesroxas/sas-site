import type { Block } from 'payload'

export const FeatureTabs: Block = {
  slug: 'featureTabs',
  interfaceName: 'FeatureTabsBlock',
  labels: { singular: 'Feature: tabs', plural: 'Feature: tabs' },
  fields: [
    {
      name: 'tabs',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 4,
      labels: { singular: 'Tab', plural: 'Tabs' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', label: 'Tab label', required: true },
        {
          name: 'heading',
          type: 'text',
          required: true,
          admin: { description: 'Lead statement for this tab.' },
        },
        { name: 'description', type: 'textarea', required: true },
        {
          name: 'subheading',
          type: 'text',
          label: 'List heading',
          defaultValue: 'Included',
        },
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Item', plural: 'Items' },
          fields: [{ name: 'text', type: 'text', required: true }],
        },
        { name: 'media', type: 'upload', relationTo: 'media' },
        {
          name: 'caption',
          type: 'textarea',
          label: 'Media callout',
          admin: { description: 'Short note shown as a card over the media.' },
        },
      ],
    },
  ],
}

import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'

export const AudienceTabs: Block = {
  slug: 'audienceTabs',
  // Per-parent table name: reused on Pages, Home, work, expertise, audience.
  dbName: ({ tableName }) => `${tableName}_aud_tabs`,
  interfaceName: 'AudienceTabsBlock',
  labels: { singular: 'Audience tabs', plural: 'Audience tabs' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue:
        'Different roles see different parts of the problem. We help bring the whole picture into focus.',
      admin: { description: 'Centered statement above the tab chips.' },
    },
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
          name: 'intro',
          type: 'textarea',
          required: true,
          admin: { description: 'Lead statement for this tab.' },
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
          filterOptions: caseStudyScopedMediaFilter,
        },
      ],
    },
    browseAllMediaField(),
    { ...themeField(), defaultValue: 'dark' },
  ],
}

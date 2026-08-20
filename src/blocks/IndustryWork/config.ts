import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Full-screen work spotlight with an inline industry dropdown. Selecting an
 * industry swaps the sentence and the featured work entry — title, link,
 * media, and the client/capability details pulled from the work page's
 * case study.
 */
export const IndustryWork: Block = {
  slug: 'industryWork',
  admin: { group: BLOCK_GROUPS.interactive },
  // Per-parent table name: reused on Pages, Home, and Work Pages.
  dbName: ({ tableName }) => `${tableName}_ind_work`,
  interfaceName: 'IndustryWorkBlock',
  labels: { singular: 'Industry work', plural: 'Industry work' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Our work in',
      admin: { description: 'Static text before the industry dropdown.' },
    },
    {
      name: 'industries',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Industry', plural: 'Industries' },
      admin: {
        initCollapsed: true,
        description:
          'Each row is a dropdown option: an industry, the sentence continuing the headline, and the work entry it features.',
      },
      fields: [
        {
          name: 'industry',
          type: 'relationship',
          relationTo: 'industries',
          required: true,
          admin: { description: 'Shown in the dropdown by name.' },
        },
        {
          name: 'subheading',
          type: 'text',
          label: 'Headline continuation',
          required: true,
          admin: {
            description:
              'First line: continues the headline inline after the dropdown for this industry.',
          },
        },
        {
          name: 'secondLine',
          type: 'text',
          label: 'Headline second line',
          admin: {
            description:
              'Second line: renders below the first. Leave empty for a one-line headline.',
          },
        },
        {
          name: 'work',
          type: 'relationship',
          relationTo: 'work-pages',
          required: true,
          filterOptions: ({ siblingData }) => {
            const industry = (siblingData as { industry?: number | { id: number } | null })
              ?.industry
            const industryId = typeof industry === 'object' ? industry?.id : industry
            if (!industryId) return true
            return { 'caseStudy.project.industries': { in: [industryId] } }
          },
          admin: {
            description:
              'Work page featured for this industry (list narrows to that industry once one is picked). Title, media, client, and capabilities come from it.',
          },
        },
      ],
    },
    { ...themeField(), defaultValue: 'dark' },
  ],
}

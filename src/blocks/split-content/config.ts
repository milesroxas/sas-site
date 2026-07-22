import type { Block, SelectField } from 'payload'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'

const themeField: SelectField = {
  name: 'theme',
  type: 'select',
  defaultValue: 'light',
  options: ['light', 'dark', 'neutral', 'brand'],
}

/**
 * Split layout: a narrow text column beside a large image, with the image
 * arranged on the left or right. Self-contained by default (authors the body
 * inline), so it can be dropped into any collection's `blocks` field.
 *
 * On Work Pages the `source` select can pull canonical Case Study story
 * content instead; on collections without a related study it resolves to the
 * inline `body`, so the block degrades gracefully.
 */
export const SplitContentNarrow: Block = {
  slug: 'splitContentNarrow',
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_split_narrow`,
  interfaceName: 'SplitContentNarrowBlock',
  labels: { singular: 'Split content (narrow)', plural: 'Split content (narrow)' },
  fields: [
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'custom',
      options: [
        'custom',
        'context',
        'challenge',
        'strategy',
        'approach',
        'outcome-summary',
        'learnings',
      ],
      admin: {
        description:
          'Choose which content feeds this block. "Custom" uses the body below; the others pull canonical Case Study story content (Work Pages only).',
      },
    },
    { name: 'eyebrow', type: 'text', admin: { description: 'Short kicker above the text.' } },
    { name: 'heading', type: 'text' },
    {
      name: 'body',
      type: 'richText',
      admin: {
        description:
          'Shown when source is "Custom", or as a Work Page override for canonical content.',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: caseStudyScopedMediaFilter,
    },
    browseAllMediaField(),
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: ['left', 'right'],
      admin: { description: 'Arrange the image on the left or the right of the text.' },
    },
    themeField,
  ],
}

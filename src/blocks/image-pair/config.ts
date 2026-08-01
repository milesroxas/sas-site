import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'

/**
 * Two images side by side — a 4:5 portrait beside a 16:10 landscape on a 1:2
 * column split, which lands both at the same rendered height. Text sits under
 * one of the images and is sized to that column: compact under the portrait,
 * large under the landscape.
 *
 * Self-contained by default (authors the body inline), so it can be dropped
 * into any collection's `blocks` field. On Work Pages the `source` select can
 * pull canonical Case Study story content instead.
 */
export const ImagePair: Block = {
  slug: 'imagePair',
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_image_pair`,
  interfaceName: 'ImagePairBlock',
  labels: { singular: 'Image pair', plural: 'Image pairs' },
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
      name: 'portraitMedia',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Cropped to 4:5.' },
      filterOptions: caseStudyScopedMediaFilter,
    },
    {
      name: 'landscapeMedia',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Cropped to 16:10.' },
      filterOptions: caseStudyScopedMediaFilter,
    },
    browseAllMediaField(),
    {
      name: 'portraitPosition',
      type: 'select',
      defaultValue: 'left',
      options: ['left', 'right'],
      admin: {
        description:
          'Arrange the portrait on the left or the right; the landscape fills the other column. On small screens the left image stacks first.',
      },
    },
    {
      name: 'textPosition',
      type: 'select',
      defaultValue: 'under-portrait',
      options: ['under-portrait', 'under-landscape'],
      admin: {
        description:
          'Which image the text sits under. Under the portrait it stays compact; under the landscape it runs larger and wider.',
      },
    },
    themeField(),
  ],
}

import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'

/**
 * Split layout on an even grid: media fills one half, the content column the
 * other (the wide sibling of Split narrow, whose text column is fixed and
 * compact). `layout` arranges the media on the left or the right from `md`;
 * below that the media always stacks first.
 *
 * Self-contained by default (authors the body inline), so it can be dropped
 * into any collection's `blocks` field. On Work Pages the `source` select can
 * pull canonical Case Study story content instead.
 */
export const MediaContentSplit: Block = {
  slug: 'mediaContentSplit',
  admin: { group: BLOCK_GROUPS.mediaContent },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_media_split`,
  interfaceName: 'MediaContentSplitBlock',
  labels: { singular: 'Split', plural: 'Splits' },
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
    { name: 'eyebrow', type: 'text', admin: { description: 'Short kicker above the heading.' } },
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
      name: 'layout',
      type: 'select',
      label: 'Layout',
      defaultValue: 'left',
      options: ['left', 'right'],
      admin: {
        description: 'Arrange the media on the left or the right of the content.',
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: '16-9',
      options: [
        { label: '16:9', value: '16-9' },
        { label: '3:2', value: '3-2' },
        { label: '21:9', value: '21-9' },
      ],
      admin: { description: 'Crop for the media column.' },
    },
    themeField(),
  ],
}

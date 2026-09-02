import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'

/**
 * A large 5:4 image beside a narrower column holding a 3:2 image with caption
 * copy beneath it. The caption column splits into two equal rows so the copy
 * always starts at the section's vertical midpoint — the offset the block is
 * named for — and on large screens a trailing quarter column holds the caption
 * side off the page edge while the section itself runs to it.
 *
 * Self-contained by default (authors the body inline), so it can be dropped
 * into any collection's `blocks` field. On Work Pages the `source` select can
 * pull canonical Case Study story content instead.
 */
export const SplitImageOffset: Block = {
  slug: 'splitImageOffset',
  admin: { group: BLOCK_GROUPS.mediaContent },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_split_offset`,
  interfaceName: 'SplitImageOffsetBlock',
  labels: { singular: 'Pair offset', plural: 'Pair offsets' },
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
      name: 'largeMedia',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Cropped to 5:4.' },
      filterOptions: caseStudyScopedMediaFilter,
    },
    {
      name: 'smallMedia',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Cropped to 3:2. Shown above the caption.' },
      filterOptions: caseStudyScopedMediaFilter,
    },
    browseAllMediaField(),
    {
      name: 'captionPosition',
      type: 'select',
      label: 'Layout',
      defaultValue: 'left',
      options: ['left', 'right'],
      admin: {
        description:
          'Place the small image and caption on the left or the right of the large image.',
      },
    },
    themeField(),
  ],
}

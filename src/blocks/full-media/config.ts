import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'

/**
 * Media over a two-column content row (eyebrow + heading beside the body).
 * `width` is full-bleed by default (16:9 below `md`, 21:9 from `md` up) or
 * contained in the page column at an editor-chosen aspect ratio. `contentPosition`
 * arranges the content row on the left or right from `lg`, and below that the
 * row always sits left with a trailing half-column offset.
 *
 * Self-contained by default (authors the body inline), so it can be dropped
 * into any collection's `blocks` field. On Work Pages the `source` select can
 * pull canonical Case Study story content instead.
 */
export const FullMedia: Block = {
  slug: 'fullMedia',
  admin: { group: BLOCK_GROUPS.media },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_full_media`,
  interfaceName: 'FullMediaBlock',
  labels: { singular: 'Full media', plural: 'Full media' },
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
      admin: {
        description:
          'Full width crops to 16:9 on small screens and 21:9 from md up. Contained uses the aspect ratio below.',
      },
      filterOptions: caseStudyScopedMediaFilter,
    },
    browseAllMediaField(),
    {
      name: 'width',
      type: 'select',
      defaultValue: 'full-width',
      options: [
        { label: 'Contained', value: 'contained' },
        { label: 'Full width', value: 'full-width' },
      ],
      admin: {
        description:
          'Contained keeps the media in the page column. Full width bleeds edge to edge.',
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
      admin: {
        condition: (_, siblingData) => siblingData?.width === 'contained',
        description: 'Crop for contained media.',
      },
    },
    {
      name: 'contentPosition',
      type: 'select',
      defaultValue: 'left',
      options: ['left', 'right'],
      admin: {
        description:
          'Arrange the content row on the left or the right below the media (desktop only; smaller screens always sit left).',
      },
    },
    themeField(),
  ],
}

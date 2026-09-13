import type { Block } from 'payload'
import { storySourceField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { publicApprovedMediaWhere } from '@/fields/caseStudyScopedMedia'
import { contentLexical } from '@/fields/contentLexical'

/**
 * Split layout: a narrow text column beside a large image, with the image
 * arranged on the left or right. Self-contained by default (authors the body
 * inline), so it can be dropped into any collection's `blocks` field. The
 * body is written in the content-column editor (`contentLexical`).
 *
 * On Work and Lab Pages the `source` select can pull canonical story content
 * instead; on collections without a related story record it resolves to the
 * inline `body`, so the block degrades gracefully.
 */
export const SplitContentNarrow: Block = {
  slug: 'splitContentNarrow',
  admin: { group: BLOCK_GROUPS.mediaContent },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_split_narrow`,
  interfaceName: 'SplitContentNarrowBlock',
  labels: { singular: 'Split narrow', plural: 'Split narrow' },
  fields: [
    storySourceField(),
    { name: 'eyebrow', type: 'text', admin: { description: 'Short kicker above the text.' } },
    { name: 'heading', type: 'text' },
    {
      name: 'body',
      type: 'richText',
      editor: contentLexical,
      admin: {
        description:
          'Shown when source is "Custom", or as a Work or Lab Page override for canonical content.',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: publicApprovedMediaWhere,
    },
    {
      name: 'imagePosition',
      type: 'select',
      label: 'Layout',
      defaultValue: 'left',
      options: ['left', 'right'],
      admin: { description: 'Arrange the image on the left or the right of the text.' },
    },
    themeField(),
  ],
}

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Rich text: one Lexical body on a themed band, set on the composition grid
 * as a reading column (columns 2-4). The editor authors paragraphs plus
 * section headings inline, so a short heading-and-body run needs no second
 * field; the surrounding band comes from `theme` or the parent Section.
 *
 * Sits in the shared Section-nestable run (docs/blocks-reorg-roadmap.md),
 * grouped under Text with the legacy multi-column Content block.
 */
export const RichTextBlock: Block = {
  slug: 'richText',
  admin: { group: BLOCK_GROUPS.text },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_rich_text`,
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Rich text', plural: 'Rich text' },
  fields: [
    {
      name: 'body',
      type: 'richText',
      label: false,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    themeField(),
  ],
}

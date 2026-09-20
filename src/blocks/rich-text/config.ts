import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { YouTube } from '@/blocks/youtube/config'
import { markdownInputFields } from '@/fields/markdownInput'
import { RichTextInsights } from './insights/config'
import { RichTextPillList } from './pill-list/config'

/**
 * Rich text: one Lexical body on a themed band, set on the composition grid
 * as a reading column (columns 3-6). The editor authors paragraphs plus
 * section headings inline, so a short heading-and-body run needs no second
 * field; the surrounding band comes from `theme` or the parent Section.
 * The toolbar's block menu adds components between paragraphs (Insights,
 * Pill list); each is a Lexical block stored in the body, so none needs a
 * table.
 *
 * Sits in the shared Section-nestable run (docs/blocks-reorg-roadmap.md),
 * grouped under Text with the legacy multi-column Content block.
 *
 * Lists and inline code are on because long-form technical copy needs them
 * (docs/figures.md). An agent authors the body as Markdown through the
 * write-only `markdown` field; Lexical stays the only stored form.
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
    ...markdownInputFields('body'),
    {
      name: 'body',
      type: 'richText',
      label: false,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          UnorderedListFeature(),
          OrderedListFeature(),
          InlineCodeFeature(),
          BlocksFeature({ blocks: [RichTextInsights, RichTextPillList, YouTube] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    themeField(),
  ],
}

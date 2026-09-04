import type { Block } from 'payload'
import { insightItemFields } from '@/blocks/insight-list/config'

/**
 * Insights inside Rich text: a numbered run of SVG-marked statements an
 * editor drops between paragraphs from the editor toolbar (Paper: "Section
 * Heading Default", the one-, two- and many-insight frames). Each item is the
 * Insight list item; the run has no heading of its own because the copy
 * around it is the heading.
 *
 * A Lexical block, so it lives in the body JSON: no table, no migration.
 * `title` and `description` reach RAG and llms.txt through the Lexical
 * markdown walker (`lexicalToMarkdown`), which emits any block's `items`.
 */
export const RichTextInsights: Block = {
  slug: 'insights',
  interfaceName: 'RichTextInsightsBlock',
  labels: { singular: 'Insights', plural: 'Insights' },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Insight', plural: 'Insights' },
      fields: insightItemFields,
    },
  ],
}

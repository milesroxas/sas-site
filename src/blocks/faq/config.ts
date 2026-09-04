import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { link } from '@/fields/link'

/**
 * FAQ: a compact two-column accordion of questions under a small heading,
 * with an optional "ask us" link in the header row (Paper: Block=FAQ,
 * Layout=Compact). Items number themselves in reading order and split evenly
 * across the two columns from `md`.
 *
 * Sits in the shared Section-nestable run (docs/blocks-reorg-roadmap.md)
 * under Interactive, beside Carousel. Its heading and eyebrow are the block's
 * own copy, not story copy, so Work Pages offer it plain (no story-beat
 * wrapper), the same way they offer Caption.
 *
 * `question` and `answer` are TEXT_KEYS names, so every item reaches RAG and
 * llms.txt. `prompt` is deliberately not: it is microcopy beside the link
 * ("Did not find your answer?"), not content worth indexing.
 */
export const Faq: Block = {
  slug: 'faq',
  admin: { group: BLOCK_GROUPS.interactive },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_faq`,
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          admin: { width: '33%', description: 'Short kicker above the heading, e.g. "Questions".' },
        },
        { name: 'heading', type: 'text', required: true, admin: { width: '67%' } },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Question', plural: 'Questions' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'question', type: 'text', required: true },
        {
          name: 'answer',
          type: 'richText',
          required: true,
          admin: { description: 'Shown when the question is opened.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Contact link',
      admin: {
        initCollapsed: true,
        description:
          'A prompt and link at the end of the header row for readers whose question is not listed.',
      },
      fields: [
        // Same toggle-plus-link shape as the Content block, so the link's
        // required label never blocks saving a block that has no link.
        { name: 'enableLink', type: 'checkbox', label: 'Show contact link' },
        {
          name: 'prompt',
          type: 'text',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enableLink),
            description: 'Sits beside the link, e.g. "Did not find your answer?"',
          },
        },
        link({
          appearances: false,
          overrides: {
            admin: { condition: (_, siblingData) => Boolean(siblingData?.enableLink) },
          },
        }),
      ],
    },
    themeField(),
  ],
}

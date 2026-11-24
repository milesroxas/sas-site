import type { Block } from 'payload'

/**
 * Pill list inside Rich text: a kicker over a wrapping cloud of short mono
 * labels, dropped between paragraphs from the editor toolbar (Paper: "Chip
 * List"). The pills name things (what the business knows, what a project
 * covered) rather than link anywhere, so each is a label and nothing more.
 *
 * A Lexical block, so it lives in the body JSON: no table, no migration.
 * `eyebrow` and each `label` reach RAG and llms.txt through the Lexical
 * markdown walker (`lexicalToMarkdown`), which emits any block's `items`.
 */
export const RichTextPillList: Block = {
  slug: 'pillList',
  interfaceName: 'RichTextPillListBlock',
  labels: { singular: 'Pill list', plural: 'Pill lists' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'Optional kicker above the pills.' },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Pill', plural: 'Pills' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
  ],
}

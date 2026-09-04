import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { publicApprovedMediaWhere } from '@/fields/caseStudyScopedMedia'

/**
 * Insight list: a heading cluster beside or above a numbered run of short
 * statements, each led by an SVG mark (Paper: "featureStatementGrid v2
 * proposal", both frames). Two arrangements on the composition grid:
 *
 * - `side`: heading in the first two columns, two insights per row beside it
 * - `stacked`: heading across four columns, three insights per row beneath
 *
 * Sits in the shared Section-nestable run (docs/blocks-reorg-roadmap.md)
 * under Lists. Its copy is the block's own, not story copy, so Work Pages
 * offer it plain (no story-beat wrapper), the same way they offer FAQ.
 *
 * `eyebrow`, `heading`, `summary`, `title` and `description` are TEXT_KEYS
 * names, so every insight reaches RAG and llms.txt.
 */
export const InsightList: Block = {
  slug: 'insightList',
  admin: { group: BLOCK_GROUPS.lists },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_insight_list`,
  interfaceName: 'InsightListBlock',
  labels: { singular: 'Insight list', plural: 'Insight lists' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          admin: {
            width: '33%',
            description: 'Short kicker above the heading, e.g. "Where clarity breaks down".',
          },
        },
        { name: 'heading', type: 'text', required: true, admin: { width: '67%' } },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: { description: 'Short supporting line under the heading.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          label: 'Layout',
          defaultValue: 'side',
          options: [
            { label: 'Side by side', value: 'side' },
            { label: 'Stacked', value: 'stacked' },
          ],
          admin: {
            width: '50%',
            description:
              'Side by side keeps the heading beside two insights per row. Stacked sets it above three per row.',
          },
        },
        {
          name: 'markSize',
          type: 'select',
          label: 'Mark size',
          defaultValue: 'medium',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
          admin: { width: '50%', description: 'Size of the SVG mark on every insight.' },
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Insight', plural: 'Insights' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          label: 'Mark',
          // Marks are line art that takes the band's text color, so the picker
          // offers SVGs only; the case-study library scope buys nothing here.
          filterOptions: {
            and: [publicApprovedMediaWhere, { mimeType: { equals: 'image/svg+xml' } }],
          },
          admin: {
            description:
              'An SVG mark. It renders in the text color of the band, so use a single-color line or fill mark.',
          },
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    themeField(),
  ],
}

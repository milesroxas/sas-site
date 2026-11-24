import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { publicApprovedMediaWhere } from '@/fields/caseStudyScopedMedia'
import { link } from '@/fields/link'

/**
 * Poster list: a heading cluster and a draggable rail of poster-style items,
 * each a 4:5 picture with its title under it; hovering (or keyboard
 * focus) frosts the bottom of the picture and reveals the description.
 *
 * Two layouts: `stacked` sets the copy above the rail (two rows), `row` sets
 * it in the narrow column beside the rail (one row). Two item sources
 * (`itemSource`, not `source`: that name means story copy to Lab and Work
 * mapping): `static`
 * items the editor writes, or `collection`, published Work pages flattened by
 * the featured-work resolver (picked here, else the most recent).
 *
 * Decided from a prototype round (the Drift direction); see
 * docs/blocks-reorg-roadmap.md for the decision and what was rejected.
 *
 * `eyebrow`, `heading`, `summary`, `title` and `description` are TEXT_KEYS
 * names, so every item reaches RAG and llms.txt.
 */
export const PosterList: Block = {
  slug: 'posterList',
  admin: { group: BLOCK_GROUPS.lists },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_poster_list`,
  interfaceName: 'PosterListBlock',
  labels: { singular: 'Poster list', plural: 'Poster lists' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          admin: { width: '33%', description: 'Short kicker above the heading.' },
        },
        { name: 'heading', type: 'text', required: true, admin: { width: '67%' } },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description:
          'Supporting copy beside or under the heading. Leave a blank line between paragraphs.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'stacked',
          options: [
            { label: 'Two rows', value: 'stacked' },
            { label: 'Single row', value: 'row' },
          ],
          admin: {
            width: '50%',
            description:
              'Two rows sets the heading above the list. Single row sets it beside the list in a narrow column.',
          },
        },
        {
          name: 'itemSource',
          label: 'Items',
          type: 'select',
          defaultValue: 'static',
          options: [
            { label: 'Items written here', value: 'static' },
            { label: 'Work pages', value: 'collection' },
          ],
          admin: {
            width: '50%',
            description: 'Write the items here, or list published Work pages.',
          },
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Item', plural: 'Items' },
      admin: {
        initCollapsed: true,
        condition: (_, siblingData) => siblingData?.itemSource !== 'collection',
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: publicApprovedMediaWhere,
          admin: { description: 'Shown as a 4:5 poster, cropped to fill.' },
        },
        { name: 'title', type: 'text', required: true },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          admin: { description: 'Revealed over the picture on hover. Keep it to a few lines.' },
        },
        { name: 'enableLink', type: 'checkbox', label: 'Link this item' },
        link({
          appearances: false,
          disableLabel: true,
          overrides: {
            admin: { condition: (_, siblingData) => Boolean(siblingData?.enableLink) },
          },
        }),
      ],
    },
    {
      name: 'workPages',
      type: 'relationship',
      relationTo: 'work-pages',
      hasMany: true,
      label: 'Work pages',
      admin: {
        condition: (_, siblingData) => siblingData?.itemSource === 'collection',
        description: 'In this order. Leave empty to show the most recently published Work pages.',
      },
    },
    themeField(),
  ],
}

import type { Block } from 'payload'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { linkGroup } from '@/fields/linkGroup'

/**
 * CTA band: a call to action on the always-dark panel with the studio's own
 * light leak running on it. The actions flare the leak, so the band answers
 * the pointer; with no GPU or under reduced motion it is a plain dark panel.
 *
 * Sits in the shared Section-nestable run (docs/blocks-reorg-roadmap.md)
 * under Forms & CTAs, so every Section offers it. At the top level it is a
 * full-bleed band; nested in a Section it is a rounded panel inside the
 * Section's band, which paints the band once.
 *
 * `eyebrow`, `heading`, `body` and `caption` are TEXT_KEYS names, so the copy
 * reaches RAG and llms.txt. The links carry no story copy, so Work and Lab
 * Pages offer the block plain.
 *
 * Decided from the /proto/cta-band exploration (2026-11-22): this direction
 * ("Darkroom") over a typographic ruled band and a whole-band press fill.
 */
export const CtaBand: Block = {
  slug: 'ctaBand',
  admin: { group: BLOCK_GROUPS.forms },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_cta_band`,
  interfaceName: 'CtaBandBlock',
  labels: { singular: 'CTA band', plural: 'CTA bands' },
  fields: [
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full', value: 'full' },
        { label: 'Compact', value: 'compact' },
      ],
      admin: {
        description:
          'Full: kicker, heading, body and actions on a tall band. Compact: one row, the heading beside the actions, for a quieter prompt mid page.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          admin: {
            width: '33%',
            description: 'Short kicker above the heading, e.g. "Start a project". Full only.',
            condition: (_, siblingData) => siblingData?.layout !== 'compact',
          },
        },
        { name: 'heading', type: 'text', required: true, admin: { width: '67%' } },
      ],
    },
    {
      name: 'body',
      type: 'textarea',
      admin: {
        description: 'A sentence or two under the heading. Full only.',
        condition: (_, siblingData) => siblingData?.layout !== 'compact',
      },
    },
    linkGroup({
      appearances: false,
      overrides: {
        label: 'Actions',
        minRows: 1,
        maxRows: 2,
        admin: {
          description:
            'The first action is the solid button, the second the frosted one beside it.',
        },
      },
    }),
    {
      name: 'caption',
      type: 'text',
      label: 'Corner note',
      admin: {
        description:
          'Optional small mono line in the band\'s lower corner, e.g. "Light leak, rendering live". Full only.',
        condition: (_, siblingData) => siblingData?.layout !== 'compact',
      },
    },
  ],
}

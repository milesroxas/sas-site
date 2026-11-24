import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'

/**
 * Quote banner: client testimonials on the composition grid, flush with the
 * page column. One testimonial is a single quote; two or more add a row of
 * client names under it to switch between them (on a phone, the quotes also
 * swipe). Decided from a prototype round (the Flush direction); see
 * docs/blocks-reorg-roadmap.md for the decision and what was rejected.
 *
 * Quotes come from the Testimonials collection, never inline copy, so the
 * approval gate (`isPublicTestimonial`) holds wherever the block sits.
 * `eyebrow` is a TEXT_KEYS name; the quotes reach RAG through their own
 * collection.
 */
export const QuoteBanner: Block = {
  slug: 'quoteBanner',
  admin: { group: BLOCK_GROUPS.statements },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_quote_banner`,
  interfaceName: 'QuoteBannerBlock',
  labels: { singular: 'Quote banner', plural: 'Quote banners' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'Short kicker above the quote, such as "What clients say".' },
    },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      required: true,
      minRows: 1,
      filterOptions: { approvalStatus: { equals: 'approved-public' } },
      admin: {
        description:
          'One testimonial shows a single quote. Two or more add a row of client names under it to switch between them, in this order. Only published, publicly approved testimonials render.',
      },
    },
    themeField(),
  ],
}

import type { Block, Field } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/** Optional hex colour; empty falls through to the effect's default palette. */
const moodColorField = (name: string, label: string, description: string): Field => ({
  name,
  type: 'text',
  label,
  admin: { description: `${description} Hex, e.g. #1f4a40. Leave empty for the default.` },
  validate: (value: string | null | undefined) =>
    !value || HEX_COLOR.test(value.trim()) || 'Enter a hex colour like #1f4a40.',
})

/**
 * Full-screen scroll gallery: media planes staggered into depth, the camera
 * dollying through them as the visitor scrolls, and a mood background that
 * blends each item's palette as it comes into focus. The block owns a pinned
 * full-viewport shell — one screenful of scroll per item. Collection-agnostic:
 * on a Work Page the media pickers default to the case study's asset
 * libraries; elsewhere they browse the public media library.
 */
export const ScrollGallery: Block = {
  slug: 'scrollGallery',
  admin: { group: BLOCK_GROUPS.media },
  // Per-parent table name: reused on Work Pages and Lab Pages.
  dbName: ({ tableName }) => `${tableName}_scroll_gal`,
  interfaceName: 'ScrollGalleryBlock',
  labels: { singular: 'Scroll gallery', plural: 'Scroll galleries' },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'Small label pinned at the top of the gallery. Leave empty to hide.' },
    },
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Statement pinned under the eyebrow. Leave empty to hide.' },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 2,
      labels: { singular: 'Item', plural: 'Items' },
      admin: {
        initCollapsed: true,
        description:
          'Each item is one plane in depth, in order. The caption shown while an item is in focus is the media document’s caption.',
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: caseStudyScopedMediaFilter,
        },
        {
          name: 'mood',
          type: 'group',
          admin: {
            description: 'Background palette while this item is in focus.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                moodColorField('background', 'Background', 'The ground behind the planes.'),
                moodColorField('blob1', 'Glow 1', 'Primary soft glow.'),
                moodColorField('blob2', 'Glow 2', 'Secondary soft glow.'),
              ],
            },
          ],
        },
      ],
    },
    {
      ...browseAllMediaField(),
      admin: {
        ...browseAllMediaField().admin,
        // Only a Work Page scopes its pickers to a case study; elsewhere the
        // pickers already browse the whole public library.
        condition: (data) => Boolean(data?.caseStudy),
      },
    },
    { ...themeField(), defaultValue: 'dark' },
  ],
}

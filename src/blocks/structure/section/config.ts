import type { Block } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { SECTION_CHILDREN_FIELD, SECTION_SPACING_OPTIONS } from './shared'

/**
 * The Section block: the structural wrapper editors add first in the
 * Composition tab, then fill with content blocks. The Section owns the band
 * (surface, band padding, and space between nested blocks) and its children
 * render bare, so the band is painted exactly once.
 *
 * One factory, one slug, one table shape across every collection; only the
 * nested block list and the interface name differ per parent (the same
 * pattern as `withStoryBeatSource`). Sections never nest inside Sections:
 * keep this block out of the `blocks` array passed in.
 */
export const sectionBlock = ({
  blocks,
  interfaceName,
}: {
  blocks: Block[]
  interfaceName: string
}): Block => ({
  slug: 'section',
  admin: { group: BLOCK_GROUPS.structure },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_section`,
  interfaceName,
  labels: { singular: 'Section', plural: 'Sections' },
  fields: [
    {
      name: 'customize',
      type: 'checkbox',
      label: 'Customize section',
      defaultValue: false,
      admin: {
        description:
          'Override the surface, band padding, and space between blocks. Off uses the page surface and default rhythm.',
      },
    },
    {
      type: 'row',
      fields: [
        themeField({
          admin: {
            width: '50%',
            condition: (_, siblingData) => Boolean(siblingData?.customize),
            description:
              'The band this section paints. "Default" follows the visitor\'s light or dark preference; "Inverted" paints the opposite of it, to flip this section against its neighbours.',
          },
        }),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'spacing',
          type: 'select',
          label: 'Band',
          defaultValue: 'default',
          options: [...SECTION_SPACING_OPTIONS],
          admin: {
            width: '50%',
            condition: (_, siblingData) => Boolean(siblingData?.customize),
            description:
              'Top and bottom padding of the section. "None" is for a section whose content owns its shell.',
          },
        },
        {
          name: 'stack',
          type: 'select',
          label: 'Between blocks',
          defaultValue: 'default',
          options: [...SECTION_SPACING_OPTIONS],
          admin: {
            width: '50%',
            condition: (_, siblingData) => Boolean(siblingData?.customize),
            description:
              'Space between nested blocks. Independent of Band. "None" sits them flush.',
          },
        },
      ],
    },
    {
      name: SECTION_CHILDREN_FIELD,
      type: 'blocks',
      labels: { singular: 'Block', plural: 'Blocks' },
      blocks,
      admin: { initCollapsed: true },
    },
  ],
})

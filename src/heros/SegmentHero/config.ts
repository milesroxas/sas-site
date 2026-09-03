import type { GroupField } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

/**
 * The opening of a segment page (Who We Help, Expertise). One hero, no type
 * switch: a dark band with the media as its backdrop, eyebrow and title on
 * the left, the supporting paragraph anchored bottom-right. Mirrors the work
 * page hero's admin shape (Content, then Media & layout) so editors meet the
 * same controls on every website page collection.
 *
 * Field names match the retired multi-type hero (`eyebrow`, `title`,
 * `description`, `links`, `media`) so existing rows carry over untouched;
 * `lead` is the one addition (the statement above the paragraph).
 */
export const segmentHero: GroupField = {
  name: 'hero',
  type: 'group',
  interfaceName: 'SegmentHero',
  label: false,
  fields: [
    {
      type: 'collapsible',
      label: 'Content',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          admin: { description: 'Small label above the title, e.g. "Who We Help".' },
        },
        { name: 'title', type: 'text', required: true },
        {
          name: 'lead',
          type: 'textarea',
          admin: {
            description:
              'One-line statement above the supporting paragraph, bottom right of the hero.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'Supporting paragraph, anchored to the bottom right of the hero.' },
        },
        linkGroup({
          appearances: false,
          overrides: {
            maxRows: 2,
            admin: {
              initCollapsed: true,
              description:
                'The first link renders as the primary action, the second as a text link.',
            },
          },
        }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Media & layout',
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: { usageStatus: { equals: 'public-approved' } },
          admin: { description: 'Fills the band behind the copy.' },
        },
      ],
    },
  ],
}

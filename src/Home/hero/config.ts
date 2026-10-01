import type { Field } from 'payload'
import { visualSlotFields } from '@/fields/visual'

export const homeHero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'left',
      label: 'Variant',
      options: [
        {
          label: 'Left',
          value: 'left',
        },
        {
          label: 'Center',
          value: 'center',
        },
      ],
      required: true,
      admin: {
        description: 'Left stacks the statement and description; Center centers the statement.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Statement',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Supporting paragraph shown under the statement (left) or in the footer (center).',
      },
    },
    ...visualSlotFields(
      {
        name: 'media',
        type: 'upload',
        relationTo: 'media',
        label: 'Background',
      },
      {
        visualTypeDescription:
          'Leave empty to use the background upload. Streak Field renders a code-defined look behind the statement; an upload left in place is kept but not shown.',
      },
    ),
    {
      name: 'featuredPage',
      type: 'relationship',
      // Each collection here needs a resolver in ./featured.ts; the generated
      // union makes a missing one a type error.
      relationTo: ['posts', 'work-pages', 'lab-pages'],
      label: 'Featured card',
      admin: {
        description:
          'Optional card anchored in the hero footer: an insight, a work page, or a lab page. Unpublished pages are not shown.',
      },
    },
    {
      name: 'featuredLabel',
      type: 'text',
      admin: {
        description:
          'Small label on the featured card. Leave empty to use the section name: Insights, Work, or Lab.',
        condition: (_, siblingData) => Boolean(siblingData?.featuredPage),
      },
    },
  ],
  label: false,
}

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
      name: 'featuredPost',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        description: 'Optional insight card anchored in the hero footer.',
      },
    },
    {
      name: 'featuredLabel',
      type: 'text',
      defaultValue: 'Insights',
      admin: {
        description: 'Small label on the featured card, e.g. Insights.',
        condition: (_, siblingData) => Boolean(siblingData?.featuredPost),
      },
    },
  ],
  label: false,
}

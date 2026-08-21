import type { Block } from 'payload'

export const Carousel: Block = {
  slug: 'carousel',
  interfaceName: 'CarouselBlock',
  labels: { singular: 'Carousel', plural: 'Carousels' },
  fields: [
    {
      name: 'slides',
      type: 'array',
      required: true,
      minRows: 2,
      labels: { singular: 'Slide', plural: 'Slides' },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Optional. Renders below the slide.',
          },
        },
      ],
    },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'contained',
      options: [
        { label: 'Contained', value: 'contained' },
        { label: 'Full width', value: 'full-width' },
      ],
      admin: {
        description: 'Full width runs edge to edge of the browser window.',
      },
    },
    {
      name: 'showArrows',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show arrows',
      admin: {
        description:
          'Previous/next buttons. Contained places them beside the slides; full width overlays them on the slides.',
      },
    },
    {
      name: 'slideSize',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full width', value: 'full' },
        { label: 'Half', value: 'half' },
        { label: 'One third', value: 'third' },
      ],
      admin: {
        description: 'Slides visible at once on desktop; mobile always shows one.',
      },
    },
  ],
}

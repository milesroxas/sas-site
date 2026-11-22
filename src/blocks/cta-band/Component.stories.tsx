import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CtaBandBlock } from './Component'

const meta = {
  title: 'Blocks/Forms & CTAs/CTA band',
  component: CtaBandBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'ctaBand',
    layout: 'full',
    eyebrow: 'Start a project',
    heading: 'Tell us what you are trying to explain.',
    body: 'Send a few lines about the offering and who has to understand it. We reply within 3 business days.',
    links: [
      { id: 'primary', link: { type: 'custom', url: '/contact', label: 'Start a project' } },
      { id: 'secondary', link: { type: 'custom', url: '/ask', label: 'Ask us a question' } },
    ],
    caption: 'Light leak, rendering live',
  },
} satisfies Meta<typeof CtaBandBlock>

export default meta

type Story = StoryObj<typeof meta>

/** Top level: the full-bleed dark band with the leak behind the copy. */
export const Full: Story = {}

/** One row for a quieter prompt mid page: heading beside the actions. */
export const Compact: Story = {
  args: { layout: 'compact' },
}

/** Worst real copy: a heading that runs to four lines and a long first action. */
export const LongCopy: Story = {
  args: {
    heading:
      'Tell us what your team is trying to explain to investors, enterprise buyers and the engineers you are hiring next.',
    body: 'Send a few lines about the offering, the audiences that have to understand it, and the decision you need them to make by the end of the quarter. We reply within 3 business days.',
    links: [
      {
        id: 'primary',
        link: { type: 'custom', url: '/contact', label: 'Start a project with our strategy team' },
      },
      { id: 'secondary', link: { type: 'custom', url: '/ask', label: 'Ask us a question' } },
    ],
  },
}

/**
 * Nested in a Section (`bare`): the same panel as a rounded slab inside the
 * Section's band. The padding stands in for the band the Section paints.
 */
export const InSection: Story = {
  args: { bare: true },
  decorators: [
    (Story) => (
      <div className="py-16 md:py-24">
        <Story />
      </div>
    ),
  ],
}

export const InSectionCompact: Story = {
  args: { bare: true, layout: 'compact' },
  decorators: InSection.decorators,
}

/** One action: the solid button alone. */
export const SingleAction: Story = {
  args: {
    links: [{ id: 'primary', link: { type: 'custom', url: '/contact', label: 'Start a project' } }],
  },
}

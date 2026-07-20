import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { postFixtures } from '@/blocks/fixtures'
import { Card } from './index'
import { CARD_VARIANTS } from './variants'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  args: {
    doc: postFixtures[0],
    relationTo: 'posts',
    showCategories: true,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [...CARD_VARIANTS],
    },
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

const renderInColumn: Story['render'] = (args) => (
  <div className="w-96">
    <Card {...args} />
  </div>
)

export const Contained: Story = {
  args: { variant: 'contained' },
  render: renderInColumn,
}

export const Open: Story = {
  args: { variant: 'open' },
  render: renderInColumn,
}

export const Overlay: Story = {
  args: { variant: 'overlay' },
  render: renderInColumn,
}

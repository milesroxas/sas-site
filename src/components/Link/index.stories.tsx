import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CMSLink } from './index'

const meta = {
  title: 'Components/CMSLink',
  component: CMSLink,
  parameters: {
    layout: 'centered',
  },
  args: {
    type: 'custom',
    url: '/works',
    label: 'View work',
  },
  argTypes: {
    appearance: {
      control: 'select',
      options: ['inline', 'default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
  },
} satisfies Meta<typeof CMSLink>

export default meta

type Story = StoryObj<typeof meta>

export const Inline: Story = {}

export const ButtonDefault: Story = {
  args: { appearance: 'default' },
}

export const ButtonOutline: Story = {
  args: { appearance: 'outline' },
}

export const NewTab: Story = {
  args: {
    label: 'External link',
    newTab: true,
    url: 'https://suits-sandals.com',
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Container } from './index'

const meta = {
  title: 'Components/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children: (
      <div className="bg-muted py-8 text-center text-sm text-muted-foreground">Section content</div>
    ),
  },
  argTypes: {
    width: {
      control: 'select',
      options: ['default', 'full', 'narrow'],
    },
  },
} satisfies Meta<typeof Container>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { width: 'default' },
}

export const Full: Story = {
  args: { width: 'full' },
}

export const Narrow: Story = {
  args: { width: 'narrow' },
}

export const AllWidths: Story = {
  render: () => (
    <div className="flex flex-col gap-6 bg-background py-12">
      {(
        [
          ['default', 'default — 96rem'],
          ['narrow', 'narrow — 40rem'],
          ['full', 'full — edge to edge'],
        ] as const
      ).map(([width, label]) => (
        <Container key={width} width={width}>
          <div className="border border-border bg-muted py-6 text-center text-sm text-muted-foreground">
            {label}
          </div>
        </Container>
      ))}
    </div>
  ),
}

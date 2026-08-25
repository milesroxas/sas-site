import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { industryWorkPanelsFixture as panels } from '../fixtures'
import { IndustryWorkClient } from './Component.client'

const meta = {
  title: 'Blocks/IndustryWork',
  component: IndustryWorkClient,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    heading: 'Work by industry',
    panels,
    theme: 'dark',
  },
} satisfies Meta<typeof IndustryWorkClient>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LightTheme: Story = {
  args: { theme: 'light' },
}

export const SinglePanel: Story = {
  args: { panels: panels.slice(0, 1) },
}

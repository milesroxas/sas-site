import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import { mediaFixture, videoFixture } from '../fixtures'
import { IndustryWorkClient, type IndustryWorkPanel } from './Component.client'

const workEntry = (id: number, title: string, client: string, media = mediaFixture): WorkEntry => ({
  id,
  href: `/works/${title.toLowerCase().replace(/\s+/g, '-')}`,
  title,
  client,
  industry: null,
  capabilities: ['Brand strategy', 'Web design'],
  media,
})

const panels: IndustryWorkPanel[] = [
  {
    id: 'fintech',
    industry: 'fintech',
    subheading: 'we help platforms explain themselves',
    secondLine: 'so buyers stop needing a sales call.',
    work: workEntry(1, 'Clarity for a payments platform', 'Interchecks'),
  },
  {
    id: 'healthcare',
    industry: 'healthcare',
    subheading: 'we make complex care legible',
    secondLine: null,
    work: workEntry(2, 'A calmer story for a care network', 'Blindcut', videoFixture),
  },
  {
    id: 'logistics',
    industry: 'logistics',
    subheading: 'we turn operations into narrative',
    secondLine: 'from the warehouse to the boardroom.',
    work: workEntry(3, 'Repositioning a freight marketplace', 'Northbeam'),
  },
]

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

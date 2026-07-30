import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import type { LabPage, LabProject } from '@/payload-types'
import { LabPageCard } from './index'

const project = {
  id: 1,
  title: 'Refraction playground',
  kind: 'experiment',
  status: 'active',
  summaries: {
    oneLine: 'An interactive refraction experiment for hero backdrops.',
    short: 'Prototyping a soft-edged refraction lens over image and video media.',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as LabProject

const page = {
  id: 1,
  title: 'Refraction playground',
  slug: 'refraction-playground',
  labProject: project,
  coverAsset: mediaFixture,
  featured: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as LabPage

const meta = {
  title: 'Components/LabPageCard',
  component: LabPageCard,
  parameters: {
    layout: 'padded',
  },
  args: {
    page,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LabPageCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: {
    page: { ...page, coverAsset: videoFixture },
  },
}

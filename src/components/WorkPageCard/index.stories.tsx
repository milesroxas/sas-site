import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import type { CaseStudy, WorkPage } from '@/payload-types'
import { WorkPageCard } from './index'

const study = {
  id: 1,
  title: 'Clarity for a complex platform',
  project: 1,
  summaries: {
    oneLine: 'A clearer brand for a technical platform.',
    short: 'We repositioned Acme so buyers could understand the platform without a sales call.',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as CaseStudy

const page = {
  id: 1,
  title: 'Acme',
  slug: 'acme',
  caseStudy: study,
  coverAsset: mediaFixture,
  featured: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as WorkPage

const meta = {
  title: 'Components/WorkPageCard',
  component: WorkPageCard,
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
} satisfies Meta<typeof WorkPageCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: {
    page: { ...page, coverAsset: videoFixture },
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import type { LabPage, LabProject } from '@/payload-types'
import { LabHero } from './LabHero'

const project = {
  id: 1,
  title: 'Refraction playground',
  kind: 'experiment',
  status: 'active',
  thesis: 'Can a lightweight WebGL lens make hero media feel more tangible?',
  summaries: {
    oneLine: 'An interactive refraction experiment for hero backdrops.',
    short: 'Prototyping edgeless lens refraction over image and video media.',
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
  hero: {
    layout: 'editorial-split',
    media: mediaFixture,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as LabPage

const meta = {
  title: 'Heroes/Lab',
  component: LabHero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    page,
    project,
  },
} satisfies Meta<typeof LabHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: {
    page: {
      ...page,
      hero: { ...page.hero, media: videoFixture },
      coverAsset: videoFixture,
    },
  },
}

export const Centered: Story = {
  args: {
    page: {
      ...page,
      hero: { ...page.hero, layout: 'centered' },
    },
  },
}

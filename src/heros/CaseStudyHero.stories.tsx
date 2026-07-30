import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import type { CaseStudy, Organization, Project, WorkPage } from '@/payload-types'
import { CaseStudyHero } from './CaseStudyHero'

const organization = {
  id: 1,
  name: 'Acme Systems',
  shortName: 'Acme',
  slug: 'acme-systems',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} satisfies Organization

const project = {
  id: 1,
  internalTitle: 'Acme rebrand',
  status: 'completed',
  organization,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as Project

const study = {
  id: 1,
  title: 'Clarity for a complex platform',
  project,
  thesis: 'Buyers needed a story that matched the product\'s depth.',
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
  hero: {
    layout: 'editorial-split',
    media: mediaFixture,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as WorkPage

const meta = {
  title: 'Heroes/CaseStudy',
  component: CaseStudyHero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    page,
    study,
  },
} satisfies Meta<typeof CaseStudyHero>

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

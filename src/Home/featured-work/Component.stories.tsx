import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import { Section } from '@/blocks/shared/section'
import { FeaturedWorkList } from './FeaturedWorkList.client'

const workEntry = (id: number, title: string, client: string, media = mediaFixture): WorkEntry => {
  const slug = title.toLowerCase().replace(/\s+/g, '-')
  return {
    id,
    slug,
    href: `/works/${slug}`,
    title,
    client,
    industry: 'fintech',
    capabilities: ['Brand strategy', 'Web design'],
    media,
  }
}

const entries: WorkEntry[] = [
  workEntry(1, 'Clarity for a payments platform', 'Interchecks'),
  workEntry(2, 'A calmer story for a care network', 'Blindcut', videoFixture),
  workEntry(3, 'Repositioning a freight marketplace', 'Northbeam'),
  workEntry(4, 'A sharper voice for expert counsel', 'Atrium'),
]

const meta = {
  title: 'Sections/HomeFeaturedWork',
  component: FeaturedWorkList,
  parameters: {
    layout: 'fullscreen',
  },
  // Mirror the server block's frame: dark section band, no vertical padding
  // (the pinned client shell owns viewport sizing), scroll room after the pin.
  decorators: [
    (Story) => (
      <div className="bg-background">
        <Section className="my-0 py-0 md:py-0" theme="dark">
          <Story />
        </Section>
        <div className="h-svh" />
      </div>
    ),
  ],
  args: {
    eyebrow: 'Featured work',
    entries,
  },
} satisfies Meta<typeof FeaturedWorkList>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutEyebrow: Story = {
  args: { eyebrow: null },
}

export const SingleEntry: Story = {
  args: { entries: entries.slice(0, 1) },
}

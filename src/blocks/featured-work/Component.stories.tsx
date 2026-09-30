import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import { Section } from '@/blocks/shared/section'
import type { Media } from '@/payload-types'
import type { FeaturedEntry } from './entry'
import { FeaturedWorkList } from './FeaturedWorkList.client'

const entry = (
  id: number,
  title: string,
  facts: string[],
  { base = 'works', media = mediaFixture }: { base?: string; media?: Media } = {},
): FeaturedEntry => ({
  id,
  href: `/${base}/${title.toLowerCase().replace(/\s+/g, '-')}`,
  title,
  facts,
  visual: { kind: 'media', media },
})

const entries: FeaturedEntry[] = [
  entry(1, 'Clarity for a payments platform', ['Interchecks', 'fintech']),
  entry(2, 'A calmer story for a care network', ['Blindcut', 'fintech'], { media: videoFixture }),
  entry(3, 'Repositioning a freight marketplace', ['Northbeam', 'fintech']),
  entry(4, 'A sharper voice for expert counsel', ['Atrium', 'fintech']),
]

const meta = {
  title: 'Sections/FeaturedWork',
  component: FeaturedWorkList,
  parameters: {
    layout: 'fullscreen',
  },
  // Mirror the server block's frame: page-surface band, no vertical padding
  // (the pinned client shell owns viewport sizing), scroll room after the pin.
  decorators: [
    (Story) => (
      <div className="bg-background">
        <Section spacing="none" theme="default">
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

/** The lab-page closer: other lab pages, kind and status on the meta line. */
export const LabCloser: Story = {
  args: {
    eyebrow: 'More from the lab',
    frameLabel: 'View lab project',
    entries: [
      entry(1, 'Refraction playground', ['Experiment', 'Active'], { base: 'lab' }),
      entry(2, 'Streak Field studio', ['Tool', 'Active'], { base: 'lab', media: videoFixture }),
      entry(3, 'Type scale under motion', ['Experiment', 'Completed'], { base: 'lab' }),
    ],
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { leakScope } from '@/features/immersive/visual'
import { WorksBrowse } from '@/sections/WorksBrowse'
import {
  worksBrowseCapabilities,
  worksBrowseIndustries,
  worksBrowseItems,
} from '@/sections/WorksBrowse/fixtures'
import { IndexBackground } from './IndexBackground'

/**
 * The index page's ground with the works listing over it: the poster paints
 * first, the field goes live where the device allows, and the listing's
 * filters, sort and rows stay clickable over the pointer-transparent layer.
 */
const meta = {
  title: 'Sections/IndexBackground',
  component: IndexBackground,
  parameters: { layout: 'fullscreen' },
  args: {
    hero: {
      visualType: 'streakField',
      shader: { preset: 'topography-v1', seed: 21, speed: 0.7, pointerInteraction: true },
    },
    seedKey: 'works-index',
  },
  render: (args) => (
    <main className="relative isolate min-h-svh" {...leakScope()}>
      <IndexBackground {...args} />
      <WorksBrowse
        capabilities={worksBrowseCapabilities}
        eyebrow="Work"
        industries={worksBrowseIndustries}
        items={worksBrowseItems}
        title="Selected work"
      />
    </main>
  ),
} satisfies Meta<typeof IndexBackground>

export default meta

type Story = StoryObj<typeof meta>

export const Topography: Story = {}

/** The default look, seed derived from the global's slug, pointer left off. */
export const Signal: Story = {
  args: { hero: { visualType: 'streakField', shader: { preset: 'signal-v1' } } },
}

/**
 * A light leak grounding the listing: the wash enters from its corner, follows
 * the visitor's theme, and flares at the rows and filters the pointer crosses.
 */
export const Leak: Story = {
  args: {
    hero: {
      visualType: 'lightLeak',
      shader: { preset: 'film-v1', origin: 'top-right', pointerInteraction: true },
    },
  },
}

/** A media upload or no choice: the index stays copy, nothing paints behind it. */
export const MediaKeepsCopy: Story = {
  args: { hero: { visualType: 'media' } },
}

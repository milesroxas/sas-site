import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  heroImageFixture,
  labPageFixtures,
  postFixtures,
  videoFixture,
  workPageFixtures,
} from '@/blocks/fixtures'
// The page intro's cover wipe reads `--vt-duration-reveal` / `--vt-ease-reveal`
// from this sheet. The app loads it through DirectionalTransition on every
// page; the story has no route shell, so it loads the sheet itself.
import '@/shared/ui/view-transition/view-transition.css'
import { RenderHomeHero } from './index'

const meta = {
  title: 'Heroes/Home',
  component: RenderHomeHero,
  parameters: {
    layout: 'fullscreen',
  },
  // Mirror the frontend page frame so -mt-(--header-height) / footer calc land correctly.
  decorators: [
    (Story) => (
      <div className="min-h-svh bg-background pt-(--header-height) pb-(--footer-height)">
        <Story />
      </div>
    ),
  ],
  args: {
    type: 'left',
    title: 'Make it make sense',
    description:
      'Suits & Sandals is a B2B branding agency for technical companies and expert-led firms with complex offerings.',
    media: heroImageFixture,
    featuredPage: { relationTo: 'posts', value: postFixtures[0] },
    // Deterministic for snapshots: only ColdIntro plays the cold choreography.
    intro: 'warm',
  },
} satisfies Meta<typeof RenderHomeHero>

export default meta

type Story = StoryObj<typeof meta>

export const Left: Story = {}

export const LeftVideo: Story = {
  args: {
    media: videoFixture,
  },
}

export const Center: Story = {
  args: {
    type: 'center',
    title: 'Brand clarity for complex businesses',
  },
}

export const CenterVideo: Story = {
  args: {
    type: 'center',
    title: 'Brand clarity for complex businesses',
    media: videoFixture,
  },
}

/** A work page on the card: the case study's title, its cover, and the section name as the label. */
export const FeaturedWork: Story = {
  args: {
    featuredPage: { relationTo: 'work-pages', value: workPageFixtures[0] },
  },
}

/** A lab page on the card, with the editor's own label in place of the section name. */
export const FeaturedLab: Story = {
  args: {
    featuredPage: { relationTo: 'lab-pages', value: labPageFixtures[0] },
    featuredLabel: 'New in the lab',
  },
}

export const WithoutFeatured: Story = {
  args: {
    featuredPage: null,
  },
}

export const WithoutMedia: Story = {
  args: {
    media: null,
  },
}

/**
 * The document's first paint: cover wipe, copy settle, lens last. The site
 * chrome is not in the story, so the bars' fade is only visible in the app.
 * Re-select the story to replay.
 */
export const ColdIntro: Story = {
  args: { intro: 'cold' },
}

/** A Streak Field behind the statement: the poster is the first paint, the field waits for the intro. */
export const LeftStreakField: Story = {
  args: {
    media: null,
    visualType: 'streakField',
    shader: { preset: 'signal-v1', seed: 694, pointerInteraction: true },
  },
}

/** Topography behind the centered statement, with the editor's speed pulled back. */
export const CenterTopography: Story = {
  args: {
    type: 'center',
    title: 'Brand clarity for complex businesses',
    media: null,
    visualType: 'streakField',
    shader: { preset: 'topography-v1', seed: 21, speed: 0.7 },
  },
}

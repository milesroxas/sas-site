import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heroImageFixture, postFixtures, videoFixture } from '@/blocks/fixtures'
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
    featuredPost: postFixtures[0],
    featuredLabel: 'Insights',
    // Deterministic for Chromatic: only ColdIntro plays the cold choreography.
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

export const WithoutFeatured: Story = {
  args: {
    featuredPost: null,
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

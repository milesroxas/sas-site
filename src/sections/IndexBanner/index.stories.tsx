import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { Container } from '@/components/Container'
import { indexBannerFixture, indexBannerMediaFixture } from './fixtures'
import { IndexBanner } from './index'

/**
 * The slab between an index title and its listing. The entrance plays once on
 * load: the slab wipes open, the copy drops in heading first, the panel
 * follows, and its sliders draw up from zero. Move the pointer over the slab
 * and the sliders retune; leave and they return. The Streak Field goes live
 * after the entrance on a machine with WebGL2 and a fine pointer, and rests on
 * its poster otherwise (`data-visual-status` on the frame reports which).
 */
const meta = {
  title: 'Sections/IndexBanner',
  component: IndexBanner,
  parameters: { layout: 'fullscreen' },
  args: indexBannerFixture,
  render: (args) => (
    <Container className="py-12">
      <IndexBanner {...args} />
    </Container>
  ),
} satisfies Meta<typeof IndexBanner>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** No background chosen: the plain dark slab, and no pause control to show. */
export const PlainSlab: Story = {
  args: { visual: null },
}

/** An upload behind the copy, under the slab's scrim. */
export const MediaBackground: Story = {
  args: indexBannerMediaFixture,
}

/** Heading and action only. */
export const WithoutBody: Story = {
  args: { body: null },
}

/** Another surface on the page already carries the pause control. */
export const WithoutMotionToggle: Story = {
  args: { motionToggle: false },
}

/** Below `md` the slab stacks: copy, then the panel at the column's width. */
export const Mobile: Story = {
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: { viewport: { options: INITIAL_VIEWPORTS } },
}

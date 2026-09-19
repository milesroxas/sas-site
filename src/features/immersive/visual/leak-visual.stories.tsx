import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture } from '@/blocks/fixtures'
import { Section } from '@/blocks/shared/section'
import { Media } from '@/components/Media'
import { leakExcite } from '../ui/light-leak-excite'
import type { LeakVisualDescriptor } from './descriptor'
import { LeakVisual } from './leak-visual'

/**
 * The light leak as page media: a poster in the server HTML, a live leak only
 * once the slot is hydrated, near, visible, allowed and admitted. Contained, it
 * is clipped to the media frame; bleeding, it leaves the frame and washes
 * across the block (`Section`) from the corner the editor pinned it to.
 * `admission: 'force'` runs the lifecycle on any machine; on the site the same
 * gates as every live visual apply.
 */
const descriptor = (over: Partial<LeakVisualDescriptor> = {}): LeakVisualDescriptor => ({
  look: 'film-v1',
  speed: 1,
  intensity: 1,
  pointer: true,
  posterMedia: null,
  degraded: false,
  bleed: false,
  origin: 'top-right',
  media: null,
  ...over,
})

const meta = {
  title: 'Immersive/LeakVisual',
  component: LeakVisual,
  parameters: { layout: 'fullscreen' },
  args: {
    descriptor: descriptor(),
    placement: 'block',
    surface: 'auto',
    admission: 'force',
    className: 'aspect-16/9',
  },
  render: (args) => (
    <Section theme="dark">
      <div className="container grid items-center gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-heading-2">Light, let in on purpose.</h2>
          <p className="text-lead text-muted-foreground">
            Copy sits beside the frame, and under the leak when it bleeds.
          </p>
          <a className="w-fit underline" href="#leak" {...leakExcite()}>
            Hover to flare the leak
          </a>
        </div>
        <LeakVisual
          {...args}
          media={
            args.descriptor.media && (
              <Media fill htmlElement={null} imgClassName="object-cover" resource={mediaFixture} />
            )
          }
        />
      </div>
    </Section>
  ),
} satisfies Meta<typeof LeakVisual>

export default meta

type Story = StoryObj<typeof meta>

/** The default: clipped to the media frame, which paints the band's ground under it. */
export const Contained: Story = {}

/** The slot's media shows under the leak. */
export const ContainedOverMedia: Story = {
  args: { descriptor: descriptor({ media: mediaFixture }) },
}

/** Leaves the frame and washes across the whole block, pinned to the right of the browser. */
export const BleedFromRight: Story = {
  args: { descriptor: descriptor({ bleed: true, media: mediaFixture }) },
}

/** The same field mirrored: the light enters from the lower left. */
export const BleedFromBottomLeft: Story = {
  args: { descriptor: descriptor({ bleed: true, origin: 'bottom-left' }) },
}

/** A pale band: the derived paper face multiplies instead of adding. */
export const OnLightBand: Story = {
  args: { descriptor: descriptor({ bleed: true, look: 'amber-v1' }) },
  render: (args) => (
    <Section theme="light">
      <div className="container grid items-center gap-10 md:grid-cols-2">
        <h2 className="text-heading-2">A warm shadow across the sheet.</h2>
        <LeakVisual {...args} />
      </div>
    </Section>
  ),
}

/** Repeated entries: poster only by placement policy, no probe, no chunk. */
export const PosterOnly: Story = { args: { placement: 'card', admission: 'auto' } }

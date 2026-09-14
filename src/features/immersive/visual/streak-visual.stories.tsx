import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture } from '@/blocks/fixtures'
import type { StreakVisualDescriptor } from './descriptor'
import { VisualMotionToggle } from './motion-toggle'
import { StreakVisual } from './streak-visual'

/**
 * The Streak Field as page media: a poster in the server HTML, a live field
 * only once the slot is hydrated, near, visible, allowed and admitted. In
 * Storybook the slot behaves as on the site: a machine with WebGL2 and a
 * fine pointer goes live after the poster; reduced motion, a coarse pointer
 * or a software renderer keep the poster. `data-visual-status` on the frame
 * reports which.
 */
const descriptor = (over: Partial<StreakVisualDescriptor> = {}): StreakVisualDescriptor => ({
  look: 'signal-v1',
  seed: 694,
  speed: 1,
  intensity: 1,
  pointer: true,
  posterMedia: null,
  degraded: false,
  ...over,
})

const meta = {
  title: 'Immersive/StreakVisual',
  component: StreakVisual,
  parameters: { layout: 'fullscreen' },
  args: {
    descriptor: descriptor(),
    placement: 'hero',
    surface: 'auto',
    fill: true,
    priority: true,
  },
  render: (args) => (
    <div className="relative isolate min-h-svh bg-background text-foreground">
      <StreakVisual {...args} />
      <div className="relative flex min-h-svh items-end justify-between p-10">
        <h2 className="max-w-xl text-balance text-heading-2">Signal, seen from the side.</h2>
        <VisualMotionToggle />
      </div>
    </div>
  ),
} satisfies Meta<typeof StreakVisual>

export default meta

type Story = StoryObj<typeof meta>

/** The default look as a hero background on the site theme (switch the toolbar theme to flip the ground). */
export const Hero: Story = {}

/** A contained block frame: the slot sizes itself from the frame classes. */
export const ContainedBlock: Story = {
  args: { fill: false, placement: 'block', className: 'aspect-16/9 w-full' },
  render: (args) => (
    <div className="container py-16">
      <StreakVisual {...args} />
    </div>
  ),
}

/** Topography: a flow look, admitted only where a float target renders. */
export const Topography: Story = {
  args: { descriptor: descriptor({ look: 'topography-v1', seed: 12 }) },
}

/** A dark band pins the ground regardless of the site theme. */
export const OnDarkBand: Story = {
  args: { surface: 'dark' },
  render: (args) => (
    <div className="band-dark relative isolate min-h-svh bg-tertiary text-tertiary-foreground">
      <StreakVisual {...args} />
    </div>
  ),
}

/** An approved poster upload replaces the look's built-in still. */
export const UploadedPoster: Story = {
  args: { descriptor: descriptor({ posterMedia: mediaFixture }) },
}

/** A stored preset that no longer ships: the fallback look, poster only, never live. */
export const DegradedPreset: Story = {
  args: { descriptor: descriptor({ degraded: true }) },
}

/** Repeated entries and menus: poster only by placement policy, no probe, no chunk. */
export const CardPlacement: Story = {
  args: { placement: 'card', fill: false, className: 'aspect-video w-96' },
  render: (args) => (
    <div className="container py-16">
      <StreakVisual {...args} />
    </div>
  ),
}

/** Held by its owner (a hero intro still playing): the poster stays until `active`. */
export const HeldByOwner: Story = {
  args: { active: false },
}

/** Slowed and dimmed by the editor's bounded multipliers, without pointer interaction. */
export const EditorAdjusted: Story = {
  args: { descriptor: descriptor({ speed: 0.4, intensity: 0.7, pointer: false, seed: 31 }) },
}

/**
 * The full lifecycle on any machine: `admission="force"` (stories only)
 * skips the policy and device gates, so the slot goes poster → preparing →
 * live where a hardware WebGL2 context exists, and poster → failed where the
 * context is refused (software rasterizers).
 */
export const ForcedLifecycle: Story = {
  args: { admission: 'force' },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StreakField } from './streak-field'

/**
 * A field of horizontal light streaks drifting over a dark ground. The
 * streaks are additive, so the ground is whatever the wrapping surface
 * paints; every story here paints black, the reference look.
 *
 * Every story forces the canvas on: in production the effect renders nothing
 * without a GPU or under `prefers-reduced-motion`.
 */
const meta = {
  title: 'Immersive/StreakField',
  component: StreakField,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    force: true,
  },
  render: (args) => (
    <div className="relative isolate min-h-svh bg-black">
      <StreakField {...args} />
    </div>
  ),
} satisfies Meta<typeof StreakField>

export default meta

type Story = StoryObj<typeof meta>

/** The defaults: a dense signal tape, drifting slowly left. */
export const Default: Story = {}

/** Held still. Streaks still breathe and shimmer, but nothing travels. */
export const Static: Story = {
  args: {
    drift: 0,
  },
}

/** Sparse and slow: a quiet backdrop with copy sitting on it. */
export const AsABackdrop: Story = {
  args: {
    count: 900,
    rowPitch: 18,
    drift: -6,
    flicker: 0.15,
  },
  render: (args) => (
    <div data-theme="dark" className="relative isolate min-h-svh bg-black text-foreground">
      <StreakField {...args} />
      <div className="relative flex min-h-svh items-end p-10">
        <h2 className="max-w-xl text-balance text-heading-2">Signal, seen from the side.</h2>
      </div>
    </div>
  ),
}

/** Long trails at speed, fading hard behind the head: rain in a headlight. */
export const Rain: Story = {
  args: {
    drift: -120,
    driftSpread: 0.5,
    maxLength: 320,
    lengthBias: 1.4,
    tail: 0.9,
    lifetime: 3,
  },
}

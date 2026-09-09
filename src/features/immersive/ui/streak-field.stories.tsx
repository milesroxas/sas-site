import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { STREAK_FIELD_DEPTH_MAP, STREAK_FIELD_PAPER, STREAK_FIELD_TOPOGRAPHY } from '../presets'
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

/** The defaults: a fine tick grid lit by a slow fbm relief, creeping right. */
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

/** Curl of an fbm potential: the rows bend into a divergence-free swirl. */
export const CurlFlow: Story = {
  args: {
    noise: 'curl',
    noiseStrength: 40,
  },
}

/** Ridged noise bends the field only across rows, so they gather along seams. */
export const RidgedWaves: Story = {
  args: {
    noise: 'ridged',
    noiseScale: 420,
    noiseStrength: 60,
    noiseAxis: 0,
    segments: 16,
  },
}

/** The same field as ink on paper: the shipped light-theme look. */
export const OnPaper: Story = {
  args: {
    ...STREAK_FIELD_PAPER,
    noise: 'curl',
  },
  render: (args) => (
    <div data-theme="light" className="relative isolate min-h-svh bg-background text-foreground">
      <StreakField {...args} />
      <div className="relative flex min-h-svh items-end p-10">
        <h2 className="max-w-xl text-balance text-heading-2">Signal, seen from the side.</h2>
      </div>
    </div>
  ),
}

/** A tick grid turned along the contours of a height map, lit by altitude. */
export const Topography: Story = {
  args: STREAK_FIELD_TOPOGRAPHY,
}

/** The same grid leaning up the slope, with only the crests lit. */
export const DepthMap: Story = {
  args: STREAK_FIELD_DEPTH_MAP,
}

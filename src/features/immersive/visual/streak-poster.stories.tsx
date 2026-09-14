import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { STREAK_FIELD_PAPER } from '../presets'
import { StreakField } from '../ui/streak-field'
import { STREAK_LOOK_IDS, STREAK_LOOKS, type StreakLookId } from './looks'
import { STREAK_POSTER_SIZE, type StreakPosterSurface } from './posters'

/**
 * Poster capture rig, one frame per shipped look and ground polarity, at the
 * poster's own size on a transparent ground (`scripts/streak-field-posters.ts`
 * screenshots the canvas and writes `public/images/streak-field/`). The
 * field runs as it ships: the look's deltas, the paper preset on a light
 * ground, defaults for the rest. Not a shipped surface.
 */
type PosterArgs = { look: StreakLookId; surface: StreakPosterSurface }

const PosterRig = ({ look, surface }: PosterArgs) => (
  <>
    {/* The capture must see only the field: strip every ground the preview
        paints so the screenshot's alpha is the field's own. */}
    <style>{'html, body, #storybook-root { background: transparent !important; }'}</style>
    <div
      className="relative isolate"
      data-streak-poster={`${look}-${surface}`}
      data-theme={surface}
      style={{ width: STREAK_POSTER_SIZE.width, height: STREAK_POSTER_SIZE.height }}
    >
      <StreakField
        force
        {...STREAK_LOOKS[look].tuning}
        {...(surface === 'light' ? STREAK_FIELD_PAPER : {})}
        surface={surface}
      />
    </div>
  </>
)

const meta = {
  title: 'Immersive/StreakFieldPosters',
  component: PosterRig,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    look: { control: 'select', options: STREAK_LOOK_IDS },
    surface: { control: 'inline-radio', options: ['dark', 'light'] },
  },
  args: { look: 'signal-v1', surface: 'dark' },
} satisfies Meta<typeof PosterRig>

export default meta

type Story = StoryObj<typeof meta>

/** Pick a look and a ground; the capture script drives these args by URL. */
export const Capture: Story = {}

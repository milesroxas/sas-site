import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Surface } from '../studio/effect'
import { EFFECT_IDS, type EffectId, effectOf } from '../studio/effects'
import { LightLeak } from '../ui/light-leak'
import { StreakField } from '../ui/streak-field'
import { STREAK_POSTER_SIZE } from './posters'

/**
 * Poster capture rig, one frame per effect, shipped look and ground polarity,
 * at the poster's own size (`scripts/visual-posters.ts` screenshots the canvas
 * and writes `public/images/<effect's posterDirectory>/`). Each effect runs as
 * it ships: the look's deltas, the effect's own face for the ground, defaults
 * for the rest. An effect drawn with alpha is captured on a transparent
 * ground; one that draws an opaque frame is captured as that frame, and the
 * slot blends the still the way it blends the canvas. Not a shipped surface.
 */
type PosterArgs = { effect: EffectId; look: string; surface: Surface }

const PosterRig = ({ effect: id, look, surface }: PosterArgs) => {
  const effect = effectOf(id)
  const tuning = effect.face({ ...effect.defaults, ...effect.looks[look]?.tuning }, surface)
  return (
    <>
      {/* The capture must see only the effect: strip every ground the preview
          paints so the screenshot's alpha is the effect's own. */}
      <style>{'html, body, #storybook-root { background: transparent !important; }'}</style>
      <div
        className="relative isolate"
        data-visual-poster-rig={`${id}-${look}-${surface}`}
        data-theme={surface}
        style={{ width: STREAK_POSTER_SIZE.width, height: STREAK_POSTER_SIZE.height }}
      >
        {id === 'streakField' ? (
          <StreakField force {...tuning} />
        ) : (
          // Normal blend: the still is the frame itself, not the frame over a ground.
          <LightLeak force {...tuning} className="mix-blend-normal!" excite={false} />
        )}
      </div>
    </>
  )
}

const meta = {
  title: 'Immersive/VisualPosters',
  component: PosterRig,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    effect: { control: 'select', options: EFFECT_IDS },
    look: { control: 'text' },
    surface: { control: 'inline-radio', options: ['dark', 'light'] },
  },
  args: { effect: 'streakField', look: 'signal-v1', surface: 'dark' },
} satisfies Meta<typeof PosterRig>

export default meta

type Story = StoryObj<typeof meta>

/** Pick an effect, a look and a ground; the capture script drives these args by URL. */
export const Capture: Story = {}

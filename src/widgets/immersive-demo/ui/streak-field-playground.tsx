'use client'

import type { StreakFieldInk } from '@/features/immersive'
import { STREAK_FIELD_DEFAULTS as DEFAULTS, StreakField } from '@/features/immersive'
import { useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'

/**
 * Demo content: the streak field over a black stage, with every layout,
 * motion, life and look parameter wired to the surrounding DemoSection's
 * GUI. Demo-only, not shipped UI.
 */

/** The ink moves between the component's 0..1 tuple and leva's colour picker. */
type LevaRgb = { r: number; g: number; b: number }

const toPicker = ([r, g, b]: StreakFieldInk): LevaRgb => ({
  r: Math.round(r * 255),
  g: Math.round(g * 255),
  b: Math.round(b * 255),
})
const toInk = ({ r, g, b }: LevaRgb): StreakFieldInk => [
  Number((r / 255).toFixed(3)),
  Number((g / 255).toFixed(3)),
  Number((b / 255).toFixed(3)),
]

export function StreakFieldPlayground() {
  const { count, dpr, seed } = useDemoControls('Canvas', {
    count: { value: DEFAULTS.count, min: 100, max: 8000, step: 100 },
    dpr: { value: DEFAULTS.dpr, min: 1, max: 2, step: 0.25, label: 'max dpr' },
    seed: { value: DEFAULTS.seed, min: 1, max: 999, step: 1 },
  })

  const { rowPitch, rowJitter, thickness, minLength, maxLength, lengthBias } = useDemoControls(
    'Layout',
    {
      rowPitch: { value: DEFAULTS.rowPitch, min: 4, max: 48, step: 1, label: 'row pitch' },
      rowJitter: { value: DEFAULTS.rowJitter, min: 0, max: 1, step: 0.01, label: 'row jitter' },
      thickness: { value: DEFAULTS.thickness, min: 0.5, max: 6, step: 0.1 },
      minLength: { value: DEFAULTS.minLength, min: 1, max: 100, step: 1, label: 'min length' },
      maxLength: { value: DEFAULTS.maxLength, min: 10, max: 600, step: 5, label: 'max length' },
      lengthBias: { value: DEFAULTS.lengthBias, min: 0.3, max: 6, step: 0.1, label: 'length bias' },
    },
  )

  const { drift, driftSpread, timeScale } = useDemoControls('Motion', {
    drift: { value: DEFAULTS.drift, min: -300, max: 300, step: 1 },
    driftSpread: { value: DEFAULTS.driftSpread, min: 0, max: 1, step: 0.01, label: 'spread' },
    timeScale: { value: DEFAULTS.timeScale, min: 0, max: 3, step: 0.05, label: 'time scale' },
  })

  const { lifetime, lifeSpread, fadeIn, fadeOut } = useDemoControls('Life', {
    lifetime: { value: DEFAULTS.lifetime, min: 0.5, max: 20, step: 0.1 },
    lifeSpread: { value: DEFAULTS.lifeSpread, min: 0, max: 1, step: 0.01, label: 'spread' },
    fadeIn: { value: DEFAULTS.fadeIn, min: 0, max: 0.5, step: 0.01, label: 'fade in' },
    fadeOut: { value: DEFAULTS.fadeOut, min: 0, max: 0.5, step: 0.01, label: 'fade out' },
  })

  const { ink, brightness, brightnessSpread, flicker, flickerRate, tail, cap } = useDemoControls(
    'Look',
    {
      ink: { value: toPicker(DEFAULTS.ink) },
      brightness: { value: DEFAULTS.brightness, min: 0, max: 3, step: 0.01 },
      brightnessSpread: {
        value: DEFAULTS.brightnessSpread,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'brightness spread',
      },
      flicker: { value: DEFAULTS.flicker, min: 0, max: 1, step: 0.01 },
      flickerRate: {
        value: DEFAULTS.flickerRate,
        min: 0,
        max: 8,
        step: 0.05,
        label: 'flicker rate',
      },
      tail: { value: DEFAULTS.tail, min: 0, max: 1, step: 0.01 },
      cap: { value: DEFAULTS.cap, min: 0, max: 20, step: 0.5 },
    },
  )

  const props = {
    count,
    dpr,
    seed,
    rowPitch,
    rowJitter,
    thickness,
    minLength,
    maxLength,
    lengthBias,
    drift,
    driftSpread,
    timeScale,
    lifetime,
    lifeSpread,
    fadeIn,
    fadeOut,
    ink: toInk(ink),
    brightness,
    brightnessSpread,
    flicker,
    flickerRate,
    tail,
    cap,
  }

  // Placement (`className`) stays out: the consumer decides which surface the
  // field fills and paints the ground beneath it.
  useDemoSnippet(props)

  return (
    // isolate: additive light must composite against this black and stop there.
    <div className="relative isolate h-[70vh] overflow-hidden rounded-md bg-black">
      {/* force: the demo has to render the effect even for a visitor whose
          device or motion preference would suppress it in production. */}
      <StreakField force {...props} />
    </div>
  )
}

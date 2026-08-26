'use client'

import { useRef } from 'react'
import type { LightLeakBlendMode, LightLeakTint } from '@/features/immersive'
import { LIGHT_LEAK_DEFAULTS as DEFAULTS, LightLeak } from '@/features/immersive'
import {
  DemoBrowserFrame,
  DemoScroller,
  useDemoControls,
  useDemoSnippet,
} from '@/shared/ui/demo-kit'
import { LightLeakMockPage } from './light-leak-mock-page'

/**
 * Demo content: the light leak over a scrollable mock page in a browser
 * window, with every shader and response parameter wired to the surrounding
 * DemoSection's GUI.
 *
 * The window owns its own scroller and hands the leak its viewport as
 * `scrollSource`, so scrolling the frame — not the demo shell around it —
 * is what agitates the effect. Demo-only — not shipped UI.
 */
/** Channel multipliers move between the component's tuple and leva's vector input. */
type LevaVector = { x: number; y: number; z: number }

const toVector = ([x, y, z]: LightLeakTint): LevaVector => ({ x, y, z })
const toTint = ({ x, y, z }: LevaVector): LightLeakTint => [x, y, z]

export function LightLeakPlayground() {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Only the scroll parameters that shape the *effect's* response. Lenis's own
  // feel (lerp, wheel multiplier) is site-wide and set in SmoothScrollProvider,
  // so it is deliberately not tunable here.
  const {
    scrollSpeed,
    scrollCurve,
    scrollDecay,
    scrollIntensity,
    scrollSmooth,
    scrollDrift,
    morph,
    morphScale,
  } = useDemoControls('Scroll response', {
    scrollSpeed: { value: DEFAULTS.scrollSpeed, min: 100, max: 3000, step: 10, label: 'speed' },
    scrollCurve: { value: DEFAULTS.scrollCurve, min: 0.3, max: 3, step: 0.05, label: 'curve' },
    scrollDecay: { value: DEFAULTS.scrollDecay, min: 0.1, max: 12, step: 0.1, label: 'decay' },
    scrollIntensity: {
      value: DEFAULTS.scrollIntensity,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'intensity',
    },
    scrollSmooth: { value: DEFAULTS.scrollSmooth, min: 0.1, max: 12, step: 0.1, label: 'smooth' },
    scrollDrift: { value: DEFAULTS.scrollDrift, min: 0, max: 2, step: 0.01, label: 'drift' },
    morph: { value: DEFAULTS.morph, min: 0, max: 2, step: 0.01 },
    morphScale: { value: DEFAULTS.morphScale, min: 0.1, max: 12, step: 0.1, label: 'morph scale' },
  })

  const { samples, dpr, blendMode } = useDemoControls('Canvas', {
    samples: { value: DEFAULTS.samples, min: 2, max: 8, step: 1 },
    dpr: { value: DEFAULTS.dpr, min: 1, max: 2, step: 0.25, label: 'max dpr' },
    blendMode: {
      value: DEFAULTS.blendMode,
      options: ['plus-lighter', 'screen', 'lighten'] satisfies LightLeakBlendMode[],
      label: 'blend',
    },
  })

  const { timeScale, warpAmount, warpScale } = useDemoControls('Time & warp', {
    timeScale: { value: DEFAULTS.timeScale, min: 0, max: 2, step: 0.01, label: 'time scale' },
    warpAmount: { value: DEFAULTS.warpAmount, min: 0, max: 1.5, step: 0.01, label: 'warp' },
    warpScale: { value: DEFAULTS.warpScale, min: 0.1, max: 8, step: 0.1, label: 'warp scale' },
  })

  const { dispersion, dispersionEnergy, dispersionExcite, dispersionDirection } = useDemoControls(
    'Dispersion',
    {
      dispersion: { value: DEFAULTS.dispersion, min: 0, max: 0.08, step: 0.001, label: 'base' },
      dispersionEnergy: {
        value: DEFAULTS.dispersionEnergy,
        min: 0,
        max: 0.2,
        step: 0.001,
        label: 'energy',
      },
      dispersionExcite: {
        value: DEFAULTS.dispersionExcite,
        min: 0,
        max: 0.2,
        step: 0.001,
        label: 'excite',
      },
      dispersionDirection: {
        value: [...DEFAULTS.dispersionDirection] as [number, number],
        joystick: 'invertY',
        label: 'direction',
      },
    },
  )

  const {
    gain,
    gainEnergy,
    gainExcite,
    saturation,
    saturationExcite,
    grain,
    grainLuminance,
    vignette,
  } = useDemoControls('Look', {
    gain: { value: DEFAULTS.gain, min: 0, max: 3, step: 0.01 },
    gainEnergy: { value: DEFAULTS.gainEnergy, min: 0, max: 2, step: 0.01, label: 'gain energy' },
    gainExcite: { value: DEFAULTS.gainExcite, min: 0, max: 2, step: 0.01, label: 'gain excite' },
    saturation: { value: DEFAULTS.saturation, min: 0, max: 3, step: 0.01 },
    saturationExcite: {
      value: DEFAULTS.saturationExcite,
      min: 0,
      max: 2,
      step: 0.01,
      label: 'sat excite',
    },
    grain: { value: DEFAULTS.grain, min: 0, max: 0.2, step: 0.001 },
    grainLuminance: {
      value: DEFAULTS.grainLuminance,
      min: 0,
      max: 0.3,
      step: 0.001,
      label: 'grain lum',
    },
    vignette: { value: DEFAULTS.vignette, min: 0, max: 2, step: 0.01 },
  })

  // Vector form, not a 3-array: leva reads a bare `[r, g, b]` as a colour
  // picker, and these are 0\u20132 channel multipliers rather than a colour.
  const { coolTint, warmTint, amber } = useDemoControls('Colour', {
    coolTint: { value: toVector(DEFAULTS.coolTint), min: 0, max: 2, step: 0.01, label: 'cool' },
    warmTint: { value: toVector(DEFAULTS.warmTint), min: 0, max: 2, step: 0.01, label: 'warm' },
    amber: { value: toVector(DEFAULTS.amber), min: 0, max: 1, step: 0.01 },
  })

  const {
    blobWarm,
    streak,
    streakAngle,
    streakSpread,
    blobCool,
    slats,
    slatAngle,
    slatTopSpread,
    slatBottomSpread,
    slatFrequency,
    slatSharpness,
  } = useDemoControls('Field', {
    blobWarm: { value: DEFAULTS.blobWarm, min: 0, max: 3, step: 0.01, label: 'warm blob' },
    streak: { value: DEFAULTS.streak, min: 0, max: 3, step: 0.01 },
    streakAngle: {
      value: DEFAULTS.streakAngle,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'streak angle',
    },
    streakSpread: {
      value: DEFAULTS.streakSpread,
      min: 0.005,
      max: 0.5,
      step: 0.005,
      label: 'streak spread',
    },
    blobCool: { value: DEFAULTS.blobCool, min: 0, max: 3, step: 0.01, label: 'cool blob' },
    slats: { value: DEFAULTS.slats, min: 0, max: 3, step: 0.01 },
    slatAngle: {
      value: DEFAULTS.slatAngle,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'slat angle',
    },
    slatTopSpread: {
      value: DEFAULTS.slatTopSpread,
      min: 0.01,
      max: 1.2,
      step: 0.01,
      label: 'slat top spread',
    },
    slatBottomSpread: {
      value: DEFAULTS.slatBottomSpread,
      min: 0.01,
      max: 1.2,
      step: 0.01,
      label: 'slat bottom spread',
    },
    slatFrequency: {
      value: DEFAULTS.slatFrequency,
      min: 1,
      max: 60,
      step: 0.5,
      label: 'slat freq',
    },
    slatSharpness: {
      value: DEFAULTS.slatSharpness,
      min: 0.5,
      max: 8,
      step: 0.1,
      label: 'slat sharp',
    },
  })

  const { hoverBloom, exciteEase, pointerEase, slatFrequencyExcite } = useDemoControls('Hover', {
    hoverBloom: { value: DEFAULTS.hoverBloom, min: 0, max: 4, step: 0.01, label: 'bloom' },
    exciteEase: { value: DEFAULTS.exciteEase, min: 0.5, max: 12, step: 0.1, label: 'ease' },
    pointerEase: { value: DEFAULTS.pointerEase, min: 1, max: 20, step: 0.5, label: 'pointer ease' },
    slatFrequencyExcite: {
      value: DEFAULTS.slatFrequencyExcite,
      min: 0,
      max: 30,
      step: 0.5,
      label: 'slat freq excite',
    },
  })

  // leva widens the joystick vector to number[]; the component's tuple type is
  // the source of truth for arity.
  const direction = dispersionDirection as unknown as readonly [number, number]
  const cool = toTint(coolTint)
  const warm = toTint(warmTint)
  const hot = toTint(amber)

  const props = {
    samples,
    dpr,
    blendMode: blendMode as LightLeakBlendMode,
    timeScale,
    warpAmount,
    warpScale,
    scrollSpeed,
    scrollCurve,
    scrollDecay,
    scrollIntensity,
    scrollSmooth,
    scrollDrift,
    morph,
    morphScale,
    exciteEase,
    pointerEase,
    hoverBloom,
    dispersion,
    dispersionEnergy,
    dispersionExcite,
    dispersionDirection: direction,
    gain,
    gainEnergy,
    gainExcite,
    saturation,
    saturationExcite,
    grain,
    grainLuminance,
    vignette,
    coolTint: cool,
    warmTint: warm,
    amber: hot,
    blobWarm,
    streak,
    streakAngle,
    streakSpread,
    blobCool,
    slats,
    slatAngle,
    slatTopSpread,
    slatBottomSpread,
    slatFrequency,
    slatFrequencyExcite,
    slatSharpness,
  }

  // Placement (`scrollSource`, `className`) stays out: the consumer binds its
  // own scroller and decides whether the leak is fixed to the page or scoped
  // to a section.
  useDemoSnippet(props)

  return (
    <DemoBrowserFrame path="/lab/light-leak">
      {/* isolate: the blend must reach the page inside the window and stop
          there — without it, plus-lighter composites against the demo shell. */}
      <div className="relative isolate">
        <DemoScroller viewportRef={scrollRef} className="h-[70vh]">
          <LightLeakMockPage />
        </DemoScroller>
        {/* force: the demo has to render the effect even for a visitor whose
            device or motion preference would suppress it in production. */}
        <LightLeak scrollSource={scrollRef} force {...props} />
      </div>
    </DemoBrowserFrame>
  )
}

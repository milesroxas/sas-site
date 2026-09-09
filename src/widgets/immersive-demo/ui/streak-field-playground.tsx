'use client'

import { IconMoon, IconSun } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import type {
  StreakFieldInk,
  StreakFieldLayout,
  StreakFieldMotion,
  StreakFieldNoise,
  StreakFieldProps,
  StreakFieldShape,
  StreakFieldSurface,
} from '@/features/immersive'
import {
  STREAK_FIELD_DEFAULTS as DEFAULTS,
  STREAK_FIELD_DEPTH_MAP,
  STREAK_FIELD_NOISES,
  STREAK_FIELD_PAPER,
  STREAK_FIELD_TOPOGRAPHY,
  StreakField,
} from '@/features/immersive'
import {
  DemoBrowserFrame,
  useDemoAction,
  useDemoSnippet,
  useSettableDemoControls,
} from '@/shared/ui/demo-kit'

/**
 * Demo content: the streak field over a themed stage in a browser window,
 * with every layout, motion, flow, relief, pointer, life and look parameter
 * wired to the surrounding DemoSection's GUI. Move the pointer over the
 * window to perturb the flow; the load buttons write a shipped preset into
 * the panel; the window's theme button flips the stage and loads the look
 * that ships over it. Demo-only, not shipped UI.
 */

/** The inks move between the component's 0..1 tuple and leva's colour picker. */
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

/**
 * leva types each folder's setter to that folder's own schema, so routing
 * preset keys to whichever folder owns them needs one shared signature. The
 * widening happens here, once; the routing table's `Record` type carries the
 * safety it gives up.
 */
type PanelSetter = (patch: Record<string, unknown>) => void
const widen = (set: (patch: never) => void): PanelSetter => set as PanelSetter

/** Every tunable the panel holds: the defaults table's keys, which is also what a preset may set. */
type PanelKey = keyof typeof DEFAULTS
type PanelValues = Pick<Required<StreakFieldProps>, PanelKey>
type Preset = Partial<PanelValues>

const SURFACES = ['dark', 'light'] satisfies StreakFieldSurface[]
const LAYOUTS = ['rows', 'grid'] satisfies StreakFieldLayout[]
const SHAPES = ['dash', 'dot'] satisfies StreakFieldShape[]
const MOTIONS = ['drift', 'flow'] satisfies StreakFieldMotion[]

export function StreakFieldPlayground() {
  const [{ count, dpr, seed, segments, surface, surfaceEase }, setCanvas] = useSettableDemoControls(
    'Canvas',
    {
      count: { value: DEFAULTS.count, min: 100, max: 20000, step: 100 },
      dpr: { value: DEFAULTS.dpr, min: 1, max: 2, step: 0.25, label: 'max dpr' },
      seed: { value: DEFAULTS.seed, min: 1, max: 999, step: 1 },
      segments: { value: DEFAULTS.segments, min: 1, max: 24, step: 1 },
      surface: { value: DEFAULTS.surface as StreakFieldSurface, options: SURFACES },
      surfaceEase: {
        value: DEFAULTS.surfaceEase,
        min: 0.5,
        max: 20,
        step: 0.5,
        label: 'surface ease',
      },
    },
  )

  const [
    {
      layout,
      shape,
      columnPitch,
      rowPitch,
      rowJitter,
      thickness,
      minLength,
      maxLength,
      lengthBias,
    },
    setLayout,
  ] = useSettableDemoControls('Layout', {
    layout: { value: DEFAULTS.layout as StreakFieldLayout, options: LAYOUTS },
    shape: { value: DEFAULTS.shape as StreakFieldShape, options: SHAPES },
    columnPitch: {
      value: DEFAULTS.columnPitch,
      min: 1,
      max: 64,
      step: 0.5,
      label: 'column pitch',
    },
    rowPitch: { value: DEFAULTS.rowPitch, min: 1, max: 48, step: 0.5, label: 'row pitch' },
    rowJitter: { value: DEFAULTS.rowJitter, min: 0, max: 1, step: 0.01, label: 'row jitter' },
    thickness: { value: DEFAULTS.thickness, min: 0.25, max: 6, step: 0.05 },
    minLength: { value: DEFAULTS.minLength, min: 1, max: 60, step: 0.5, label: 'min length' },
    maxLength: { value: DEFAULTS.maxLength, min: 1, max: 200, step: 0.5, label: 'max length' },
    lengthBias: { value: DEFAULTS.lengthBias, min: 0.3, max: 12, step: 0.1, label: 'length bias' },
  })

  const [{ motion, flowSpeed, drift, driftSpread, timeScale }, setMotion] = useSettableDemoControls(
    'Motion',
    {
      motion: { value: DEFAULTS.motion as StreakFieldMotion, options: MOTIONS },
      flowSpeed: { value: DEFAULTS.flowSpeed, min: 0, max: 120, step: 0.5, label: 'flow speed' },
      drift: { value: DEFAULTS.drift, min: -60, max: 60, step: 0.25 },
      driftSpread: { value: DEFAULTS.driftSpread, min: 0, max: 1, step: 0.01, label: 'spread' },
      timeScale: { value: DEFAULTS.timeScale, min: 0, max: 3, step: 0.01, label: 'time scale' },
    },
  )

  const [
    { noise, noiseScale, noiseStrength, noiseSpeed, noiseOctaves, noiseGain, noiseAxis, orient },
    setFlow,
  ] = useSettableDemoControls('Flow', {
    noise: { value: DEFAULTS.noise as StreakFieldNoise, options: [...STREAK_FIELD_NOISES] },
    noiseScale: { value: DEFAULTS.noiseScale, min: 20, max: 3000, step: 10, label: 'scale' },
    noiseStrength: {
      value: DEFAULTS.noiseStrength,
      min: 0,
      max: 100,
      step: 0.25,
      label: 'strength',
    },
    noiseSpeed: { value: DEFAULTS.noiseSpeed, min: 0, max: 0.5, step: 0.001, label: 'speed' },
    noiseOctaves: { value: DEFAULTS.noiseOctaves, min: 1, max: 6, step: 1, label: 'octaves' },
    noiseGain: { value: DEFAULTS.noiseGain, min: 0, max: 1, step: 0.01, label: 'gain' },
    noiseAxis: { value: DEFAULTS.noiseAxis, min: 0, max: 1, step: 0.01, label: 'axis' },
    orient: { value: DEFAULTS.orient, min: 0, max: 1, step: 0.01 },
  })

  const [{ relief, reliefFloor, reliefContrast, reliefLength }, setRelief] =
    useSettableDemoControls('Relief', {
      relief: { value: DEFAULTS.relief, min: 0, max: 1, step: 0.01 },
      reliefFloor: { value: DEFAULTS.reliefFloor, min: 0, max: 1, step: 0.01, label: 'floor' },
      reliefContrast: {
        value: DEFAULTS.reliefContrast,
        min: 0.2,
        max: 6,
        step: 0.01,
        label: 'contrast',
      },
      reliefLength: { value: DEFAULTS.reliefLength, min: 0, max: 1, step: 0.01, label: 'length' },
    })

  const [
    {
      pointerRadius,
      pointerPush,
      pointerSwirl,
      pointerWake,
      pointerAgitate,
      pointerGlow,
      pointerLift,
      pointerEase,
    },
    setPointer,
  ] = useSettableDemoControls('Pointer', {
    pointerRadius: { value: DEFAULTS.pointerRadius, min: 0, max: 600, step: 5, label: 'radius' },
    pointerPush: { value: DEFAULTS.pointerPush, min: -100, max: 100, step: 0.5, label: 'push' },
    pointerSwirl: { value: DEFAULTS.pointerSwirl, min: -100, max: 100, step: 0.5, label: 'swirl' },
    pointerWake: { value: DEFAULTS.pointerWake, min: 0, max: 0.5, step: 0.005, label: 'wake' },
    pointerAgitate: {
      value: DEFAULTS.pointerAgitate,
      min: 0,
      max: 10,
      step: 0.05,
      label: 'agitate',
    },
    pointerGlow: { value: DEFAULTS.pointerGlow, min: 0, max: 3, step: 0.05, label: 'glow' },
    pointerLift: { value: DEFAULTS.pointerLift, min: -1, max: 1, step: 0.01, label: 'lift' },
    pointerEase: { value: DEFAULTS.pointerEase, min: 0.1, max: 20, step: 0.1, label: 'ease' },
  })

  const [{ lifetime, lifeSpread, fadeIn, fadeOut }, setLife] = useSettableDemoControls('Life', {
    lifetime: { value: DEFAULTS.lifetime, min: 0.5, max: 40, step: 0.1 },
    lifeSpread: { value: DEFAULTS.lifeSpread, min: 0, max: 1, step: 0.01, label: 'spread' },
    fadeIn: { value: DEFAULTS.fadeIn, min: 0, max: 0.5, step: 0.005, label: 'fade in' },
    fadeOut: { value: DEFAULTS.fadeOut, min: 0, max: 0.5, step: 0.005, label: 'fade out' },
  })

  const [
    { ink, paperInk, brightness, brightnessSpread, flicker, flickerRate, tail, cap },
    setLook,
  ] = useSettableDemoControls('Look', {
    ink: { value: toPicker(DEFAULTS.ink), label: 'ink (dark)' },
    paperInk: { value: toPicker(DEFAULTS.paperInk), label: 'ink (light)' },
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
      max: 4,
      step: 0.01,
      label: 'flicker rate',
    },
    tail: { value: DEFAULTS.tail, min: 0, max: 1, step: 0.01 },
    cap: { value: DEFAULTS.cap, min: 0, max: 10, step: 0.1 },
  })

  // Every panel key, pointing at the folder that holds it. `Record<PanelKey,
  // …>` is the guard in both directions: a knob added to the defaults table
  // with no home here fails the build instead of quietly going missing when
  // a preset is loaded.
  const routes: Record<PanelKey, PanelSetter> = {
    count: widen(setCanvas),
    dpr: widen(setCanvas),
    seed: widen(setCanvas),
    segments: widen(setCanvas),
    surface: widen(setCanvas),
    surfaceEase: widen(setCanvas),
    layout: widen(setLayout),
    shape: widen(setLayout),
    columnPitch: widen(setLayout),
    rowPitch: widen(setLayout),
    rowJitter: widen(setLayout),
    thickness: widen(setLayout),
    minLength: widen(setLayout),
    maxLength: widen(setLayout),
    lengthBias: widen(setLayout),
    motion: widen(setMotion),
    flowSpeed: widen(setMotion),
    drift: widen(setMotion),
    driftSpread: widen(setMotion),
    timeScale: widen(setMotion),
    noise: widen(setFlow),
    noiseScale: widen(setFlow),
    noiseStrength: widen(setFlow),
    noiseSpeed: widen(setFlow),
    noiseOctaves: widen(setFlow),
    noiseGain: widen(setFlow),
    noiseAxis: widen(setFlow),
    orient: widen(setFlow),
    relief: widen(setRelief),
    reliefFloor: widen(setRelief),
    reliefContrast: widen(setRelief),
    reliefLength: widen(setRelief),
    pointerRadius: widen(setPointer),
    pointerPush: widen(setPointer),
    pointerSwirl: widen(setPointer),
    pointerWake: widen(setPointer),
    pointerAgitate: widen(setPointer),
    pointerGlow: widen(setPointer),
    pointerLift: widen(setPointer),
    pointerEase: widen(setPointer),
    lifetime: widen(setLife),
    lifeSpread: widen(setLife),
    fadeIn: widen(setLife),
    fadeOut: widen(setLife),
    ink: widen(setLook),
    paperInk: widen(setLook),
    brightness: widen(setLook),
    brightnessSpread: widen(setLook),
    flicker: widen(setLook),
    flickerRate: widen(setLook),
    tail: widen(setLook),
    cap: widen(setLook),
  }

  /**
   * Write a look *into* the panel: the preset's deltas over the defaults
   * table, every key, so the sliders, the render and the emitted snippet
   * never disagree. That overwrites hand-tuning, which is the point of a
   * load button. Inks cross into the picker's units on the way.
   */
  const load = (preset: Preset) => {
    const values: PanelValues = { ...DEFAULTS, ...preset }
    for (const key of Object.keys(routes) as PanelKey[]) {
      const value = values[key]
      routes[key]({
        [key]: key === 'ink' || key === 'paperInk' ? toPicker(value as StreakFieldInk) : value,
      })
    }
  }

  useDemoAction('load topography', () => load(STREAK_FIELD_TOPOGRAPHY))
  useDemoAction('load depth map', () => load(STREAK_FIELD_DEPTH_MAP))
  useDemoAction('load defaults', () => load({}))

  /**
   * Flip the stage and load only the keys the paper preset owns: going
   * light they take the preset's values, coming back they take the
   * defaults'. Everything else in the panel is left as tuned.
   */
  const applySurface = (next: StreakFieldSurface) => {
    const values = { ...DEFAULTS, ...(next === 'light' ? STREAK_FIELD_PAPER : {}) }
    for (const key of Object.keys(STREAK_FIELD_PAPER) as (keyof typeof STREAK_FIELD_PAPER)[]) {
      routes[key]({ [key]: values[key] })
    }
  }

  const props = {
    count,
    dpr,
    seed,
    segments,
    surface: surface as StreakFieldSurface,
    surfaceEase,
    layout: layout as StreakFieldLayout,
    shape: shape as StreakFieldShape,
    columnPitch,
    rowPitch,
    rowJitter,
    thickness,
    minLength,
    maxLength,
    lengthBias,
    motion: motion as StreakFieldMotion,
    flowSpeed,
    drift,
    driftSpread,
    timeScale,
    noise: noise as StreakFieldNoise,
    noiseScale,
    noiseStrength,
    noiseSpeed,
    noiseOctaves,
    noiseGain,
    noiseAxis,
    orient,
    relief,
    reliefFloor,
    reliefContrast,
    reliefLength,
    pointerRadius,
    pointerPush,
    pointerSwirl,
    pointerWake,
    pointerAgitate,
    pointerGlow,
    pointerLift,
    pointerEase,
    lifetime,
    lifeSpread,
    fadeIn,
    fadeOut,
    ink: toInk(ink),
    paperInk: toInk(paperInk),
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

  const other: StreakFieldSurface = surface === 'dark' ? 'light' : 'dark'

  return (
    <DemoBrowserFrame
      path="/lab/streak-field"
      trailing={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applySurface(other)}
          aria-label={`Preview the stage in ${other} mode`}
          title="Themes the stage inside the window and loads the look that ships over it: STREAK_FIELD_PAPER on light, the defaults on dark. This writes into the panel, overwriting those controls."
        >
          {surface === 'dark' ? <IconSun aria-hidden /> : <IconMoon aria-hidden />}
          {surface === 'dark' ? 'Light' : 'Dark'}
        </Button>
      }
    >
      {/* isolate: the streaks composite against this stage and stop there. The
          stage paints the site's ground for the chosen theme so the crossfade
          is judged over the real surface. */}
      <div
        data-theme={surface}
        className="relative isolate h-[70vh] overflow-hidden bg-background text-foreground"
      >
        {/* force: the demo has to render the effect even for a visitor whose
            device or motion preference would suppress it in production. */}
        <StreakField force {...props} />
        <div className="pointer-events-none relative flex h-full items-end p-10">
          <h2 className="max-w-xl text-balance text-heading-2">Signal, seen from the side.</h2>
        </div>
      </div>
    </DemoBrowserFrame>
  )
}

'use client'

import { useFBO } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import cn from 'clsx'
import type { CSSProperties, RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CustomBlending,
  FloatType,
  HalfFloatType,
  type IUniform,
  MathUtils,
  Mesh,
  NearestFilter,
  OneFactor,
  OneMinusSrcAlphaFactor,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  type Texture,
  Vector2,
  Vector3,
  type WebGLRenderer,
} from 'three'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import { resolveTuning } from '../resolve-tuning'
import {
  FRAGMENT_SHADER,
  SIM_FRAGMENT_SHADER,
  SIM_VERTEX_SHADER,
  STREAK_FIELD_MAX_OCTAVES,
  STREAK_FIELD_NOISES,
  VERTEX_SHADER,
} from './streak-field-shader'

/**
 * Renders in its own small WebGL canvas (classic renderer) rather than the
 * global one: GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is
 * unsupported (WebGPURenderer only accepts TSL node materials).
 */

export { STREAK_FIELD_NOISES }

/** A 0..1 RGB colour for the streaks. */
export type StreakFieldInk = readonly [number, number, number]

/**
 * Formula behind the flow field. `none` keeps the streaks on their rows;
 * `value` is a boxy lattice drift, `simplex` a smooth isotropic one, `fbm`
 * adds octaves of detail, `ridged` creases the field into seams, `curl`
 * takes the curl of an fbm potential (a divergence-free swirl that runs
 * along the potential's contours) and `gradient` its slope. The potential is
 * also the height the relief reads.
 */
export type StreakFieldNoise = (typeof STREAK_FIELD_NOISES)[number]

/**
 * Where streaks sit. `rows` scatters them along their rows at random
 * phases, the tape look; `grid` pins instance `i` to cell `i` of a regular
 * row and column grid, the tick-plot look. On the grid, `count` caps how
 * many cells are filled, reading left to right, top to bottom.
 */
export type StreakFieldLayout = 'rows' | 'grid'

/**
 * How streaks move. `drift` slides them along their rows while the field
 * morphs under them, stateless and deterministic. `flow` advects them
 * through the field: a GPU simulation integrates every particle along the
 * field's direction each frame, so ticks stream out along the flow and
 * respawn at their layout position when their life ends or they leave.
 */
export type StreakFieldMotion = 'drift' | 'flow'

/**
 * The ground the field sits on. Over `dark` the streaks are light; over
 * `light` they are ink. Matches the site's `Theme`, so a page can pass
 * `useSiteTheme()` straight through and the field crossfades with the toggle.
 */
export type StreakFieldSurface = 'dark' | 'light'

export type StreakFieldProps = {
  /**
   * Mounts the canvas even when the device is flagged low-power or the visitor
   * prefers reduced motion. For demos and stories, never for shipped pages.
   */
  force?: boolean
  /** Placement. Defaults to filling the nearest positioned ancestor. */
  className?: string

  // Canvas
  /**
   * Number of streaks alive in the buffer. One draw call regardless, so this
   * is a fill-rate and density lever rather than a CPU one.
   */
  count?: number
  /** Device-pixel-ratio cap. Streaks are a pixel or two thick, so 2 keeps them crisp. */
  dpr?: number
  /**
   * Seed for the per-streak hashes. The same seed always lays out the same
   * field, so a story or a page keeps its composition between loads.
   */
  seed?: number
  /**
   * Quads along each streak. 1 is a rigid dash; more lets a streak bend with
   * the flow field. Costs vertices, not draw calls.
   */
  segments?: number
  /** The ground beneath the field: light streaks over `dark`, ink over `light`. */
  surface?: StreakFieldSurface
  /**
   * How fast the field crossfades when `surface` changes, per second. Higher
   * settles sooner; the ground beneath usually snaps, so this is short.
   */
  surfaceEase?: number

  // Layout
  /** Random phases along rows, or a fixed row and column grid. */
  layout?: StreakFieldLayout
  /** Horizontal distance between grid columns, in CSS px. `grid` only. */
  columnPitch?: number
  /** Vertical distance between rows, in CSS px. */
  rowPitch?: number
  /** How far a streak may sit off its row, as a fraction of the pitch. 0 is a strict grid. */
  rowJitter?: number
  /** Streak height in CSS px. */
  thickness?: number
  /** Shortest streak, in CSS px. */
  minLength?: number
  /** Longest streak, in CSS px. */
  maxLength?: number
  /** Length distribution. 1 is uniform; higher skews the field toward short ticks. */
  lengthBias?: number

  // Motion
  /** Stateless drift along rows, or particles advected through the field. */
  motion?: StreakFieldMotion
  /** `flow` only. Speed along the field's direction, in CSS px/s. */
  flowSpeed?: number
  /** Speed of the drift along the rows in CSS px/s. Negative runs leftward; 0 holds still. In `flow` it is a wind. */
  drift?: number
  /** Per-streak speed variance around the drift, 0..1. */
  driftSpread?: number
  /** Playback rate for everything time-driven. 0 freezes the field. */
  timeScale?: number

  // Flow
  /** Noise formula the flow field runs on. `none` is a straight row grid. */
  noise?: StreakFieldNoise
  /** Size of one flow feature, in CSS px. Larger is a broader, slower swell. */
  noiseScale?: number
  /** How far the field may move a point, in CSS px. */
  noiseStrength?: number
  /** How fast the field evolves, in noise units per second. 0 freezes its shape. */
  noiseSpeed?: number
  /** Octaves of detail for `fbm`, `ridged` and `curl`, 1..6. */
  noiseOctaves?: number
  /** Amplitude ratio between octaves, 0..1. Higher is rougher. */
  noiseGain?: number
  /**
   * Which way the field displaces, 0..1. 0 only bends rows up and down, 1
   * only bunches streaks along their rows, 0.5 does both in full.
   */
  noiseAxis?: number
  /**
   * How far each dash turns to face the field's direction at its centre,
   * 0..1. 0 keeps every dash on its row; 1 draws the field as a tick plot.
   * With `curl` the ticks follow contours, with `gradient` they climb.
   */
  orient?: number

  // Relief
  /** How much the field's height shades brightness, 0..1. 0 ignores height. */
  relief?: number
  /** Height below which ground goes dark, 0..1. Higher leaves only the peaks lit. */
  reliefFloor?: number
  /** Exponent on the shade. 1 is linear; higher pushes light to the peaks. */
  reliefContrast?: number
  /** How much height scales length, 0..1. Low ground shrinks to a dot. */
  reliefLength?: number

  // Pointer
  /** Reach of the pointer's influence, in CSS px. 0 turns the pointer off. */
  pointerRadius?: number
  /** Radial displacement under the pointer, in CSS px. Negative pulls the field in. */
  pointerPush?: number
  /** Tangential displacement under the pointer, in CSS px: a vortex. */
  pointerSwirl?: number
  /**
   * Displacement along the pointer's motion, as seconds of its velocity:
   * 0.04 moves the field 40 px at 1000 px/s. Capped at the radius.
   */
  pointerWake?: number
  /** Extra flow amplitude under the pointer, as a multiple of `noiseStrength`. */
  pointerAgitate?: number
  /** Extra brightness under the pointer, as a multiple of the streak's own. */
  pointerGlow?: number
  /** Height added to the relief under the pointer, -1..1. Negative digs. */
  pointerLift?: number
  /** How fast the field's pointer follows the real one, per second. Lower is lazier. */
  pointerEase?: number

  // Life
  /** Seconds a streak lives before it fades and is reborn elsewhere on its row. */
  lifetime?: number
  /** Per-streak lifetime variance, 0..1. Keeps the field from breathing in unison. */
  lifeSpread?: number
  /** Fraction of the life spent fading in. */
  fadeIn?: number
  /** Fraction of the life spent fading out. */
  fadeOut?: number

  // Look
  /** Streak colour over a dark ground. Emissive, so it only ever adds light. */
  ink?: StreakFieldInk
  /** Streak colour over a light ground. */
  paperInk?: StreakFieldInk
  /** Overall intensity. Brightness over a dark ground, coverage over a light one. */
  brightness?: number
  /** Per-streak brightness range, 0..1. 0 is a uniform field; 1 lets streaks go fully dim. */
  brightnessSpread?: number
  /** Depth of the per-streak shimmer, 0..1. */
  flicker?: number
  /** Shimmer rate in Hz. */
  flickerRate?: number
  /** How much each streak fades from its head to its tail. 0 is a flat dash. */
  tail?: number
  /** Softening at each end of a streak, in CSS px. */
  cap?: number
}

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site, and shipped
 * looks live as delta-only presets in `../presets.ts`.
 */
export const STREAK_FIELD_DEFAULTS = {
  count: 20000,
  dpr: 2,
  seed: 694,
  segments: 1,
  surface: 'dark',
  surfaceEase: 15.5,

  layout: 'rows',
  columnPitch: 4,
  rowPitch: 4,
  rowJitter: 0,
  thickness: 2.8,
  minLength: 4,
  maxLength: 7,
  lengthBias: 6,

  motion: 'drift',
  flowSpeed: 40,
  drift: 4,
  driftSpread: 0,
  timeScale: 1.2,

  noise: 'fbm',
  noiseScale: 1080,
  noiseStrength: 0,
  noiseSpeed: 0.08,
  noiseOctaves: 3,
  noiseGain: 0.5,
  noiseAxis: 0.5,
  orient: 0,

  relief: 0.73,
  reliefFloor: 0.42,
  reliefContrast: 1.65,
  reliefLength: 0.82,

  pointerRadius: 420,
  pointerPush: 0,
  pointerSwirl: 0,
  pointerWake: 0.19,
  pointerAgitate: 4.2,
  pointerGlow: 2.15,
  pointerLift: 0.25,
  pointerEase: 3,

  lifetime: 11.4,
  lifeSpread: 0.62,
  fadeIn: 0.05,
  fadeOut: 0.09,

  ink: [0.518, 0.655, 1],
  paperInk: [0.31, 0.361, 0.502],
  brightness: 1.18,
  brightnessSpread: 0.51,
  flicker: 0.31,
  flickerRate: 0.7,
  tail: 0.42,
  cap: 2,
} as const satisfies Partial<StreakFieldProps>

/**
 * Every knob with its default filled in: what the scene actually reads, once
 * `resolveTuning` has folded the caller's deltas into `STREAK_FIELD_DEFAULTS`.
 */
type StreakFieldTuning = Required<Pick<StreakFieldProps, keyof typeof STREAK_FIELD_DEFAULTS>>

// Hoisted so JSX never allocates fresh objects per render (perf-avoid-inline-objects).
const GL_CONFIG = { antialias: false, powerPreference: 'high-performance' } as const
const RESIZE_OPTIONS = { ...CANVAS_RESIZE, scroll: false, debounce: 200 } as const
/**
 * R3F writes `pointer-events: auto` inline on its container, and a
 * `pointer-events: none` ancestor does NOT stop a descendant that sets `auto`
 * from being a hit target. This overrides that inline style so the field never
 * swallows wheel or pointer events over the surface it decorates. The pointer
 * is read off the window instead.
 */
const CANVAS_STYLE: CSSProperties = { pointerEvents: 'none' }
/** Hash channels per instance, one vec4 per attribute. */
const SEED_STRIDE = 4
/** Delta cap: a multi-second tab-switch delta would teleport the field. */
const MAX_DELTA = 0.05
/** Flow state is one texel per particle, laid out in a near-square texture. */
function stateSize(count: number): [number, number] {
  const width = Math.max(1, Math.ceil(Math.sqrt(count)))
  return [width, Math.max(1, Math.ceil(count / width))]
}
/**
 * Positions live in 0..1 of the frame, so half floats (11-bit mantissa)
 * would jitter by a pixel on a wide canvas. Full float wherever the context
 * can render to it; half float is the fallback, not the default.
 */
function stateTextureType(gl: WebGLRenderer) {
  const renderable = gl.capabilities.isWebGL2
    ? gl.extensions.has('EXT_color_buffer_float')
    : gl.extensions.has('OES_texture_float') && gl.extensions.has('WEBGL_color_buffer_float')
  return renderable ? FloatType : HalfFloatType
}
/** The uniforms the render and simulation passes share: the field and the pointer. */
type SharedUniforms = Record<string, IUniform>
function createSharedUniforms(): SharedUniforms {
  return {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uDpr: { value: 1 },
    uLayout: { value: 0 },
    uColumnPitch: { value: 20 },
    uRowPitch: { value: 14 },
    uRowJitter: { value: 0 },
    uDrift: { value: 0 },
    uDriftSpread: { value: 0 },
    uLifetime: { value: 1 },
    uLifeSpread: { value: 0 },
    uNoiseMode: { value: 0 },
    uNoiseScale: { value: 1 },
    uNoiseStrength: { value: 0 },
    uNoiseSpeed: { value: 0 },
    uNoiseOctaves: { value: 1 },
    uNoiseGain: { value: 0.5 },
    uNoiseAxis: { value: 0.5 },
    uPointer: { value: new Vector2() },
    uPointerVel: { value: new Vector2() },
    uPointerAmt: { value: 0 },
    uPointerRadius: { value: 0 },
    uPointerPush: { value: 0 },
    uPointerSwirl: { value: 0 },
    uPointerWake: { value: 0 },
    uPointerAgitate: { value: 0 },
  }
}

/**
 * mulberry32: a small, fast PRNG so a `seed` always lays out the same field.
 * `Math.random` would reshuffle every mount and every Chromatic snapshot.
 */
function createRandom(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Two vec4 hash buffers per streak, uniform in 0..1 (see the shader header
 * for the channel map), plus the instance index the grid layout reads.
 * GLSL ES 1.0 has no gl_InstanceID, so it travels as an attribute.
 */
function createSeeds(count: number, seed: number) {
  const random = createRandom(seed)
  const primary = new Float32Array(count * SEED_STRIDE)
  const secondary = new Float32Array(count * SEED_STRIDE)
  const index = new Float32Array(count)
  for (let i = 0; i < primary.length; i++) primary[i] = random()
  for (let i = 0; i < secondary.length; i++) secondary[i] = random()
  for (let i = 0; i < count; i++) index[i] = i
  return { primary, secondary, index }
}

/**
 * Pointer state, written by DOM listeners and read in `useFrame`. A ref
 * rather than state: it changes on every pointer event and must never
 * re-render React (perf-never-set-state-in-useframe).
 */
type PointerInput = {
  clientX: number
  clientY: number
  /** Set by pointermove; makes the frame re-read the surface rect exactly once. */
  moved: boolean
  /** Whether the pointer is over the page at all. */
  present: boolean
  /** Surface-relative pointer, 0..1, y-up (GL convention). */
  x: number
  y: number
  /** Whether that position falls on the surface. */
  inside: boolean
  /** The first read snaps the eased pointer instead of sweeping it in from a corner. */
  seeded: boolean
}

function createPointerInput(): PointerInput {
  return {
    clientX: 0,
    clientY: 0,
    moved: false,
    present: false,
    x: 0.5,
    y: 0.5,
    inside: false,
    seeded: false,
  }
}

/**
 * Read the surface rect only on frames where the pointer actually moved: idle
 * frames cost no layout, and the rect stays correct for a field that scrolls
 * with its section.
 */
function refreshPointer(input: PointerInput, root: HTMLDivElement | null) {
  if (!input.moved) return
  input.moved = false
  const rect = root?.getBoundingClientRect()
  if (!rect || rect.width === 0 || rect.height === 0) return
  input.x = (input.clientX - rect.left) / rect.width
  input.y = 1 - (input.clientY - rect.top) / rect.height
  input.inside = input.x >= 0 && input.x <= 1 && input.y >= 0 && input.y <= 1
}

/** Whether any pointer term can move or light the field, so idle pages skip the listeners. */
function isInteractive(tuning: StreakFieldTuning) {
  const {
    pointerRadius,
    pointerPush,
    pointerSwirl,
    pointerWake,
    pointerAgitate,
    pointerGlow,
    pointerLift,
  } = tuning
  return (
    pointerRadius > 0 &&
    (pointerPush !== 0 ||
      pointerSwirl !== 0 ||
      pointerWake !== 0 ||
      pointerAgitate !== 0 ||
      pointerGlow !== 0 ||
      pointerLift !== 0)
  )
}

type FieldSceneProps = {
  rootRef: RefObject<HTMLDivElement | null>
  inputRef: RefObject<PointerInput>
  /** Caller deltas already resolved against `STREAK_FIELD_DEFAULTS`. */
  tuning: StreakFieldTuning
}

function FieldScene({ rootRef, inputRef, tuning }: FieldSceneProps) {
  const {
    count,
    seed,
    segments,
    surface,
    surfaceEase,
    layout,
    columnPitch,
    rowPitch,
    rowJitter,
    thickness,
    minLength,
    maxLength,
    lengthBias,
    drift,
    driftSpread,
    timeScale,
    motion,
    flowSpeed,
    noise,
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
    ink,
    paperInk,
    brightness,
    brightnessSpread,
    flicker,
    flickerRate,
    tail,
    cap,
  } = tuning

  const materialRef = useRef<ShaderMaterial>(null)
  // Atomic selectors: a bare useThree() re-renders on any R3F state change
  // (perf-zustand-selectors).
  const gl = useThree((state) => state.gl)
  const size = useThree((state) => state.size)
  const pixelRatio = useThree((state) => state.viewport.dpr)

  // Field time, integrated here rather than read off the clock so a change to
  // `timeScale` bends the rate without jumping every streak to a new phase.
  const time = useRef(0)
  // Eased pointer velocity, device px/s. Kept off the uniforms so a resize
  // (which rescales the position) never spikes it.
  const velocity = useRef(new Vector2())
  const absorbSeeded = useRef(false)

  const seeds = useMemo(() => createSeeds(count, seed), [count, seed])

  // Flow simulation: two state targets swapped every step, a full-screen
  // quad that writes one, and the last composition the state was seeded
  // for. Nearest sampling: a texel is a particle, never a blend of two.
  const [stateWidth, stateHeight] = stateSize(count)
  const stateOptions = useMemo(
    () => ({
      type: stateTextureType(gl),
      format: RGBAFormat,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    }),
    [gl],
  )
  const stateA = useFBO(stateWidth, stateHeight, stateOptions)
  const stateB = useFBO(stateWidth, stateHeight, stateOptions)
  const swapped = useRef(false)
  const seededFor = useRef('')
  const sim = useMemo(() => {
    const material = new ShaderMaterial({
      vertexShader: SIM_VERTEX_SHADER,
      fragmentShader: SIM_FRAGMENT_SHADER,
      uniforms: {
        ...createSharedUniforms(),
        uState: { value: null as Texture | null },
        uStateSize: { value: new Vector2(1, 1) },
        uInit: { value: 1 },
        uDt: { value: 0 },
        uSeed: { value: 1 },
        uFlowSpeed: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    })
    const geometry = new PlaneGeometry(2, 2)
    const scene = new Scene()
    scene.add(new Mesh(geometry, material))
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    return { material, geometry, scene, camera }
  }, [])
  useEffect(
    () => () => {
      sim.material.dispose()
      sim.geometry.dispose()
    },
    [sim],
  )
  const planeArgs = useMemo<[number, number, number, number]>(
    () => [1, 1, Math.max(1, Math.round(segments)), 1],
    [segments],
  )

  // Initial values only. R3F copies this into the material, so every runtime
  // update goes through materialRef.current.uniforms, never this object.
  const uniforms = useMemo(
    () => ({
      ...createSharedUniforms(),
      uThickness: { value: 1 },
      uMinLength: { value: 1 },
      uMaxLength: { value: 1 },
      uLengthBias: { value: 1 },
      uFadeIn: { value: 0.1 },
      uFadeOut: { value: 0.1 },
      uFlicker: { value: 0 },
      uFlickerRate: { value: 1 },
      uBrightnessSpread: { value: 0 },
      uOrient: { value: 0 },
      uRelief: { value: 0 },
      uReliefFloor: { value: 0 },
      uReliefContrast: { value: 1 },
      uReliefLength: { value: 0 },
      uPointerGlow: { value: 0 },
      uPointerLift: { value: 0 },
      uMotion: { value: 0 },
      uState: { value: null as Texture | null },
      uStateSize: { value: new Vector2(1, 1) },
      uInk: { value: new Vector3(1, 1, 1) },
      uPaperInk: { value: new Vector3() },
      uDensity: { value: 1 },
      uAbsorb: { value: 0 },
      uTail: { value: 0 },
      uCap: { value: 1 },
    }),
    [],
  )

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms
    const su = sim.material.uniforms
    // Floored too: the velocity below divides by it, and a first frame can be 0.
    const dt = MathUtils.clamp(delta, 1e-4, MAX_DELTA)
    const fieldDt = dt * timeScale
    time.current += fieldDt

    const resolution = u.uResolution.value as Vector2
    resolution.set(size.width * pixelRatio, size.height * pixelRatio)

    // Pointer. Position and presence ease toward the raw input so a flick
    // reads as a shove and leaving the surface lets the field settle back
    // rather than snap. Velocity is the eased position's own, eased again.
    const input = inputRef.current
    refreshPointer(input, rootRef.current)
    const pointer = u.uPointer.value as Vector2
    const targetX = input.x * resolution.x
    const targetY = input.y * resolution.y
    if (!input.seeded && input.present) {
      pointer.set(targetX, targetY)
      input.seeded = true
    }
    const prevX = pointer.x
    const prevY = pointer.y
    pointer.set(
      MathUtils.damp(pointer.x, targetX, pointerEase, dt),
      MathUtils.damp(pointer.y, targetY, pointerEase, dt),
    )
    const vel = velocity.current
    vel.set(
      MathUtils.damp(vel.x, (pointer.x - prevX) / dt, pointerEase, dt),
      MathUtils.damp(vel.y, (pointer.y - prevY) / dt, pointerEase, dt),
    )
    const presence = input.present && input.inside ? 1 : 0
    const pointerAmt = MathUtils.damp(u.uPointerAmt.value, presence, pointerEase, dt)

    // Shared field and pointer state, written to both passes so a particle
    // is drawn against the field that moved it. Written every frame rather
    // than in a prop-change effect because the field always animates: a
    // frame is running anyway, and these float writes cost nothing next to
    // a 50-entry dependency array. The formula is a uniform rather than a
    // #define on purpose: the demo switches formulas live, and a relink
    // mid-session is a compile stall and a dropped frame when a coherent
    // branch costs nothing.
    for (const target of [u, su]) {
      target.uTime.value = time.current
      ;(target.uResolution.value as Vector2).copy(resolution)
      target.uDpr.value = pixelRatio
      target.uLayout.value = layout === 'grid' ? 1 : 0
      target.uColumnPitch.value = Math.max(1, columnPitch)
      target.uRowPitch.value = rowPitch
      target.uRowJitter.value = rowJitter
      target.uDrift.value = drift
      target.uDriftSpread.value = driftSpread
      target.uLifetime.value = lifetime
      target.uLifeSpread.value = lifeSpread
      target.uNoiseMode.value = Math.max(0, STREAK_FIELD_NOISES.indexOf(noise))
      target.uNoiseScale.value = Math.max(1, noiseScale)
      target.uNoiseStrength.value = noiseStrength
      target.uNoiseSpeed.value = noiseSpeed
      target.uNoiseOctaves.value = MathUtils.clamp(
        Math.round(noiseOctaves),
        1,
        STREAK_FIELD_MAX_OCTAVES,
      )
      target.uNoiseGain.value = noiseGain
      target.uNoiseAxis.value = noiseAxis
      ;(target.uPointer.value as Vector2).copy(pointer)
      ;(target.uPointerVel.value as Vector2).copy(vel)
      target.uPointerAmt.value = pointerAmt
      target.uPointerRadius.value = pointerRadius
      target.uPointerPush.value = pointerPush
      target.uPointerSwirl.value = pointerSwirl
      target.uPointerWake.value = pointerWake
      target.uPointerAgitate.value = pointerAgitate
    }

    // Flow: one simulation step into the spare target, then hand the fresh
    // state to the render pass. A new composition (count, seed, layout, or
    // the switch into flow) reseeds every particle at its spawn point.
    const flowing = motion === 'flow'
    u.uMotion.value = flowing ? 1 : 0
    if (flowing) {
      const composition = `${count}:${seed}:${layout}:${stateWidth}x${stateHeight}`
      const read = swapped.current ? stateB : stateA
      const write = swapped.current ? stateA : stateB
      su.uState.value = read.texture
      ;(su.uStateSize.value as Vector2).set(stateWidth, stateHeight)
      su.uInit.value = seededFor.current === composition ? 0 : 1
      su.uDt.value = fieldDt
      su.uSeed.value = seed
      su.uFlowSpeed.value = flowSpeed
      gl.setRenderTarget(write)
      gl.render(sim.scene, sim.camera)
      gl.setRenderTarget(null)
      swapped.current = !swapped.current
      seededFor.current = composition
      u.uState.value = write.texture
      ;(u.uStateSize.value as Vector2).set(stateWidth, stateHeight)
    } else {
      // Leaving flow forgets the state, so coming back starts from the grid.
      seededFor.current = ''
    }

    // Render-only look.
    u.uThickness.value = thickness
    u.uMinLength.value = minLength
    u.uMaxLength.value = Math.max(minLength, maxLength)
    u.uLengthBias.value = lengthBias
    u.uFadeIn.value = fadeIn
    u.uFadeOut.value = fadeOut
    u.uFlicker.value = flicker
    u.uFlickerRate.value = flickerRate
    u.uBrightnessSpread.value = brightnessSpread
    u.uOrient.value = orient
    u.uRelief.value = relief
    u.uReliefFloor.value = reliefFloor
    u.uReliefContrast.value = reliefContrast
    u.uReliefLength.value = reliefLength
    u.uPointerGlow.value = pointerGlow
    u.uPointerLift.value = pointerLift

    // Brightness folds into the emissive colour so the fragment stage does
    // one multiply; over paper it is coverage instead (`uDensity`).
    u.uInk.value.fromArray(ink).multiplyScalar(brightness)
    u.uPaperInk.value.fromArray(paperInk)
    u.uDensity.value = brightness
    // Polarity eases rather than steps, so a theme toggle crossfades the
    // streaks from light to ink instead of popping them. The first frame
    // snaps, so a field mounted over paper never opens as light on white.
    const absorb = surface === 'light' ? 1 : 0
    u.uAbsorb.value = absorbSeeded.current
      ? MathUtils.damp(u.uAbsorb.value, absorb, surfaceEase, dt)
      : absorb
    absorbSeeded.current = true
    u.uTail.value = tail
    u.uCap.value = cap
  })

  return (
    // Keyed on the seed buffers and the strip: a new count, seed or segment
    // count needs new attributes on a fresh geometry, not a resized one.
    <instancedMesh
      key={`${count}:${seed}:${planeArgs[2]}`}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <planeGeometry args={planeArgs}>
        <instancedBufferAttribute attach="attributes-aSeed" args={[seeds.primary, SEED_STRIDE]} />
        <instancedBufferAttribute
          attach="attributes-aSeed2"
          args={[seeds.secondary, SEED_STRIDE]}
        />
        <instancedBufferAttribute attach="attributes-aIndex" args={[seeds.index, 1]} />
      </planeGeometry>
      {/* Premultiplied source-over serves both polarities: light streaks
          screen onto the cleared canvas, ink streaks cover it, and the
          crossfade between them needs no blend switch. */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        blending={CustomBlending}
        blendSrc={OneFactor}
        blendDst={OneMinusSrcAlphaFactor}
        blendSrcAlpha={OneFactor}
        blendDstAlpha={OneMinusSrcAlphaFactor}
        depthTest={false}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

/**
 * A field of horizontal light streaks: thousands of GPU particles laid on a
 * fine row grid, each drifting along its row at its own pace, breathing in
 * and out over its own lifetime, and shimmering on its own phase. Reads as a
 * data stream, rain seen side-on, or a tape of signal, depending on how it
 * is tuned.
 *
 * A noise field (`noise`) bends the rows into flows, turns each dash to its
 * direction (`orient`) and shades the field as a height map (`relief`); on
 * the `grid` layout that reads as a tick plot or a topography. The pointer
 * pushes, swirls, drags and lifts that field wherever it goes. The whole
 * simulation is a
 * single instanced draw whose vertex shader derives every particle's state
 * from baked hashes, one time uniform and the eased pointer. Nothing is
 * stepped on the CPU, so the cost is fill rate alone and the field is
 * deterministic for a given `seed`.
 *
 * The ground is the caller's: it fills the nearest positioned ancestor by
 * default, and `surface` says whether that ancestor is dark (the streaks are
 * light) or light (the streaks are ink). Toggling it crossfades rather than
 * pops, so `<StreakField surface={useSiteTheme()} />` rides the theme switch.
 *
 * Renders nothing without a GPU, on low-power devices, or under
 * `prefers-reduced-motion` (see `force`).
 */
export function StreakField({ className, force = false, ...deltas }: StreakFieldProps) {
  const tuning = resolveTuning<StreakFieldTuning>(STREAK_FIELD_DEFAULTS, deltas)
  const { dpr } = tuning
  const interactive = isInteractive(tuning)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<PointerInput>(createPointerInput())
  const { hasGPU } = useDeviceDetection()
  // Off-screen fields keep their context but stop rendering, so one on a
  // section costs nothing while that section is scrolled away.
  const [inView, setInView] = useState(true)

  const dprRange = useMemo<[number, number]>(() => [1, dpr], [dpr])

  const enabled = hasGPU || force

  useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      // Start rendering just before it scrolls in, so it is never caught mid-fade.
      { rootMargin: '10%' },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [enabled])

  useEffect(() => {
    if (!enabled || !interactive) return
    const input = inputRef.current

    // Surface-relative mapping happens in useFrame; the handler only records
    // the raw position, so pointermove never touches layout.
    const onPointerMove = (event: PointerEvent) => {
      input.clientX = event.clientX
      input.clientY = event.clientY
      input.moved = true
      input.present = true
    }
    // pointerleave does not bubble: the root element is where a pointer
    // leaving the viewport reports.
    const onPointerLeave = () => {
      input.present = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      input.present = false
    }
  }, [enabled, interactive])

  if (!enabled) return null

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <Canvas
        dpr={dprRange}
        gl={GL_CONFIG}
        frameloop={inView ? 'always' : 'never'}
        flat
        linear
        resize={RESIZE_OPTIONS}
        style={CANVAS_STYLE}
      >
        <FieldScene rootRef={rootRef} inputRef={inputRef} tuning={tuning} />
      </Canvas>
    </div>
  )
}

'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import cn from 'clsx'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AdditiveBlending, type ShaderMaterial, Vector2, Vector3 } from 'three'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import { resolveTuning } from '../resolve-tuning'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './streak-field-shader'

/**
 * Renders in its own small WebGL canvas (classic renderer) rather than the
 * global one: GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is
 * unsupported (WebGPURenderer only accepts TSL node materials).
 */

/** A 0..1 RGB colour for the streaks. Additive, so it only ever adds light. */
export type StreakFieldInk = readonly [number, number, number]

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

  // Layout
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
  /** Speed of the drift along the rows in CSS px/s. Negative runs leftward; 0 holds still. */
  drift?: number
  /** Per-streak speed variance around the drift, 0..1. */
  driftSpread?: number
  /** Playback rate for everything time-driven. 0 freezes the field. */
  timeScale?: number

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
  /** Streak colour. */
  ink?: StreakFieldInk
  /** Overall brightness multiplier. */
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
  count: 3200,
  dpr: 2,
  seed: 1,

  rowPitch: 14,
  rowJitter: 0.1,
  thickness: 1.8,
  minLength: 6,
  maxLength: 150,
  lengthBias: 2.2,

  drift: -14,
  driftSpread: 0.7,
  timeScale: 1,

  lifetime: 6,
  lifeSpread: 0.6,
  fadeIn: 0.25,
  fadeOut: 0.35,

  ink: [0.9, 0.93, 1],
  brightness: 1,
  brightnessSpread: 0.75,
  flicker: 0.3,
  flickerRate: 0.4,
  tail: 0.55,
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
 * swallows wheel or pointer events over the surface it decorates.
 */
const CANVAS_STYLE: CSSProperties = { pointerEvents: 'none' }
/** Unit quad; the vertex shader sizes and places each instance in device px. */
const PLANE_ARGS: [number, number] = [1, 1]
/** Hash channels per instance, one vec4 per attribute. */
const SEED_STRIDE = 4

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

/** Two vec4 hash buffers per streak, uniform in 0..1. See the shader header for the channel map. */
function createSeeds(count: number, seed: number) {
  const random = createRandom(seed)
  const primary = new Float32Array(count * SEED_STRIDE)
  const secondary = new Float32Array(count * SEED_STRIDE)
  for (let i = 0; i < primary.length; i++) primary[i] = random()
  for (let i = 0; i < secondary.length; i++) secondary[i] = random()
  return { primary, secondary }
}

type FieldSceneProps = {
  /** Caller deltas already resolved against `STREAK_FIELD_DEFAULTS`. */
  tuning: StreakFieldTuning
}

function FieldScene({ tuning }: FieldSceneProps) {
  const {
    count,
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
    ink,
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
  const size = useThree((state) => state.size)
  const pixelRatio = useThree((state) => state.viewport.dpr)

  // Field time, integrated here rather than read off the clock so a change to
  // `timeScale` bends the rate without jumping every streak to a new phase.
  const time = useRef(0)

  const seeds = useMemo(() => createSeeds(count, seed), [count, seed])

  // Initial values only. R3F copies this into the material, so every runtime
  // update goes through materialRef.current.uniforms, never this object.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uDpr: { value: 1 },
      uRowPitch: { value: 14 },
      uRowJitter: { value: 0 },
      uThickness: { value: 1 },
      uMinLength: { value: 1 },
      uMaxLength: { value: 1 },
      uLengthBias: { value: 1 },
      uDrift: { value: 0 },
      uDriftSpread: { value: 0 },
      uLifetime: { value: 1 },
      uLifeSpread: { value: 0 },
      uFadeIn: { value: 0.1 },
      uFadeOut: { value: 0.1 },
      uFlicker: { value: 0 },
      uFlickerRate: { value: 1 },
      uBrightnessSpread: { value: 0 },
      uInk: { value: new Vector3(1, 1, 1) },
      uTail: { value: 0 },
      uHeadSign: { value: 1 },
      uCap: { value: 1 },
    }),
    [],
  )

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms
    // Clamp tab-switch spikes: a multi-second delta would teleport the field.
    time.current += Math.min(delta, 0.05) * timeScale

    u.uTime.value = time.current
    u.uResolution.value.set(size.width * pixelRatio, size.height * pixelRatio)
    u.uDpr.value = pixelRatio

    // Static look. Written here rather than in a prop-change effect because
    // the field always animates: a frame is running anyway, and these float
    // writes cost nothing next to a 20-entry dependency array.
    u.uRowPitch.value = rowPitch
    u.uRowJitter.value = rowJitter
    u.uThickness.value = thickness
    u.uMinLength.value = minLength
    u.uMaxLength.value = Math.max(minLength, maxLength)
    u.uLengthBias.value = lengthBias
    u.uDrift.value = drift
    u.uDriftSpread.value = driftSpread
    u.uLifetime.value = lifetime
    u.uLifeSpread.value = lifeSpread
    u.uFadeIn.value = fadeIn
    u.uFadeOut.value = fadeOut
    u.uFlicker.value = flicker
    u.uFlickerRate.value = flickerRate
    u.uBrightnessSpread.value = brightnessSpread
    // Brightness folds into the colour so the fragment stage does one multiply.
    u.uInk.value.fromArray(ink).multiplyScalar(brightness)
    u.uTail.value = tail
    // The head is the leading end: whichever way the field drifts.
    u.uHeadSign.value = drift < 0 ? -1 : 1
    u.uCap.value = cap
  })

  return (
    // Keyed on the seed buffers: a new count or seed needs new attributes on a
    // fresh geometry, not a resized one.
    <instancedMesh
      key={`${count}:${seed}`}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <planeGeometry args={PLANE_ARGS}>
        <instancedBufferAttribute attach="attributes-aSeed" args={[seeds.primary, SEED_STRIDE]} />
        <instancedBufferAttribute
          attach="attributes-aSeed2"
          args={[seeds.secondary, SEED_STRIDE]}
        />
      </planeGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        blending={AdditiveBlending}
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
 * The whole simulation is a single instanced draw whose vertex shader derives
 * every particle's state from baked hashes and one time uniform. Nothing is
 * stepped on the CPU, so the cost is fill rate alone and the field is
 * deterministic for a given `seed`.
 *
 * The streaks are additive light over a transparent canvas, so the ground is
 * the caller's: it fills the nearest positioned ancestor by default, and that
 * ancestor supplies the black (or whatever dark surface) the field sits on.
 *
 * Renders nothing without a GPU, on low-power devices, or under
 * `prefers-reduced-motion` (see `force`).
 */
export function StreakField({ className, force = false, ...deltas }: StreakFieldProps) {
  const tuning = resolveTuning<StreakFieldTuning>(STREAK_FIELD_DEFAULTS, deltas)
  const { dpr } = tuning
  const rootRef = useRef<HTMLDivElement>(null)
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
        <FieldScene tuning={tuning} />
      </Canvas>
    </div>
  )
}

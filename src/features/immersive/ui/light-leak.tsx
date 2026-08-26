'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import cn from 'clsx'
import type { CSSProperties, RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MathUtils, type ShaderMaterial, Vector2, Vector3 } from 'three'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { resolveTuning } from '../resolve-tuning'
import { LIGHT_LEAK_EXCITE_SELECTOR } from './light-leak-excite'
import { createFragmentShader, VERTEX_SHADER } from './light-leak-shader'

/**
 * Renders in its own small WebGL canvas (classic renderer) rather than the
 * global one: GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is
 * unsupported (WebGPURenderer only accepts TSL node materials).
 */

/** Screen-like blends only: the shader writes an opaque frame whose blacks must drop out. */
export type LightLeakBlendMode = 'screen' | 'plus-lighter' | 'lighten'

/** A 0–2 RGB multiplier, not a colour — values above 1 push the channel hot. */
export type LightLeakTint = readonly [number, number, number]

export type LightLeakProps = {
  /**
   * The element whose `scrollTop` drives the effect. Omit for page scroll
   * (`window.scrollY`) — the usual case for a full-page overlay. Pass a
   * scroller's viewport ref when the leak lives inside its own scroll
   * container, so it reacts to that container instead of the page.
   */
  scrollSource?: RefObject<HTMLElement | null>
  /**
   * Mounts the canvas even when the device is flagged low-power or the visitor
   * prefers reduced motion. For demos and stories — never for shipped pages.
   */
  force?: boolean
  /** Placement. Defaults to filling the nearest positioned ancestor. */
  className?: string

  // — Canvas —
  /**
   * Dispersion smoothing samples. The field is evaluated `samples * 6` times
   * per pixel, so this is the single biggest lever on GPU cost: drop it for
   * secondary or small-area usage.
   */
  samples?: number
  /** Device-pixel-ratio cap. The leak is all low-frequency light, so 1 is usually enough. */
  dpr?: number
  /** How the overlay composites over the content beneath it. */
  blendMode?: LightLeakBlendMode

  // — Time & shape —
  /** Speed of the leak's idle drift. 0 freezes the field. */
  timeScale?: number
  /** How much noise melts the blobs into organic film. 0 stays geometric. */
  warpAmount?: number
  /** Size of the warp wrinkles. Higher is tighter and noisier. */
  warpScale?: number

  // — Scroll response —
  /** Scroll speed in px/s that counts as a full-strength flick. */
  scrollSpeed?: number
  /** Response shape. Below 1 reacts to the slightest movement, above 1 waits for a hard flick. */
  scrollCurve?: number
  /** How fast scroll velocity dies after you stop. Higher settles sooner. */
  scrollDecay?: number
  /** Master strength of everything scrolling drives — brightness, split, morph. */
  scrollIntensity?: number
  /** How quickly the leak eases toward the current scroll energy. */
  scrollSmooth?: number
  /** How far the leak field physically slides as you scroll. */
  scrollDrift?: number
  /** How much scrolling kneads the field into a different shape. */
  morph?: number
  /** Size of the scroll-driven wrinkles. Higher is tighter and more turbulent. */
  morphScale?: number

  // — Hover excitement —
  /** Whether elements marked `data-leak-excite` flare the leak on hover. */
  excite?: boolean
  /** How fast excitement eases in and out. Low keeps the flare a wash, not a flash. */
  exciteEase?: number
  /** How fast the gathered light follows the pointer. */
  pointerEase?: number
  /** Light that gathers under the pointer while hovering an excite target. */
  hoverBloom?: number

  // — Dispersion —
  /** Resting rainbow split when nothing is moving. */
  dispersion?: number
  /** Extra spectral split added by scrolling. */
  dispersionEnergy?: number
  /** Extra spectral split added by hovering an excite target. */
  dispersionExcite?: number
  /** Axis the spectrum slides along. Red bends least, violet most. */
  dispersionDirection?: readonly [number, number]

  // — Look —
  /** Overall brightness of the leak overlay. */
  gain?: number
  /** Extra brightness added by scrolling. */
  gainEnergy?: number
  /** Extra brightness added by hovering an excite target. */
  gainExcite?: number
  /** Colour punch. 0 is gray, above 1 is oversaturated. */
  saturation?: number
  /** Extra colour punch while hovering an excite target. */
  saturationExcite?: number
  /** Film grain, only where the leak is visible. */
  grain?: number
  /** Extra grain in the bright core of the leak. */
  grainLuminance?: number
  /** Darkens the corners of the overlay. */
  vignette?: number
  /** Tint on dim leak — the teal / shadow side. */
  coolTint?: LightLeakTint
  /** Tint on bright leak — the rose / highlight side. */
  warmTint?: LightLeakTint
  /** Hot colour dumped into the brightest core. */
  amber?: LightLeakTint

  // — Field —
  /** Strength of the lower-left warm bloom. */
  blobWarm?: number
  /** Strength of the long seam leak. */
  streak?: number
  /** Direction of the seam. 0 is horizontal, ±π/2 is vertical. */
  streakAngle?: number
  /** Thickness of the seam. Lower is a razor leak, higher is a wash. */
  streakSpread?: number
  /** Strength of the upper-right cool bloom. */
  blobCool?: number
  /** Strength of the blinds / stained-glass bars. */
  slats?: number
  /** Direction of the bars. */
  slatAngle?: number
  /** Width of the ray fan at its top end. */
  slatTopSpread?: number
  /** Width of the ray fan at its bottom end. Differ from the top and the bars splay. */
  slatBottomSpread?: number
  /** How many bars. Higher is tighter stripes. */
  slatFrequency?: number
  /** Extra bars while hovering an excite target. */
  slatFrequencyExcite?: number
  /** Edge hardness. Low is soft bands, high is hard blinds. */
  slatSharpness?: number
}

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site, and shipped
 * looks live as delta-only presets in `../presets.ts`.
 */
export const LIGHT_LEAK_DEFAULTS = {
  samples: 6,
  dpr: 1,
  blendMode: 'plus-lighter',

  timeScale: 1.59,
  warpAmount: 0.07,
  warpScale: 1.2,

  scrollSpeed: 500,
  scrollCurve: 1,
  scrollDecay: 9.9,
  scrollIntensity: 0.18,
  scrollSmooth: 3.6,
  scrollDrift: 0.56,
  morph: 0.12,
  morphScale: 5,

  excite: true,
  exciteEase: 2.2,
  pointerEase: 5,
  hoverBloom: 0.14,

  dispersion: 0.043,
  dispersionEnergy: 0.064,
  dispersionExcite: 0.009,
  dispersionDirection: [2.1, 1.9],

  gain: 0.29,
  gainEnergy: 1.28,
  gainExcite: 0.1,
  saturation: 0.41,
  saturationExcite: 0.21,
  grain: 0.03,
  grainLuminance: 0.039,
  vignette: 2,
  coolTint: [0.21, 0.31, 1.1],
  warmTint: [1.85, 1, 0.68],
  amber: [0.01, 0.32, 0.32],

  blobWarm: 0,
  streak: 0.34,
  streakAngle: -0.26,
  streakSpread: 0.335,
  blobCool: 0.32,
  slats: 0.2,
  slatAngle: -0.65,
  slatTopSpread: 0.05,
  slatBottomSpread: 1.2,
  slatFrequency: 23,
  slatFrequencyExcite: 6.5,
  slatSharpness: 1,
} as const satisfies Partial<LightLeakProps>

/**
 * Every knob with its default filled in — what the scene actually reads, once
 * `resolveTuning` has folded the caller's deltas into `LIGHT_LEAK_DEFAULTS`.
 */
type LightLeakTuning = Required<Pick<LightLeakProps, keyof typeof LIGHT_LEAK_DEFAULTS>>

// Hoisted so JSX never allocates fresh objects per render (perf-avoid-inline-objects).
const GL_CONFIG = { antialias: false, powerPreference: 'high-performance' } as const
const RESIZE_OPTIONS = { scroll: false, debounce: 200 } as const
/**
 * R3F writes `pointer-events: auto` inline on its container, and a
 * `pointer-events: none` ancestor does NOT stop a descendant that sets `auto`
 * from being a hit target. Left alone, the overlay swallows every wheel and
 * pointer event over the surface it decorates — and because it is a *sibling*
 * of the scroller it covers, those wheel events never reach the scroll
 * container at all. This overrides that inline style.
 */
const CANVAS_STYLE: CSSProperties = { pointerEvents: 'none' }
/** Clip-space fullscreen quad: the vertex shader bypasses the camera entirely. */
const PLANE_ARGS: [number, number] = [2, 2]
/** Velocity clamp in px/s — a hard flick, past which the response saturates anyway. */
const MAX_SCROLL_VELOCITY = 3000

/**
 * Smoothed scroll response, carried between frames. One object rather than
 * four refs: it is a single integrator, and every field advances together.
 */
type LeakScrollState = {
  last: number | null
  velocity: number
  energy: number
  phase: number
}

/**
 * One frame of the scroll response: velocity in px/s off whichever scroller
 * drives the overlay, damped, run through the response curve, then folded
 * into the energy the look reads and the phase that slides the field along.
 */
function stepScrollResponse(
  state: LeakScrollState,
  scrollY: number,
  dt: number,
  tuning: LightLeakTuning,
) {
  if (state.last === null) state.last = scrollY
  const raw = MathUtils.clamp(
    (scrollY - state.last) / Math.max(dt, 1 / 240),
    -MAX_SCROLL_VELOCITY,
    MAX_SCROLL_VELOCITY,
  )
  state.last = scrollY

  state.velocity = MathUtils.damp(state.velocity, raw, tuning.scrollDecay, dt)
  const signal = MathUtils.clamp(state.velocity / tuning.scrollSpeed, -1, 1)
  // Response curve, kept signed so scroll direction still drives phase.
  const shaped = Math.sign(signal) * Math.abs(signal) ** tuning.scrollCurve

  state.energy = MathUtils.damp(
    state.energy,
    Math.abs(shaped) * tuning.scrollIntensity,
    tuning.scrollSmooth,
    dt,
  )
  state.phase += shaped * tuning.scrollDrift * dt
}

/**
 * Read the overlay rect only on frames where the pointer actually moved: idle
 * frames cost no layout, and the rect stays correct for an overlay that
 * scrolls with its section.
 */
function refreshOverlayPointer(input: LeakInput, root: HTMLDivElement | null) {
  if (!input.moved) return
  input.moved = false
  const rect = root?.getBoundingClientRect()
  if (!rect || rect.width === 0 || rect.height === 0) return
  input.x = (input.clientX - rect.left) / rect.width
  input.y = 1 - (input.clientY - rect.top) / rect.height
}

/** Normalized on the CPU so the fragment stage skips a per-pixel normalize. */
function setDispersionDirection(target: Vector2, direction: readonly [number, number]) {
  const [x, y] = direction
  if (Math.hypot(x, y) > 1e-4) target.set(x, y).normalize()
  else target.set(0.55, 1).normalize()
}

/**
 * Pointer and hover state, mutated by DOM listeners and read in `useFrame`.
 * A ref rather than state: these change on every pointer event and must never
 * re-render React (perf-never-set-state-in-useframe).
 */
type LeakInput = {
  clientX: number
  clientY: number
  /** Set by pointermove; makes the frame re-read the overlay rect exactly once. */
  moved: boolean
  /** Overlay-relative pointer, 0..1, y-up (GL convention). */
  x: number
  y: number
  exciteTarget: number
}

type LeakSceneProps = {
  rootRef: RefObject<HTMLDivElement | null>
  inputRef: RefObject<LeakInput>
  scrollSource: LightLeakProps['scrollSource']
  /** Caller deltas already resolved against `LIGHT_LEAK_DEFAULTS`. */
  tuning: LightLeakTuning
}

function LeakScene({ rootRef, inputRef, scrollSource, tuning }: LeakSceneProps) {
  const {
    samples,
    timeScale,
    warpAmount,
    warpScale,
    morph,
    morphScale,
    exciteEase,
    pointerEase,
    hoverBloom,
    dispersion,
    dispersionEnergy,
    dispersionExcite,
    dispersionDirection,
    gain,
    gainEnergy,
    gainExcite,
    saturation,
    saturationExcite,
    grain,
    grainLuminance,
    vignette,
    coolTint,
    warmTint,
    amber,
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
  } = tuning

  const materialRef = useRef<ShaderMaterial>(null)
  // Atomic selectors: a bare useThree() re-renders on any R3F state change
  // (perf-zustand-selectors).
  const size = useThree((state) => state.size)
  const pixelRatio = useThree((state) => state.viewport.dpr)

  // Refs, not state — these update every frame.
  const scroll = useRef<LeakScrollState>({ last: null, velocity: 0, energy: 0, phase: 0 })
  const excite = useRef(0)

  const fragmentShader = useMemo(() => createFragmentShader(samples), [samples])

  // Initial values only — R3F copies this into the material, so every runtime
  // update goes through materialRef.current.uniforms, never this object.
  const uniforms = useMemo(
    () => ({
      uT: { value: 0 },
      uPhase: { value: 0 },
      uGrainSeed: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uPointer: { value: new Vector2(0.5, 0.5) },
      uWarpAmount: { value: 0 },
      uWarpScale: { value: 1 },
      uMorphAmt: { value: 0 },
      uMorphScale: { value: 1 },
      uDispAmt: { value: 0 },
      uDispDir: { value: new Vector2(0.55, 1).normalize() },
      uGainTotal: { value: 0 },
      uSatTotal: { value: 0 },
      uGrain: { value: 0 },
      uGrainLum: { value: 0 },
      uVignette: { value: 0 },
      uCoolTint: { value: new Vector3(1, 1, 1) },
      uWarmTint: { value: new Vector3(1, 1, 1) },
      uAmber: { value: new Vector3(0, 0, 0) },
      uBlobWarm: { value: 0 },
      uBlobStreak: { value: 0 },
      uStreakAngle: { value: 0 },
      uStreakSpread: { value: 0.1 },
      uBlobCool: { value: 0 },
      uSlats: { value: 0 },
      uSlatAngle: { value: 0 },
      uSlatTopSpread: { value: 0.3 },
      uSlatBottomSpread: { value: 0.3 },
      uSlatRefSpread: { value: 0.3 },
      uSlatFreq: { value: 24 },
      uSlatSharp: { value: 1 },
      uHoverAmt: { value: 0 },
    }),
    [],
  )

  useFrame((state, delta) => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms
    // Clamp tab-switch spikes: a multi-second delta would jump the whole
    // response in one frame.
    const dt = Math.min(delta, 0.05)

    const element = scrollSource?.current
    stepScrollResponse(scroll.current, element ? element.scrollTop : window.scrollY, dt, tuning)

    // — Hover excitement eases in and out slowly, so the flare is a wash.
    const input = inputRef.current
    excite.current = MathUtils.damp(excite.current, input.exciteTarget, exciteEase, dt)

    refreshOverlayPointer(input, rootRef.current)
    u.uPointer.value.set(
      MathUtils.damp(u.uPointer.value.x, input.x, pointerEase, dt),
      MathUtils.damp(u.uPointer.value.y, input.y, pointerEase, dt),
    )

    const e = scroll.current.energy
    const x = excite.current

    // — Resolved values. Every curve that mixes energy or excitement into a
    // parameter is folded here rather than in the shader, so the response math
    // lives in one readable place and the fragment stage does less work.
    u.uT.value = state.clock.elapsedTime * timeScale + scroll.current.phase
    u.uPhase.value = scroll.current.phase
    u.uGrainSeed.value = state.clock.elapsedTime
    u.uResolution.value.set(size.width * pixelRatio, size.height * pixelRatio)

    u.uDispAmt.value = dispersion + e * dispersionEnergy + x * dispersionExcite
    u.uGainTotal.value = gain + e * gainEnergy + x * gainExcite
    u.uSatTotal.value = saturation + x * saturationExcite
    u.uSlatFreq.value = slatFrequency + x * slatFrequencyExcite
    u.uMorphAmt.value = morph * e
    u.uHoverAmt.value = x * hoverBloom

    setDispersionDirection(u.uDispDir.value, dispersionDirection)

    // — Static look. Written here rather than in a prop-change effect (as the
    // demand-frameloop effects do) because this overlay always animates: a
    // frame is running anyway, and ~20 float writes on it cost nothing next to
    // a 30-entry dependency array.
    u.uWarpAmount.value = warpAmount
    u.uWarpScale.value = warpScale
    u.uMorphScale.value = morphScale
    u.uGrain.value = grain
    u.uGrainLum.value = grainLuminance
    u.uVignette.value = vignette
    u.uCoolTint.value.fromArray(coolTint)
    u.uWarmTint.value.fromArray(warmTint)
    u.uAmber.value.fromArray(amber)
    u.uBlobWarm.value = blobWarm
    u.uBlobStreak.value = streak
    u.uStreakAngle.value = streakAngle
    u.uStreakSpread.value = streakSpread
    u.uBlobCool.value = blobCool
    u.uSlats.value = slats
    u.uSlatAngle.value = slatAngle
    u.uSlatTopSpread.value = slatTopSpread
    u.uSlatBottomSpread.value = slatBottomSpread
    // Folded here: both ends are uniforms, so the fan's reference width is
    // constant across the draw.
    u.uSlatRefSpread.value = 0.5 * (slatTopSpread + slatBottomSpread)
    u.uSlatSharp.value = slatSharpness
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={PLANE_ARGS} />
      {/* Keyed on the shader source: the sample count is a #define, so a new
          tier needs a new program rather than a mutated one. */}
      <shaderMaterial
        key={fragmentShader}
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

/**
 * A film light-leak overlay: a single GLSL pass of spectral dispersion sampled
 * in six wavelengths, warped by fbm noise and composited over whatever sits
 * beneath it with a screen-like blend.
 *
 * Scrolling agitates it — velocity drives brightness, spectral split and a
 * domain-warp morph, and slides the field along. Hovering any element marked
 * `data-leak-excite` gathers light under the pointer.
 *
 * Placement is the caller's: it fills the nearest positioned ancestor by
 * default, so a section overlay is `<section className="relative isolate">`
 * with the leak inside, and a page overlay is `className="fixed inset-0 z-10"`.
 * `isolate` matters — without it the blend reaches past the intended backdrop.
 *
 * Renders nothing without a GPU, on low-power devices, or under
 * `prefers-reduced-motion` (see `force`).
 */
export function LightLeak({ className, force = false, scrollSource, ...deltas }: LightLeakProps) {
  const tuning = resolveTuning<LightLeakTuning>(LIGHT_LEAK_DEFAULTS, deltas)
  const { blendMode, dpr, excite } = tuning
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<LeakInput>({
    clientX: 0,
    clientY: 0,
    moved: false,
    x: 0.5,
    y: 0.5,
    exciteTarget: 0,
  })
  const { hasGPU } = useDeviceDetection()
  // Off-screen overlays keep their context but stop rendering, so a leak on a
  // section costs nothing while that section is scrolled away.
  const [inView, setInView] = useState(true)

  const dprRange = useMemo<[number, number]>(() => [1, dpr], [dpr])
  const canvasStyle = useMemo<CSSProperties>(() => ({ mixBlendMode: blendMode }), [blendMode])

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
    if (!enabled || !excite) return
    const input = inputRef.current

    // Overlay-relative mapping happens in useFrame; the handler only records
    // the raw position, so pointermove never touches layout.
    const onPointerMove = (event: PointerEvent) => {
      input.clientX = event.clientX
      input.clientY = event.clientY
      input.moved = true
    }
    const onPointerOver = (event: PointerEvent) => {
      if ((event.target as Element | null)?.closest(LIGHT_LEAK_EXCITE_SELECTOR))
        input.exciteTarget = 1
    }
    const onPointerOut = (event: PointerEvent) => {
      const to = event.relatedTarget as Element | null
      if (!to?.closest(LIGHT_LEAK_EXCITE_SELECTOR)) input.exciteTarget = 0
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('pointerout', onPointerOut)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerout', onPointerOut)
      input.exciteTarget = 0
    }
  }, [enabled, excite])

  if (!enabled) return null

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={canvasStyle}
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
        <LeakScene
          rootRef={rootRef}
          inputRef={inputRef}
          scrollSource={scrollSource}
          tuning={tuning}
        />
      </Canvas>
    </div>
  )
}

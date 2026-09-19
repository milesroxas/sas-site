'use client'

import { useFrame, useThree } from '@react-three/fiber'
import type { CSSProperties, RefObject } from 'react'
import { useMemo, useRef } from 'react'
import { MathUtils, type ShaderMaterial, Vector2, Vector3 } from 'three'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import { LIGHT_LEAK_EXCITE_SELECTOR } from './light-leak-excite'
import { createFragmentShader, VERTEX_SHADER } from './light-leak-shader'
import {
  isAbsorptive,
  type LeakMirror,
  type LightLeakProps,
  type LightLeakTuning,
  NO_MIRROR,
} from './light-leak-tuning'

/**
 * The light leak's scene and its DOM input, apart from any canvas: the page
 * overlay and the visual slot mount it through `./light-leak-runtime`, and the
 * Studio mounts it in an offscreen canvas to render posters.
 */

// Hoisted so JSX never allocates fresh objects per render (perf-avoid-inline-objects).
export const LEAK_GL_CONFIG = { antialias: false, powerPreference: 'high-performance' } as const
export const LEAK_RESIZE_OPTIONS = { ...CANVAS_RESIZE, scroll: false, debounce: 200 } as const
/**
 * R3F writes `pointer-events: auto` inline on its container, and a
 * `pointer-events: none` ancestor does NOT stop a descendant that sets `auto`
 * from being a hit target. Left alone, the overlay swallows every wheel and
 * pointer event over the surface it decorates, and because it is a *sibling*
 * of the scroller it covers, those wheel events never reach the scroll
 * container at all. This overrides that inline style.
 */
export const LEAK_CANVAS_STYLE: CSSProperties = { pointerEvents: 'none' }
/** Clip-space fullscreen quad: the vertex shader bypasses the camera entirely. */
const PLANE_ARGS: [number, number] = [2, 2]
/** Velocity clamp in px/s: a hard flick, past which the response saturates anyway. */
const MAX_SCROLL_VELOCITY = 3000
/** Tab-switch spikes clamp here: a multi-second delta would jump the whole response in one frame. */
const MAX_DELTA = 0.05

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
 * Pointer and hover state, mutated by DOM listeners and read in `useFrame`.
 * A ref rather than state: these change on every pointer event and must never
 * re-render React (perf-never-set-state-in-useframe).
 */
export type LeakInput = {
  clientX: number
  clientY: number
  /** Set by pointermove; makes the frame re-read the overlay rect exactly once. */
  moved: boolean
  /** Overlay-relative pointer, 0..1, y-up (GL convention). */
  x: number
  y: number
  exciteTarget: number
}

export const createLeakInput = (): LeakInput => ({
  clientX: 0,
  clientY: 0,
  moved: false,
  x: 0.5,
  y: 0.5,
  exciteTarget: 0,
})

/**
 * Listen for the pointer and for hover over `data-leak-excite` targets.
 * Overlay-relative mapping happens in `useFrame`; the handlers only record
 * the raw position, so pointermove never touches layout.
 */
export function bindLeakInput(input: LeakInput): () => void {
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
}

/**
 * Read the overlay rect only on frames where the pointer actually moved: idle
 * frames cost no layout, and the rect stays correct for an overlay that
 * scrolls with its section.
 */
function refreshOverlayPointer(input: LeakInput, root: HTMLElement | null) {
  if (!input.moved) return
  input.moved = false
  const rect = root?.getBoundingClientRect()
  if (!rect || rect.width === 0 || rect.height === 0) return
  input.x = (input.clientX - rect.left) / rect.width
  input.y = 1 - (input.clientY - rect.top) / rect.height
}

/** Normalized on the CPU so the fragment stage skips a per-pixel normalize. */
function setDispersionDirection(
  target: Vector2,
  direction: readonly [number, number],
  mirror: LeakMirror,
) {
  const x = mirror[0] ? -direction[0] : direction[0]
  const y = mirror[1] ? -direction[1] : direction[1]
  if (Math.hypot(x, y) > 1e-4) target.set(x, y).normalize()
  else target.set(0.55, 1).normalize()
}

export type LeakSceneProps = {
  rootRef: RefObject<HTMLElement | null>
  inputRef: RefObject<LeakInput>
  scrollSource?: LightLeakProps['scrollSource']
  /** Caller deltas already resolved against `LIGHT_LEAK_DEFAULTS`. */
  tuning: LightLeakTuning
  mirror?: LeakMirror
  /** Signals once, after the first frame's draw has been issued. */
  onFirstFrame?: () => void
  /**
   * Step time by this many seconds per frame instead of the clock, and ignore
   * page scroll. A capture stepped this way draws the same frame every time.
   */
  fixedDelta?: number
}

export function LeakScene({
  rootRef,
  inputRef,
  scrollSource,
  tuning,
  mirror = NO_MIRROR,
  onFirstFrame,
  fixedDelta,
}: LeakSceneProps) {
  const {
    samples,
    blendMode,
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
    inkChroma,
    inkDensity,
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

  // Refs, not state: these update every frame.
  const scroll = useRef<LeakScrollState>({ last: null, velocity: 0, energy: 0, phase: 0 })
  const excite = useRef(0)
  // Field time is integrated, never `elapsed * timeScale`: a multiplier that
  // changes while the field runs (the Studio's slider, an editor's speed)
  // would otherwise rescale all the time that has already passed and the
  // field would jump. `elapsed` is the unscaled twin the grain reads.
  const time = useRef({ field: 0, elapsed: 0 })
  const framesDrawn = useRef(0)

  const fragmentShader = useMemo(() => createFragmentShader(samples), [samples])

  // Initial values only: R3F copies this into the material, so every runtime
  // update goes through materialRef.current.uniforms, never this object.
  const uniforms = useMemo(
    () => ({
      uT: { value: 0 },
      uPhase: { value: 0 },
      uGrainSeed: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uPointer: { value: new Vector2(0.5, 0.5) },
      uMirror: { value: new Vector2(0, 0) },
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
      uAbsorb: { value: 0 },
      uInkChroma: { value: 1 },
      uInkDensity: { value: 0 },
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

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms
    const dt = Math.min(fixedDelta ?? delta, MAX_DELTA)
    time.current.field += dt * timeScale
    time.current.elapsed += dt

    // A fixed-step capture has no page under it: the field rests.
    if (fixedDelta === undefined) {
      const element = scrollSource?.current
      stepScrollResponse(scroll.current, element ? element.scrollTop : window.scrollY, dt, tuning)
    }

    // Hover excitement eases in and out slowly, so the flare is a wash.
    const input = inputRef.current
    excite.current = MathUtils.damp(excite.current, input.exciteTarget, exciteEase, dt)

    refreshOverlayPointer(input, rootRef.current)
    // The pointer is mapped in the element's own box; the field it lands on
    // may be mirrored.
    const pointerX = mirror[0] ? 1 - input.x : input.x
    const pointerY = mirror[1] ? 1 - input.y : input.y
    u.uPointer.value.set(
      MathUtils.damp(u.uPointer.value.x, pointerX, pointerEase, dt),
      MathUtils.damp(u.uPointer.value.y, pointerY, pointerEase, dt),
    )
    u.uMirror.value.set(mirror[0] ? 1 : 0, mirror[1] ? 1 : 0)

    const e = scroll.current.energy
    const x = excite.current

    // Resolved values. Every curve that mixes energy or excitement into a
    // parameter is folded here rather than in the shader, so the response math
    // lives in one readable place and the fragment stage does less work.
    u.uT.value = time.current.field + scroll.current.phase
    u.uPhase.value = scroll.current.phase
    u.uGrainSeed.value = time.current.elapsed
    u.uResolution.value.set(size.width * pixelRatio, size.height * pixelRatio)

    u.uDispAmt.value = dispersion + e * dispersionEnergy + x * dispersionExcite
    u.uGainTotal.value = gain + e * gainEnergy + x * gainExcite
    u.uSatTotal.value = saturation + x * saturationExcite
    u.uSlatFreq.value = slatFrequency + x * slatFrequencyExcite
    u.uMorphAmt.value = morph * e
    u.uHoverAmt.value = x * hoverBloom

    setDispersionDirection(u.uDispDir.value, dispersionDirection, mirror)

    // Static look. Written here rather than in a prop-change effect (as the
    // demand-frameloop effects do) because this overlay always animates: a
    // frame is running anyway, and ~20 float writes on it cost nothing next to
    // a 30-entry dependency array.
    u.uWarpAmount.value = warpAmount
    u.uWarpScale.value = warpScale
    u.uMorphScale.value = morphScale
    u.uGrain.value = grain
    u.uGrainLum.value = grainLuminance
    u.uVignette.value = vignette
    // Polarity is a uniform rather than a #define on purpose: a theme toggle
    // must not relink the program mid-session (a new material, a compile stall
    // and a dropped frame) when a coherent branch costs nothing.
    u.uAbsorb.value = isAbsorptive(blendMode) ? 1 : 0
    u.uInkChroma.value = inkChroma
    u.uInkDensity.value = inkDensity
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

    // R3F draws after this callback returns; the next animation frame is the
    // earliest moment that draw has been issued, so readiness waits for it.
    if (framesDrawn.current === 0) {
      framesDrawn.current = 1
      if (onFirstFrame) requestAnimationFrame(() => onFirstFrame())
    }
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

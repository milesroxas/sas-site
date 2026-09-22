'use client'

import { invalidate, useFrame, useThree } from '@react-three/fiber'
import type { CSSProperties, RefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
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
  WebGLRenderTarget,
} from 'three'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import {
  FRAGMENT_SHADER,
  SIM_FRAGMENT_SHADER,
  SIM_VERTEX_SHADER,
  STREAK_FIELD_MAX_OCTAVES,
  STREAK_FIELD_NOISES,
  VERTEX_SHADER,
} from './streak-field-shader'
import type { StreakFieldTuning } from './streak-field-tuning'

/**
 * The Streak Field scene, apart from canvas ownership: `StreakField` (the
 * demo and story wrapper) and `StreakFieldRuntime` (the poster-first
 * production owner) both mount it inside their own classic WebGL canvas.
 * Classic on purpose: the global canvas prefers WebGPU, where raw GLSL
 * `ShaderMaterial` is unsupported.
 */

// Hoisted so JSX never allocates fresh objects per render (perf-avoid-inline-objects).
export const STREAK_RESIZE_OPTIONS = { ...CANVAS_RESIZE, scroll: false, debounce: 200 } as const
/**
 * R3F writes `pointer-events: auto` inline on its container, and a
 * `pointer-events: none` ancestor does NOT stop a descendant that sets `auto`
 * from being a hit target. This overrides that inline style so the field never
 * swallows wheel or pointer events over the surface it decorates. The pointer
 * is read off the window instead.
 */
export const STREAK_CANVAS_STYLE: CSSProperties = { pointerEvents: 'none' }
/** Hash channels per instance, one vec4 per attribute. */
const SEED_STRIDE = 4
/** Delta cap: a multi-second tab-switch delta would teleport the field. */
const MAX_DELTA = 0.05
/** Uniform eases below this distance from their target count as settled. */
const SETTLE_EPSILON = 1e-3

/** Flow state is one texel per particle, laid out in a near-square texture. */
function stateSize(count: number): [number, number] {
  const width = Math.max(1, Math.ceil(Math.sqrt(count)))
  return [width, Math.max(1, Math.ceil(count / width))]
}

/**
 * The texel type the flow state can be rendered to, or null when the context
 * cannot render to a floating-point target at all (then `flow` looks are
 * unsupported and the owner shows the poster). Positions live in 0..1 of the
 * frame, so half floats (11-bit mantissa) would jitter by a pixel on a wide
 * canvas: full float wherever renderable, half float as the fallback.
 */
export function flowStateType(gl: WebGLRenderer) {
  if (gl.capabilities.isWebGL2) {
    if (gl.extensions.has('EXT_color_buffer_float')) return FloatType
    if (gl.extensions.has('EXT_color_buffer_half_float')) return HalfFloatType
    return null
  }
  if (gl.extensions.has('OES_texture_float') && gl.extensions.has('WEBGL_color_buffer_float')) {
    return FloatType
  }
  if (
    gl.extensions.has('OES_texture_half_float') &&
    gl.extensions.has('EXT_color_buffer_half_float')
  ) {
    return HalfFloatType
  }
  return null
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
 * `Math.random` would reshuffle every mount and every snapshot.
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
export type PointerInput = {
  clientX: number
  clientY: number
  /** Set by pointermove, scroll and resize; makes the frame re-read the surface rect once. */
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

export function createPointerInput(): PointerInput {
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
 * Read the surface rect only on frames where the pointer, the scroll
 * position or the viewport actually changed: idle frames cost no layout, and
 * the rect stays correct for a field that scrolls under a stationary pointer.
 */
function refreshPointer(input: PointerInput, root: HTMLElement | null) {
  if (!input.moved) return
  input.moved = false
  const rect = root?.getBoundingClientRect()
  if (!rect || rect.width === 0 || rect.height === 0) return
  input.x = (input.clientX - rect.left) / rect.width
  input.y = 1 - (input.clientY - rect.top) / rect.height
  input.inside = input.x >= 0 && input.x <= 1 && input.y >= 0 && input.y <= 1
}

/**
 * Wire the window pointer into a `PointerInput`. Handlers only record the raw
 * position; the surface-relative mapping happens in the frame, so nothing
 * here touches layout. Scroll and resize mark the rect stale so a stationary
 * pointer stays on the right spot while the field moves under it.
 */
export function bindPointerInput(input: PointerInput): () => void {
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
  const onMoved = () => {
    input.moved = true
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('scroll', onMoved, { passive: true, capture: true })
  window.addEventListener('resize', onMoved, { passive: true })
  document.documentElement.addEventListener('pointerleave', onPointerLeave)
  return () => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('scroll', onMoved, { capture: true })
    window.removeEventListener('resize', onMoved)
    document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    input.present = false
  }
}

/** Whether any pointer term can move or light the field, so idle pages skip the listeners. */
export function isInteractive(tuning: StreakFieldTuning) {
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

/**
 * Whether the field changes on its own from frame to frame. A frozen field
 * with no pointer terms draws once per change and then rests (the owner
 * runs the loop on demand); anything else needs a running loop.
 */
export function isAnimated(tuning: StreakFieldTuning) {
  return tuning.timeScale > 0 || isInteractive(tuning)
}

/**
 * Grid density that still covers the frame. Capping `count` below the cells
 * the pitch asks for would truncate rows at the bottom; widening both
 * pitches by the same factor keeps every row and column populated at a
 * coarser grid instead. Rows layouts scatter by hash and need no help.
 */
export function coveragePitch(
  tuning: Pick<StreakFieldTuning, 'count' | 'layout' | 'columnPitch' | 'rowPitch'>,
  width: number,
  height: number,
): { columnPitch: number; rowPitch: number } {
  const columnPitch = Math.max(1, tuning.columnPitch)
  const rowPitch = Math.max(1, tuning.rowPitch)
  if (tuning.layout !== 'grid' || width <= 0 || height <= 0) return { columnPitch, rowPitch }
  const cells = Math.floor(width / columnPitch) * Math.floor(height / rowPitch)
  if (cells <= tuning.count) return { columnPitch, rowPitch }
  const scale = Math.sqrt(cells / tuning.count)
  return { columnPitch: columnPitch * scale, rowPitch: rowPitch * scale }
}

export type FieldSceneProps = {
  rootRef: RefObject<HTMLElement | null>
  inputRef: RefObject<PointerInput>
  /** Caller deltas already resolved against `STREAK_FIELD_DEFAULTS`. */
  tuning: StreakFieldTuning
  /**
   * Called once the first frame for this mount has been drawn. Owners reveal
   * the canvas on it; compilation alone is not readiness.
   */
  onFirstFrame?: () => void
  /** `flow` was requested but the context has no renderable float target. */
  onFlowUnsupported?: () => void
  /** Capture owners advance a fixed simulation step; website owners omit it. */
  fixedDelta?: number
}

export function FieldScene({
  rootRef,
  inputRef,
  tuning,
  onFirstFrame,
  onFlowUnsupported,
  fixedDelta,
}: FieldSceneProps) {
  const {
    count,
    seed,
    segments,
    surface,
    surfaceEase,
    layout,
    shape,
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
  const frameloop = useThree((state) => state.frameloop)

  // Field time, integrated here rather than read off the clock so a change to
  // `timeScale` bends the rate without jumping every streak to a new phase.
  const time = useRef(0)
  // Eased pointer velocity, device px/s. Kept off the uniforms so a resize
  // (which rescales the position) never spikes it.
  const velocity = useRef(new Vector2())
  const absorbSeeded = useRef(false)
  const framesDrawn = useRef(0)
  const flowRejected = useRef(false)

  const seeds = useMemo(() => createSeeds(count, seed), [count, seed])

  // Flow simulation, created only for `flow` motion: two state targets
  // swapped every step, a full-screen quad that writes one, and the last
  // composition the state was seeded for. Nearest sampling: a texel is a
  // particle, never a blend of two. Drift looks allocate none of it.
  const flowing = motion === 'flow'
  const [stateWidth, stateHeight] = stateSize(count)
  const stateType = useMemo(() => flowStateType(gl), [gl])
  const flow = useMemo(() => {
    if (!flowing || stateType === null) return null
    const options = {
      type: stateType,
      format: RGBAFormat,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    }
    const targets = [
      new WebGLRenderTarget(stateWidth, stateHeight, options),
      new WebGLRenderTarget(stateWidth, stateHeight, options),
    ] as const
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
    return { targets, material, geometry, scene, camera, swapped: false, seededFor: '' }
  }, [flowing, stateType, stateWidth, stateHeight])
  useEffect(() => {
    if (!flow) return
    return () => {
      flow.material.dispose()
      flow.geometry.dispose()
      for (const target of flow.targets) target.dispose()
    }
  }, [flow])
  useEffect(() => {
    if (flowing && stateType === null && !flowRejected.current) {
      flowRejected.current = true
      onFlowUnsupported?.()
    }
  }, [flowing, stateType, onFlowUnsupported])

  const planeArgs = useMemo<[number, number, number, number]>(
    () => [1, 1, Math.max(1, Math.round(segments)), 1],
    [segments],
  )

  // Initial values only. R3F copies this into the material, so every runtime
  // update goes through materialRef.current.uniforms, never this object.
  const uniforms = useMemo(
    () => ({
      ...createSharedUniforms(),
      uShape: { value: 0 },
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

  // On-demand owners draw only when asked: every tuning change is a reason,
  // and the frame below keeps asking while an ease is still settling.
  useEffect(() => {
    if (frameloop === 'demand') invalidate()
  })

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms
    const su = flow?.material.uniforms
    // Floored too: the velocity below divides by it, and a first frame can be 0.
    const dt = MathUtils.clamp(fixedDelta ?? delta, 1e-4, MAX_DELTA)
    const fieldDt = dt * timeScale
    time.current += fieldDt

    const resolution = u.uResolution.value as Vector2
    resolution.set(size.width * pixelRatio, size.height * pixelRatio)
    const pitch = coveragePitch(tuning, size.width, size.height)

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
    for (const target of su ? [u, su] : [u]) {
      target.uTime.value = time.current
      ;(target.uResolution.value as Vector2).copy(resolution)
      target.uDpr.value = pixelRatio
      target.uLayout.value = layout === 'grid' ? 1 : 0
      target.uColumnPitch.value = pitch.columnPitch
      target.uRowPitch.value = pitch.rowPitch
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
    // the switch into flow) reseeds every particle at its spawn point. The
    // render target, viewport and scissor the owner had are restored after
    // the pass, so a shared renderer sees no change.
    u.uMotion.value = flow && su ? 1 : 0
    if (flow && su) {
      const composition = `${count}:${seed}:${layout}:${stateWidth}x${stateHeight}`
      const read = flow.targets[flow.swapped ? 1 : 0]
      const write = flow.targets[flow.swapped ? 0 : 1]
      su.uState.value = read.texture
      ;(su.uStateSize.value as Vector2).set(stateWidth, stateHeight)
      su.uInit.value = flow.seededFor === composition ? 0 : 1
      su.uDt.value = fieldDt
      su.uSeed.value = seed
      su.uFlowSpeed.value = flowSpeed
      const previousTarget = gl.getRenderTarget()
      const previousScissorTest = gl.getScissorTest()
      gl.setScissorTest(false)
      try {
        gl.setRenderTarget(write)
        gl.render(flow.scene, flow.camera)
      } finally {
        gl.setRenderTarget(previousTarget)
        gl.setScissorTest(previousScissorTest)
      }
      flow.swapped = !flow.swapped
      flow.seededFor = composition
      u.uState.value = write.texture
      ;(u.uStateSize.value as Vector2).set(stateWidth, stateHeight)
    }

    // Render-only look.
    u.uShape.value = shape === 'dot' ? 1 : 0
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

    // A frozen field on demand still finishes its eases: ask for one more
    // frame until the polarity and the pointer presence have settled.
    if (
      frameloop === 'demand' &&
      (Math.abs(u.uAbsorb.value - absorb) > SETTLE_EPSILON ||
        Math.abs(pointerAmt - presence) > SETTLE_EPSILON)
    ) {
      invalidate()
    }

    // R3F draws after this callback returns; the next animation frame is the
    // earliest moment that draw has been issued, so readiness waits for it.
    if (framesDrawn.current === 0) {
      framesDrawn.current = 1
      const signal = onFirstFrame
      if (signal) requestAnimationFrame(() => signal())
    }
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

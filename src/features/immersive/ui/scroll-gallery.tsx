'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { Color, MathUtils, type Mesh, type ShaderMaterial, type Texture, Vector2 } from 'three'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import { cn } from '@/utilities/ui'
import { resolveTuning } from '../resolve-tuning'
import { useBackdropTexture, useOnScreen } from './glass-media-internals'

/**
 * Scroll-reactive 3D gallery: media planes staggered down the z axis, a
 * camera that dollies through them as the caller's scroll track is scrolled,
 * and a mood background that cross-blends each item's palette as it comes
 * into focus. After "Building a scroll-reactive 3D gallery with Three.js"
 * (Codrops, March 2026), rebuilt on R3F and the site's scroll.
 *
 * Three velocity-driven motion layers sit on the dolly:
 *
 * - **parallax** — the pointer's viewport position nudges every plane, more
 *   the further the plane is from the camera;
 * - **drift** — signed scroll velocity slides the planes against the scroll
 *   direction, so a flick reads as the gallery lagging the hand;
 * - **breath** — velocity magnitude tilts the planes into the scroll and
 *   pulses their scale, settling back to flat at rest.
 *
 * The background is a full-screen pass: the item palette (background plus two
 * soft blobs) interpolated between the item in focus and the next one by the
 * camera's position between them, lifted by velocity and dusted with grain.
 *
 * Scroll is never hijacked. The caller renders a tall scroll track (`pinRef`)
 * with a sticky viewport holding this canvas; the camera's progress is how far
 * the track has scrolled through the viewport, and velocity is the smoothed
 * derivative of that. Reading the track's rect each frame keeps the effect
 * scroller-agnostic — the window, or a nested Lenis scroller (`scrollSource`).
 *
 * Renders nothing without a GPU, on low-power devices, or under
 * `prefers-reduced-motion` (see `force`) — the consumer keeps its DOM fallback.
 */

const DPR_MIN = 1
const CAMERA_FOV = 45
const GL_OPTIONS = { antialias: true, alpha: false, stencil: false, depth: true }
const RESIZE_OPTIONS = { ...CANVAS_RESIZE, debounce: 0 }
/** Clamp tab-switch deltas so the integrators never jump. */
const MAX_DT = 1 / 30
/** Composition width the plane sizing assumes; narrower viewports scale down. */
const FIT_ASPECT = 1.4

const PLANE_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const PLANE_FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uCover;
uniform vec2 uSize;
uniform float uRadius;
uniform float uOpacity;
varying vec2 vUv;

// CSS object-fit: cover, in UV space.
vec2 coverUv(vec2 uv) {
  return (uv - 0.5) * uCover + 0.5;
}

float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdRoundedBox(p, uSize * 0.5, uRadius);
  float alpha = 1.0 - smoothstep(-fwidth(d), 0.0, d);
  vec4 color = texture2D(uMap, coverUv(vUv));
  gl_FragColor = vec4(color.rgb, alpha * uOpacity);
}
`

/** Fullscreen pass: clip-space quad pinned at the far plane, camera-independent. */
const BACKGROUND_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`

const BACKGROUND_FRAGMENT = /* glsl */ `
uniform vec3 uBgColor;
uniform vec3 uBlob1Color;
uniform vec3 uBlob2Color;
uniform vec2 uBlob1Center;
uniform vec2 uBlob2Center;
uniform float uBlobRadius;
uniform float uBlobRadiusSecondary;
uniform float uBlobStrength;
uniform float uVelocityIntensity;
uniform float uNoiseStrength;
uniform float uAspect;
uniform float uSeed;
varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  // Aspect-correct so the blobs stay round on wide viewports.
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  vec2 c1 = vec2(uBlob1Center.x * uAspect, uBlob1Center.y);
  vec2 c2 = vec2(uBlob2Center.x * uAspect, uBlob2Center.y);

  vec3 color = uBgColor;

  float blob1 = smoothstep(uBlobRadius, 0.0, distance(p, c1));
  float blob2 = smoothstep(uBlobRadiusSecondary, 0.0, distance(p, c2));

  vec3 blob1SoftColor = mix(uBlob1Color, uBgColor, 0.35);
  vec3 blob2SoftColor = mix(uBlob2Color, uBgColor, 0.35);
  color = mix(color, blob1SoftColor, blob1 * uBlobStrength);
  color = mix(color, blob2SoftColor, blob2 * uBlobStrength);

  color += uVelocityIntensity;

  float grain = random(vUv * vec2(1387.13, 947.91) + uSeed) - 0.5;
  color += grain * uNoiseStrength;

  gl_FragColor = vec4(color, 1.0);
}
`

/** An item's palette: the ground and two soft glows, as CSS colour strings. */
export type ScrollGalleryMood = {
  background: string
  blob1: string
  blob2: string
}

export type ScrollGalleryItem = {
  /** Image or video URL — same-origin path, blob: or data: URL. */
  src: string
  /** Treat `src` as a video even when its URL has no video extension. */
  video?: boolean
  /** Palette while this item is in focus; anything unset falls to the defaults. */
  mood?: Partial<ScrollGalleryMood>
}

export type ScrollGalleryProps = {
  items: ScrollGalleryItem[]
  /**
   * The scroll track: a tall element whose scroll-through drives the camera —
   * progress 0 with its top at the viewport top, 1 with its bottom at the
   * viewport bottom. The consumer sizes it (one screenful per item is the
   * usual step) and pins the canvas inside it.
   */
  pinRef: RefObject<HTMLElement | null>
  /** The scroller the track lives in; the window when omitted. */
  scrollSource?: RefObject<HTMLElement | null>
  /**
   * Fires when the item in focus changes — once per change, never per frame,
   * so a counter or caption can follow the camera.
   */
  onActiveChange?: (index: number) => void
  /** Render even where the GPU / motion gates would suppress the canvas (demos, stories). */
  force?: boolean
  className?: string
  /** Distance between consecutive planes along z (scene units). */
  planeGap?: number
  /** Plane width (scene units) at the composition aspect; narrower viewports scale down. */
  planeWidth?: number
  /** Plane aspect ratio (width / height). */
  planeAspect?: number
  /** Planes alternate left / right of centre by this much (scene units). */
  lateralOffset?: number
  /** Plane corner radius (scene units). */
  cornerRadius?: number
  /** How far in front of the focused plane the camera sits (scene units). */
  cameraDistance?: number
  /** Scroll smoothing — the camera's damp rate toward the scroll target (higher settles sooner). */
  scrollSmoothing?: number
  /** Velocity damping — how quickly velocity decays after input stops (higher settles sooner). */
  velocityDamping?: number
  /** Velocity clamp (planes per second) — keeps a hard flick within a usable range. */
  velocityMax?: number
  /** Below this magnitude velocity snaps to 0, killing micro-flicker at rest. */
  velocityStopThreshold?: number
  /** Pointer parallax amplitude (scene units at full pointer travel). */
  parallaxAmount?: number
  /** Scroll drift — plane offset per unit of velocity, against the scroll direction (scene units). */
  driftAmount?: number
  /** Breath tilt — plane X rotation per unit of velocity (radians). */
  breathTilt?: number
  /** Breath pulse — plane scale gain per unit of velocity. */
  breathScale?: number
  /** Distance ahead of the camera at which a plane is fully faded in (scene units). */
  fadeFar?: number
  /** Distance ahead of the camera at which a plane starts fading out before passing (scene units). */
  fadeNear?: number
  /** Primary blob radius (viewport-height units). */
  blobRadius?: number
  /** Secondary blob radius (viewport-height units). */
  blobRadiusSecondary?: number
  /** How much the blobs tint the ground. */
  blobStrength?: number
  /** Film-grain amplitude on the background. */
  noiseStrength?: number
  /** Background lift per unit of velocity magnitude. */
  velocityBrightness?: number
  /** Blob drift speed around their resting spots. */
  blobSpeed?: number
  /** Palette used where an item sets none. */
  background?: string
  blob1?: string
  blob2?: string
  /** Max device pixel ratio. */
  dpr?: number
}

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site.
 */
export const SCROLL_GALLERY_DEFAULTS = {
  planeGap: 2.5,
  planeWidth: 1.6,
  planeAspect: 16 / 10,
  lateralOffset: 0.55,
  cornerRadius: 0.02,
  cameraDistance: 2.2,
  scrollSmoothing: 6,
  velocityDamping: 4,
  velocityMax: 3,
  velocityStopThreshold: 0.002,
  parallaxAmount: 0.12,
  driftAmount: 0.18,
  breathTilt: 0.12,
  breathScale: 0.04,
  fadeFar: 7,
  fadeNear: 0.9,
  blobRadius: 0.75,
  blobRadiusSecondary: 0.55,
  blobStrength: 0.9,
  noiseStrength: 0.05,
  velocityBrightness: 0.06,
  blobSpeed: 0.12,
  background: '#111114',
  blob1: '#4a3f6b',
  blob2: '#1f4a40',
  dpr: 2,
} as const satisfies Partial<ScrollGalleryProps>

/**
 * Every knob with its default filled in — what the scene actually reads, once
 * `resolveTuning` has folded the caller's deltas into the table above.
 */
type ScrollGalleryTuning = Required<Pick<ScrollGalleryProps, keyof typeof SCROLL_GALLERY_DEFAULTS>>

type SceneProps = Pick<
  ScrollGalleryProps,
  'items' | 'pinRef' | 'scrollSource' | 'onActiveChange'
> & {
  /** Caller deltas already resolved against `SCROLL_GALLERY_DEFAULTS`. */
  tuning: ScrollGalleryTuning
}

type PlaneHandle = { mesh: Mesh; material: ShaderMaterial; index: number }
type Registry = Map<number, PlaneHandle>

/**
 * Where the scroll track sits in its scroller this frame, in the track's own
 * scroll units: pixels scrolled past its top, and the range that reaches its
 * bottom. Viewport-relative rects make this the same read for the window and
 * a nested scroller.
 */
function readTrackScroll(track: HTMLElement, scroller: HTMLElement | null) {
  const rect = track.getBoundingClientRect()
  const viewportTop = scroller ? scroller.getBoundingClientRect().top : 0
  const viewportHeight = scroller ? scroller.clientHeight : window.innerHeight
  const range = Math.max(1, rect.height - viewportHeight)
  return { scrolled: MathUtils.clamp(viewportTop - rect.top, 0, range), range }
}

/** One item's palette resolved against the tuning defaults. */
const resolveMood = (
  item: ScrollGalleryItem | undefined,
  tuning: ScrollGalleryTuning,
): ScrollGalleryMood => ({
  background: item?.mood?.background || tuning.background,
  blob1: item?.mood?.blob1 || tuning.blob1,
  blob2: item?.mood?.blob2 || tuning.blob2,
})

function GalleryPlane({
  item,
  index,
  registry,
  tuning,
}: {
  item: ScrollGalleryItem
  index: number
  registry: Registry
  tuning: ScrollGalleryTuning
}) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const onScreen = useOnScreen()
  const { planeAspect, cornerRadius } = tuning

  const uniforms = useMemo(
    () => ({
      uMap: { value: null as Texture | null },
      uCover: { value: new Vector2(1, 1) },
      uSize: { value: new Vector2(1, 1) },
      uRadius: { value: 0 },
      uOpacity: { value: 0 },
    }),
    [],
  )

  const sourceAspect = useBackdropTexture({
    src: item.src,
    video: item.video,
    materialRef,
    onScreen,
  })

  // Cover-fit: crop whichever axis overflows the plane's aspect.
  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    const ratio = planeAspect / sourceAspect
    ;(u.uCover.value as Vector2).set(Math.min(1, ratio), Math.min(1, 1 / ratio))
    ;(u.uSize.value as Vector2).set(planeAspect, 1)
    u.uRadius.value = cornerRadius
  }, [planeAspect, sourceAspect, cornerRadius])

  useEffect(() => {
    const mesh = meshRef.current
    const material = materialRef.current
    if (!mesh || !material) return
    registry.set(index, { mesh, material, index })
    return () => {
      registry.delete(index)
    }
  }, [index, registry])

  return (
    <mesh ref={meshRef}>
      <planeGeometry />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={PLANE_VERTEX}
        fragmentShader={PLANE_FRAGMENT}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

function GalleryScene({ items, pinRef, scrollSource, onActiveChange, tuning }: SceneProps) {
  const {
    planeGap,
    planeWidth,
    planeAspect,
    lateralOffset,
    cameraDistance,
    scrollSmoothing,
    velocityDamping,
    velocityMax,
    velocityStopThreshold,
    parallaxAmount,
    driftAmount,
    breathTilt,
    breathScale,
    fadeFar,
    fadeNear,
    blobRadius,
    blobRadiusSecondary,
    blobStrength,
    noiseStrength,
    velocityBrightness,
    blobSpeed,
  } = tuning

  // Select only what's needed; `useThree()` re-renders on any R3F state change.
  const viewport = useThree((state) => state.viewport)
  const camera = useThree((state) => state.camera)

  const registry = useMemo<Registry>(() => new Map(), [])
  const backgroundRef = useRef<ShaderMaterial>(null)

  const backgroundUniforms = useMemo(
    () => ({
      uBgColor: { value: new Color() },
      uBlob1Color: { value: new Color() },
      uBlob2Color: { value: new Color() },
      uBlob1Center: { value: new Vector2(0.3, 0.65) },
      uBlob2Center: { value: new Vector2(0.75, 0.3) },
      uBlobRadius: { value: 0.75 },
      uBlobRadiusSecondary: { value: 0.55 },
      uBlobStrength: { value: 0.9 },
      uVelocityIntensity: { value: 0 },
      uNoiseStrength: { value: 0.05 },
      uAspect: { value: 1 },
      uSeed: { value: 0 },
    }),
    [],
  )

  // Palettes as colours, resolved once per items/tuning change — never per frame.
  const moods = useMemo(
    () =>
      items.map((item) => {
        const mood = resolveMood(item, tuning)
        return {
          background: new Color(mood.background),
          blob1: new Color(mood.blob1),
          blob2: new Color(mood.blob2),
        }
      }),
    [items, tuning],
  )

  // Animation state lives in refs and feeds transforms via useFrame — never
  // React state (perf-never-set-state-in-useframe).
  const scroll = useRef({ progress: 0, velocity: 0, lastScrolled: null as number | null })
  const pointer = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const time = useRef(0)
  const active = useRef(-1)
  const onActiveChangeRef = useRef(onActiveChange)
  onActiveChangeRef.current = onActiveChange

  // Shader parameters sync on prop change, not in useFrame, so the table stays
  // the one place they are written.
  useEffect(() => {
    const u = backgroundUniforms
    u.uBlobRadius.value = blobRadius
    u.uBlobRadiusSecondary.value = blobRadiusSecondary
    u.uBlobStrength.value = blobStrength
    u.uNoiseStrength.value = noiseStrength
  }, [backgroundUniforms, blobRadius, blobRadiusSecondary, blobStrength, noiseStrength])

  useEffect(() => {
    // Pointer in viewport-normalized coordinates (-1..1, +y up); recorded
    // raw, damped in useFrame so pointermove never touches the scene.
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.targetX = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.targetY = 1 - (event.clientY / window.innerHeight) * 2
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  const count = items.length
  const depthRange = Math.max(0, count - 1) * planeGap
  // Fit: at the composition aspect planes take their nominal width; narrower
  // viewports (portrait phones) scale the whole composition down.
  const fit = Math.min(1, viewport.aspect / FIT_ASPECT)

  useFrame((state, delta) => {
    const track = pinRef.current
    if (!track) return
    const dt = Math.min(delta, MAX_DT)
    time.current += dt

    // — Scroll: the camera's target is how far the track has scrolled; the
    // camera damps toward it, and velocity is the damped derivative of the
    // raw scroll, in planes per second.
    const { scrolled, range } = readTrackScroll(track, scrollSource?.current ?? null)
    const s = scroll.current
    const target = scrolled / range
    if (s.lastScrolled === null) {
      s.lastScrolled = scrolled
      s.progress = target
    }
    const rawVelocity =
      (((scrolled - s.lastScrolled) / range) * Math.max(1, count - 1)) / Math.max(dt, 1 / 240)
    s.lastScrolled = scrolled
    s.progress = MathUtils.damp(s.progress, target, scrollSmoothing, dt)
    s.velocity = MathUtils.damp(s.velocity, rawVelocity, velocityDamping, dt)
    s.velocity = MathUtils.clamp(s.velocity, -velocityMax, velocityMax)
    if (Math.abs(s.velocity) < velocityStopThreshold) s.velocity = 0
    const speed = Math.abs(s.velocity) / velocityMax

    const p = pointer.current
    p.x = MathUtils.damp(p.x, p.targetX, 4, dt)
    p.y = MathUtils.damp(p.y, p.targetY, 4, dt)

    // — Camera dollies from in front of the first plane to in front of the last.
    const cameraZ = cameraDistance - s.progress * depthRange
    camera.position.z = cameraZ

    // — Planes: dolly-relative fade, then the three velocity layers.
    for (const [, handle] of registry) {
      const { mesh, material, index } = handle
      const baseX = (index % 2 === 0 ? -1 : 1) * lateralOffset * fit
      const baseZ = -index * planeGap
      const ahead = cameraZ - baseZ

      // Far planes rise in from the depth; a plane fades out before the camera
      // passes through it so it never clips the near plane.
      const farFade = 1 - MathUtils.smoothstep(ahead, fadeFar * 0.5, fadeFar)
      const nearFade = MathUtils.smoothstep(ahead, 0, fadeNear)
      const opacity = farFade * nearFade
      material.uniforms.uOpacity.value = opacity
      mesh.visible = opacity > 0.001

      const depthInfluence = MathUtils.clamp(ahead / fadeFar, 0, 1)
      const parallaxX = p.x * parallaxAmount * (0.5 + depthInfluence)
      const parallaxY = p.y * parallaxAmount * (0.5 + depthInfluence)
      const drift = -s.velocity * driftAmount
      const pulse = 1 + speed * breathScale

      mesh.position.set(baseX + parallaxX, parallaxY + drift, baseZ)
      mesh.rotation.set(s.velocity * breathTilt, 0, 0)
      mesh.scale.set(planeWidth * fit * pulse, (planeWidth / planeAspect) * fit * pulse, 1)
    }

    // — Background: blend the palette between the item in focus and the next
    // by where the camera sits between them.
    const bg = backgroundRef.current
    if (bg && moods.length) {
      const position = MathUtils.clamp(s.progress * Math.max(1, count - 1), 0, count - 1)
      const current = Math.floor(position)
      const next = Math.min(count - 1, current + 1)
      const blend = position - current
      const u = bg.uniforms
      ;(u.uBgColor.value as Color)
        .copy(moods[current].background)
        .lerp(moods[next].background, blend)
      ;(u.uBlob1Color.value as Color).copy(moods[current].blob1).lerp(moods[next].blob1, blend)
      ;(u.uBlob2Color.value as Color).copy(moods[current].blob2).lerp(moods[next].blob2, blend)
      u.uVelocityIntensity.value = speed * velocityBrightness
      u.uAspect.value = viewport.aspect
      u.uSeed.value = state.clock.elapsedTime
      const t = time.current * blobSpeed
      ;(u.uBlob1Center.value as Vector2).set(
        0.3 + Math.sin(t) * 0.08 + p.x * 0.04,
        0.65 + Math.cos(t * 0.8) * 0.06 + p.y * 0.04,
      )
      ;(u.uBlob2Center.value as Vector2).set(
        0.75 + Math.cos(t * 0.7) * 0.08 - p.x * 0.03,
        0.3 + Math.sin(t * 0.9) * 0.06 - p.y * 0.03,
      )

      // The focused item flips at the midpoint between planes; announce it
      // once per change so the consumer can react without a per-frame render.
      const focused = Math.round(position)
      if (focused !== active.current) {
        active.current = focused
        onActiveChangeRef.current?.(focused)
      }
    }
  })

  return (
    <>
      <mesh frustumCulled={false} renderOrder={-1}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={backgroundRef}
          uniforms={backgroundUniforms}
          vertexShader={BACKGROUND_VERTEX}
          fragmentShader={BACKGROUND_FRAGMENT}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      {items.map((item, index) => (
        <GalleryPlane
          key={`${index}-${item.src}`}
          item={item}
          index={index}
          registry={registry}
          tuning={tuning}
        />
      ))}
    </>
  )
}

/**
 * Full-surface scroll-reactive gallery canvas. Fills the nearest positioned
 * ancestor (the consumer's sticky viewport) and reads the scroll track it is
 * pinned in via `pinRef`.
 */
export function ScrollGallery({
  className,
  items,
  pinRef,
  scrollSource,
  onActiveChange,
  force = false,
  ...deltas
}: ScrollGalleryProps) {
  const tuning = resolveTuning<ScrollGalleryTuning>(SCROLL_GALLERY_DEFAULTS, deltas)
  const rootRef = useRef<HTMLDivElement>(null)
  const { hasGPU } = useDeviceDetection()
  // Off-screen galleries keep their context but stop rendering.
  const [inView, setInView] = useState(true)
  const enabled = hasGPU || force

  const dprRange = useMemo<[number, number]>(() => [DPR_MIN, tuning.dpr], [tuning.dpr])
  const cameraConfig = useMemo(
    () => ({
      position: [0, 0, tuning.cameraDistance] as [number, number, number],
      fov: CAMERA_FOV,
    }),
    [tuning.cameraDistance],
  )

  useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { rootMargin: '10%' },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [enabled])

  if (!enabled || items.length === 0) return null

  return (
    <div ref={rootRef} aria-hidden className={cn('absolute inset-0', className)}>
      <Canvas
        dpr={dprRange}
        gl={GL_OPTIONS}
        camera={cameraConfig}
        frameloop={inView ? 'always' : 'never'}
        flat
        linear
        resize={RESIZE_OPTIONS}
        // R3F writes pointer-events:auto inline; the overlay must not swallow
        // wheel or hover from the page beneath it.
        style={{ pointerEvents: 'none' }}
      >
        <GalleryScene
          items={items}
          pinRef={pinRef}
          scrollSource={scrollSource}
          onActiveChange={onActiveChange}
          tuning={tuning}
        />
      </Canvas>
    </div>
  )
}

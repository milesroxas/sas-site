'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  LinearFilter,
  MathUtils,
  type Mesh,
  type ShaderMaterial,
  type Texture,
  TextureLoader,
  Vector2,
} from 'three'
import { cn } from '@/utilities/ui'

/**
 * Floating "screenshot" cards: textured rounded-corner planes tilted on Y,
 * drifting in a slow sinusoidal loop. `visible` drives a staggered entrance
 * from a blank scene (cards rise and push forward from depth while fading in)
 * and a quicker exit back to blank; changing `contentKey` while visible
 * replays the entrance.
 *
 * Renders in its own small classic-renderer canvas rather than the global one
 * (GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is unsupported)
 * and uses frameloop="demand": zero GPU work while the scene is blank —
 * frames are only requested while cards are visible or animating.
 */

const DPR: [number, number] = [1, 2]
// Tilted planes have visible edges; corner AA happens in-shader via fwidth.
const GL_OPTIONS = { antialias: true, depth: true, stencil: false }
const CAMERA = { position: [0, 0, 5] as [number, number, number], fov: 40 }

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAGMENT_SHADER = /* glsl */ `
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
  // Signed distance to the card's rounded-rect outline, in plane units, with
  // one-pixel antialiasing from screen-space derivatives.
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdRoundedBox(p, uSize * 0.5, uRadius);
  float alpha = 1.0 - smoothstep(-fwidth(d), 0.0, d);

  vec4 color = texture2D(uMap, coverUv(vUv));
  gl_FragColor = vec4(color.rgb, alpha * uOpacity);
}
`

/** Easings for the entrance/exit progress (GSAP-style names). */
const EASINGS = {
  'expo.out': (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  'power3.out': (t: number) => 1 - (1 - t) ** 3,
  'back.out': (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  'sine.out': (t: number) => Math.sin((t * Math.PI) / 2),
} as const

export type FloatingCardsEase = keyof typeof EASINGS

export type FloatingCardDef = {
  /** Image URL — same-origin path, blob: or data: URL. */
  src: string
  /** Resting center in scene units (composition spans roughly ±2.2 × ±1.4). */
  position: [number, number, number]
  /** Plane width/height in scene units. */
  size: [number, number]
}

export type FloatingCardsProps = {
  cards: FloatingCardDef[]
  /** Cards enter when this flips true, exit back to blank when false. */
  visible: boolean
  /** Replays the entrance when it changes while visible (e.g. project id). */
  contentKey?: string
  /** Static Y tilt of the whole card group, degrees. */
  tilt?: number
  /** Speed of the idle float loop. */
  floatSpeed?: number
  /** Positional drift amplitude of the float loop, scene units. */
  floatIntensity?: number
  /** Y-rotation wobble amplitude of the float loop, degrees. */
  wobble?: number
  /** Entrance duration per card, seconds. */
  enterDuration?: number
  /** Exit duration per card, seconds (no stagger on exit). */
  exitDuration?: number
  /** Entrance delay between consecutive cards, seconds. */
  stagger?: number
  /** How far behind their resting z cards start, scene units. */
  depth?: number
  /** How far below their resting y cards start, scene units. */
  rise?: number
  /** Entrance easing. */
  ease?: FloatingCardsEase
  /** Corner radius in scene units. */
  cornerRadius?: number
  className?: string
}

type SceneProps = Omit<FloatingCardsProps, 'className'>

type CardHandle = {
  mesh: Mesh
  material: ShaderMaterial
  def: FloatingCardDef
}

type Registry = Map<number, CardHandle>

function FloatingCardMesh({
  def,
  index,
  cornerRadius,
  registry,
}: {
  def: FloatingCardDef
  index: number
  cornerRadius: number
  registry: Registry
}) {
  const invalidate = useThree((state) => state.invalidate)
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)

  // Initial values only (real size/radius sync in an effect below) — R3F may
  // copy this object into the material, so all runtime updates go through
  // materialRef.current.uniforms, never this object.
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

  useEffect(() => {
    const mesh = meshRef.current
    const material = materialRef.current
    if (!mesh || !material) return
    registry.set(index, { mesh, material, def })
    return () => {
      registry.delete(index)
    }
  }, [registry, index, def])

  // Load the image; the previous texture stays visible until the new one is
  // ready, then gets disposed (textures inside uniforms are not auto-disposed).
  useEffect(() => {
    const material = materialRef.current
    if (!material) return
    let cancelled = false
    new TextureLoader().load(def.src, (texture) => {
      if (cancelled) {
        texture.dispose()
        return
      }
      texture.minFilter = LinearFilter
      texture.magFilter = LinearFilter
      texture.generateMipmaps = false
      const previous = material.uniforms.uMap?.value as Texture | null
      material.uniforms.uMap.value = texture
      previous?.dispose()

      // Cover-fit the image into the card's aspect.
      const image = texture.image as { width: number; height: number }
      const imageAspect = image.width / image.height
      const cardAspect = def.size[0] / def.size[1]
      const cover = material.uniforms.uCover.value as Vector2
      if (cardAspect > imageAspect) {
        cover.set(1, imageAspect / cardAspect)
      } else {
        cover.set(cardAspect / imageAspect, 1)
      }
      invalidate()
    })
    return () => {
      cancelled = true
    }
  }, [def.src, def.size, invalidate])

  useEffect(() => {
    const material = materialRef.current
    return () => {
      ;(material?.uniforms.uMap?.value as Texture | null)?.dispose()
    }
  }, [])

  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    ;(u.uSize.value as Vector2).set(def.size[0], def.size[1])
    u.uRadius.value = cornerRadius
    invalidate()
  }, [def.size, cornerRadius, invalidate])

  return (
    <mesh ref={meshRef} position={def.position} scale-x={def.size[0]} scale-y={def.size[1]}>
      <planeGeometry />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

function FloatingCardsScene({
  cards,
  visible,
  contentKey,
  tilt = -8,
  floatSpeed = 0.25,
  floatIntensity = 0.04,
  wobble = 1.5,
  enterDuration = 0.9,
  exitDuration = 0.4,
  stagger = 0.12,
  depth = 0.8,
  rise = 0.25,
  ease = 'expo.out',
  cornerRadius = 0.05,
}: SceneProps) {
  // Select only what's needed; `useThree()` re-renders on any R3F state change.
  const viewport = useThree((state) => state.viewport)
  const invalidate = useThree((state) => state.invalidate)

  const registry = useMemo<Registry>(() => new Map(), [])

  // Animation state lives in refs and feeds transforms via useFrame — never
  // React state (perf-never-set-state-in-useframe).
  const progress = useRef<number[]>([])
  const sinceShow = useRef(0)
  const time = useRef(0)
  const lastKey = useRef(contentKey)

  // Restart the stagger clock on every show/hide or content swap. Progress
  // only resets to blank on new content — re-hovering the same content
  // mid-exit resumes from the current opacity instead of popping to zero.
  // biome-ignore lint/correctness/useExhaustiveDependencies: visible restarts the stagger clock without changing content
  useEffect(() => {
    if (lastKey.current !== contentKey) {
      lastKey.current = contentKey
      progress.current = progress.current.map(() => 0)
    }
    sinceShow.current = 0
    invalidate()
  }, [visible, contentKey, invalidate])

  useFrame((_, delta) => {
    // Clamp tab-switch deltas so the timeline never jumps.
    const dt = Math.min(delta, 1 / 30)
    sinceShow.current += dt
    time.current += dt

    const easeFn = EASINGS[ease]
    let anyFading = false

    for (const [index, handle] of registry) {
      let p = progress.current[index] ?? 0
      if (visible) {
        if (sinceShow.current >= index * stagger) p = Math.min(1, p + dt / enterDuration)
      } else {
        p = Math.max(0, p - dt / exitDuration)
      }
      progress.current[index] = p
      if (p > 0 && p < 1) anyFading = true

      const e = easeFn(p)
      const [baseX, baseY, baseZ] = handle.def.position
      const phase = index * 1.7

      // Idle float: slow positional drift loop + gentle Y-only wobble, so the
      // cards never tip off their upright axis.
      const t = time.current * floatSpeed
      const bobY = Math.sin(t + phase) * floatIntensity
      const driftX = Math.cos(t * 0.6 + phase) * floatIntensity * 0.6
      const wobbleRad = MathUtils.degToRad(wobble)

      const mesh = handle.mesh
      mesh.position.set(baseX + driftX, baseY + bobY - rise * (1 - e), baseZ - depth * (1 - e))
      mesh.rotation.set(0, Math.sin(t * 0.5 + phase) * wobbleRad, 0)
      const s = 0.92 + 0.08 * e
      mesh.scale.set(handle.def.size[0] * s, handle.def.size[1] * s, 1)

      handle.material.uniforms.uOpacity.value = MathUtils.clamp(e, 0, 1)
    }

    // Keep requesting frames while cards are on screen (the float loop runs
    // continuously) or still fading out; a blank scene goes fully idle.
    if (visible || anyFading) invalidate()
  })

  // Fit the composition (~4.6 × 3 scene units) into the viewport.
  const scale = Math.min(viewport.width / 4.6, viewport.height / 3)

  return (
    <group scale={scale} rotation-y={MathUtils.degToRad(tilt)}>
      {cards.map((def, index) => (
        <FloatingCardMesh
          key={`${index}-${def.size[0]}x${def.size[1]}`}
          def={def}
          index={index}
          cornerRadius={cornerRadius}
          registry={registry}
        />
      ))}
    </group>
  )
}

/**
 * WebGL panel of floating screenshot cards with staggered enter/exit
 * animation. Size and position it via className (the canvas fills the
 * element, so it needs an explicit height or absolute inset); the
 * composition scales to fit inside.
 */
export function FloatingCards({ className, ...scene }: FloatingCardsProps) {
  return (
    <div className={cn('relative', className)}>
      <Canvas dpr={DPR} flat linear frameloop="demand" camera={CAMERA} gl={GL_OPTIONS}>
        <FloatingCardsScene {...scene} />
      </Canvas>
    </div>
  )
}

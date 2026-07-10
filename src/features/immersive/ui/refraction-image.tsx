'use client'

import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import cn from 'clsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  LinearFilter,
  MathUtils,
  type ShaderMaterial,
  type Texture,
  TextureLoader,
  Vector2,
} from 'three'

/**
 * Image panel with a cursor-driven "liquid glass" lens: refraction (space is
 * pulled toward the cursor), chromatic dispersion of that displacement, and
 * animated noise distortion, all confined to a soft radial mask around a
 * damped trailing pointer.
 *
 * Renders in its own small classic-renderer canvas rather than the global one
 * (GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is unsupported)
 * and uses frameloop="demand": zero GPU work while idle — frames are only
 * requested while the lens is fading, moving, or animating.
 */

const DPR: [number, number] = [1, 2]
// Single textured quad: no depth/stencil needed, geometry has no edges to alias.
const GL_OPTIONS = { antialias: false, depth: false, stencil: false }

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
uniform float uAspect;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform float uHover;
uniform float uTime;
uniform float uRadius;
uniform float uFeather;
uniform float uEdge;
uniform float uRefraction;
uniform float uChroma;
uniform float uDistortion;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uSmear;
uniform float uHighlight;
varying vec2 vUv;

// Simplex 3D noise (Ashima Arts / Stefan Gustavson, MIT).
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// CSS object-fit: cover, in UV space.
vec2 coverUv(vec2 uv) {
  return (uv - 0.5) * uCover + 0.5;
}

void main() {
  // Distances measured in aspect-corrected space so the lens stays circular.
  vec2 aspect = vec2(uAspect, 1.0);
  float dist = length((vUv - uMouse) * aspect);

  // Two falloff shapes: a ringed smoothstep lens with a discernible boundary,
  // and a gaussian that fades to nothing with no boundary at all. uEdge blends
  // between them — 0 keeps every effect but hides the lens itself.
  float inner = uRadius * (1.0 - clamp(uFeather, 0.0, 1.0));
  float ring = 1.0 - smoothstep(inner, uRadius, dist);
  float gauss = exp(-3.0 * dist * dist / (uRadius * uRadius));
  float mask = mix(gauss, ring, uEdge) * uHover;

  // Refraction: pull space toward the cursor. Zero at the mask edge, so the
  // lens blends seamlessly into the undistorted image.
  vec2 displacement = (uMouse - vUv) * uRefraction * mask;

  // Animated noise wobble inside the lens.
  vec3 noiseUv = vec3(vUv * aspect * uNoiseScale, uTime * uNoiseSpeed);
  displacement += vec2(snoise(noiseUv), snoise(noiseUv + 17.31)) * uDistortion * mask;

  // Directional smear trailing the pointer's velocity.
  displacement -= uVelocity * uSmear * mask;

  // Chroma: disperse the total displacement per channel, like wavelength-
  // dependent refraction in real glass. No displacement = no fringing.
  vec3 color = vec3(
    texture2D(uMap, coverUv(vUv + displacement * (1.0 + uChroma))).r,
    texture2D(uMap, coverUv(vUv + displacement)).g,
    texture2D(uMap, coverUv(vUv + displacement * (1.0 - uChroma))).b
  );

  // Faint rim light peaking mid-falloff. Tied to the ring shape and scaled by
  // uEdge: an edgeless lens draws no rim.
  color += ring * (1.0 - ring) * 4.0 * uHighlight * uEdge * uHover;

  gl_FragColor = vec4(color, 1.0);
}
`

export type RefractionImageProps = {
  /** Image URL — same-origin path, blob: or data: URL. */
  src: string
  /** Lens radius (spread) in plane UV units; 1 spans the panel's height. */
  spread?: number
  /** 0–1: edge softness of the lens falloff (0 = hard rim). */
  feather?: number
  /**
   * 0–1: how defined the lens boundary is. 0 = edgeless gaussian falloff —
   * the effects remain but no rim or boundary is visible (feather and
   * highlight have no influence there). 1 = ringed lens.
   */
  edge?: number
  /** How strongly space is pulled toward the cursor (0–0.5 is sensible). */
  refraction?: number
  /** 0–1: per-channel dispersion of the displacement (RGB fringing). */
  chroma?: number
  /** Noise wobble amplitude in UV space (0–0.05 is sensible). */
  distortion?: number
  /** Spatial frequency of the noise wobble. */
  noiseScale?: number
  /** Time scale of the noise wobble. */
  noiseSpeed?: number
  /** How much the pointer's velocity smears the image directionally. */
  smear?: number
  /** Rim-light strength at the lens edge. */
  highlight?: number
  /** Damping for the trailing cursor (higher = tighter follow). */
  follow?: number
  /** Damping for the hover fade in/out (higher = snappier). */
  ease?: number
  className?: string
}

type SceneProps = Omit<RefractionImageProps, 'className'>

function RefractionScene({
  src,
  spread = 0.22,
  feather = 0.6,
  edge = 0,
  refraction = 0.12,
  chroma = 0.35,
  distortion = 0.008,
  noiseScale = 6,
  noiseSpeed = 0.4,
  smear = 0.02,
  highlight = 0.08,
  follow = 8,
  ease = 6,
}: SceneProps) {
  // Select only what's needed; `useThree()` re-renders on any R3F state change.
  const viewport = useThree((state) => state.viewport)
  const invalidate = useThree((state) => state.invalidate)
  const materialRef = useRef<ShaderMaterial>(null)
  const [imageAspect, setImageAspect] = useState(16 / 9)

  // Pointer state lives in refs and feeds uniforms via useFrame — never React
  // state (perf-never-set-state-in-useframe).
  const pointerTarget = useRef(new Vector2(0.5, 0.5))
  const velocityTarget = useRef(new Vector2())
  const previousMouse = useRef(new Vector2(0.5, 0.5))
  const hoverTarget = useRef(0)

  // Initial values only — R3F may copy this object into the material, so all
  // runtime updates go through materialRef.current.uniforms, never this object.
  const uniforms = useMemo(
    () => ({
      uMap: { value: null as Texture | null },
      uCover: { value: new Vector2(1, 1) },
      uAspect: { value: 1 },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uVelocity: { value: new Vector2() },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uRadius: { value: 0.22 },
      uFeather: { value: 0.6 },
      uEdge: { value: 0 },
      uRefraction: { value: 0.12 },
      uChroma: { value: 0.35 },
      uDistortion: { value: 0.008 },
      uNoiseScale: { value: 6 },
      uNoiseSpeed: { value: 0.4 },
      uSmear: { value: 0.02 },
      uHighlight: { value: 0.08 },
    }),
    [],
  )

  // Load the image; the previous texture stays visible until the new one is
  // ready, then gets disposed (textures inside uniforms are not auto-disposed).
  useEffect(() => {
    const material = materialRef.current
    if (!material) return
    let cancelled = false
    new TextureLoader().load(src, (texture) => {
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
      const image = texture.image as { width: number; height: number }
      setImageAspect(image.width / image.height)
      invalidate()
    })
    return () => {
      cancelled = true
    }
  }, [src, invalidate])

  useEffect(() => {
    const material = materialRef.current
    return () => {
      ;(material?.uniforms.uMap?.value as Texture | null)?.dispose()
    }
  }, [])

  // Cover-fit whenever the panel or image aspect changes.
  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    const planeAspect = viewport.aspect
    if (planeAspect > imageAspect) {
      u.uCover.value.set(1, imageAspect / planeAspect)
    } else {
      u.uCover.value.set(planeAspect / imageAspect, 1)
    }
    u.uAspect.value = planeAspect
    invalidate()
  }, [viewport.aspect, imageAspect, invalidate])

  // Static uniforms sync on prop change (not in useFrame: with a demand
  // frameloop no frames run while idle, so GUI tweaks would go stale).
  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    u.uRadius.value = spread
    u.uFeather.value = feather
    u.uEdge.value = edge
    u.uRefraction.value = refraction
    u.uChroma.value = chroma
    u.uDistortion.value = distortion
    u.uNoiseScale.value = noiseScale
    u.uNoiseSpeed.value = noiseSpeed
    u.uSmear.value = smear
    u.uHighlight.value = highlight
    invalidate()
  }, [
    spread,
    feather,
    edge,
    refraction,
    chroma,
    distortion,
    noiseScale,
    noiseSpeed,
    smear,
    highlight,
    invalidate,
  ])

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!event.uv) return
      pointerTarget.current.set(event.uv.x, event.uv.y)
      hoverTarget.current = 1
      invalidate()
    },
    [invalidate],
  )

  const handlePointerOut = useCallback(() => {
    hoverTarget.current = 0
    invalidate()
  }, [invalidate])

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms
    // Clamp tab-switch deltas so damping never overshoots.
    const dt = Math.min(delta, 1 / 30)

    const mouse = u.uMouse.value as Vector2
    previousMouse.current.copy(mouse)
    mouse.x = MathUtils.damp(mouse.x, pointerTarget.current.x, follow, dt)
    mouse.y = MathUtils.damp(mouse.y, pointerTarget.current.y, follow, dt)

    velocityTarget.current
      .set((mouse.x - previousMouse.current.x) / dt, (mouse.y - previousMouse.current.y) / dt)
      .clampLength(0, 2)
    const velocity = u.uVelocity.value as Vector2
    velocity.x = MathUtils.damp(velocity.x, velocityTarget.current.x, follow, dt)
    velocity.y = MathUtils.damp(velocity.y, velocityTarget.current.y, follow, dt)

    u.uHover.value = MathUtils.damp(u.uHover.value, hoverTarget.current, ease, dt)
    u.uTime.value += dt

    // Keep requesting frames only while the lens is visible or still moving;
    // once everything settles the canvas goes fully idle.
    const settled =
      hoverTarget.current === 0 && u.uHover.value < 0.002 && velocity.lengthSq() < 1e-6
    if (!settled) invalidate()
  })

  return (
    <mesh
      scale-x={viewport.width}
      scale-y={viewport.height}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      <planeGeometry />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
      />
    </mesh>
  )
}

/**
 * WebGL image panel with a subtle refraction/chroma/distortion lens that
 * trails the cursor on hover. Give it a sized container via className
 * (e.g. an aspect-ratio utility); the image cover-fits inside.
 */
export function RefractionImage({ className, ...scene }: RefractionImageProps) {
  return (
    <div className={cn('relative', className)}>
      <Canvas dpr={DPR} flat linear frameloop="demand" gl={GL_OPTIONS}>
        <RefractionScene {...scene} />
      </Canvas>
    </div>
  )
}

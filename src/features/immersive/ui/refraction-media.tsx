'use client'

import { useFBO } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import cn from 'clsx'
import { useEffect, useMemo, useRef } from 'react'
import { MathUtils, type Mesh, type ShaderMaterial, type Texture, Vector2 } from 'three'

import {
  BACKDROP_VERTEX,
  createDispersionUniforms,
  DISPERSION_FRAGMENT,
  DISPERSION_VERTEX,
  GLASS_CAMERA,
  GLASS_DPR,
  GLASS_GL_OPTIONS,
  GLASS_MESH_Z,
  type GlassMediaSource,
  glassPlaneSize,
  useBackdropTexture,
  useCoverFit,
  useOnScreen,
  usePointerTracking,
  useWinResolution,
} from './glass-media-internals'

/**
 * Image or video panel with a two-layer cursor lens:
 *
 * 1. The backdrop plane runs a screen-space "liquid glass" warp — refraction
 *    (space pulled toward the cursor), chromatic dispersion of that
 *    displacement, animated noise distortion and velocity smear, confined to
 *    a soft radial mask around a damped trailing pointer.
 * 2. A real flattened glass mesh rides the same damped pointer on top,
 *    refracting the (already warped) backdrop through Maxime Heckel's
 *    six-band dispersion shader — the backdrop is snapshotted into an FBO
 *    with the mesh hidden, then the mesh samples it along per-wavelength
 *    `refract()` vectors. `lensVisibility` scales the mesh's displacement,
 *    from fully visible glass (1) down to optically absent (0).
 *
 * Both layers ease in and out with hover: the warp mask fades via uHover, and
 * the glass mesh's refraction eases to zero so every fragment reproduces the
 * backdrop exactly — no fade or opacity pass.
 *
 * Renders in its own small classic-renderer canvas rather than the global one
 * (GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is unsupported)
 * and uses frameloop="demand": zero GPU work while idle — frames are only
 * requested while the lens is easing, moving, animating, or a video source
 * has a new frame, and never while the canvas is scrolled off screen.
 */

const WARP_FRAGMENT = /* glsl */ `
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

  // Every term below scales by mask, so outside the lens the result is just the
  // untouched texture. Taking that path early skips two simplex evaluations and
  // two texture fetches — on a full-bleed surface most of the screen, and all
  // of it while idle. The mask is spatially coherent, so warps branch uniformly.
  if (mask < 0.002) {
    gl_FragColor = vec4(texture2D(uMap, coverUv(vUv)).rgb, 1.0);
    return;
  }

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

/** A DOM element already painting the media, reused as the texture source. */
export type RefractionSource = GlassMediaSource

export type RefractionMediaProps = {
  /**
   * Media URL — same-origin path, blob: or data: URL. Video URLs (by
   * extension, or with `video` set) get a muted looping player created
   * internally. Ignored when `source` is set.
   */
  src?: string
  /** Treat `src` as a video even when its URL has no video extension. */
  video?: boolean
  /**
   * Live `<img>` or `<video>` to sample instead of loading `src`. Reuses the
   * bytes the browser already has, and keeps that element available as the
   * non-WebGL fallback. Must be same-origin or CORS-enabled, otherwise the
   * texture upload taints the canvas and throws.
   */
  source?: GlassMediaSource | null
  /** Fired once the first texture is on the GPU — use it to reveal the canvas. */
  onReady?: () => void

  // --- Screen-space warp (the original hover effect) ---
  /** Warp radius (spread) in plane UV units; 1 spans the panel's height. */
  spread?: number
  /** 0–1: edge softness of the warp falloff (0 = hard rim). */
  feather?: number
  /**
   * 0–1: how defined the warp boundary is. 0 = edgeless gaussian falloff —
   * the effects remain but no rim or boundary is visible (feather and
   * highlight have no influence there). 1 = ringed lens.
   */
  edge?: number
  /** How strongly space is pulled toward the cursor (0–0.5 is sensible). */
  refraction?: number
  /** 0–1: per-channel dispersion of the warp displacement (RGB fringing). */
  chroma?: number
  /** Noise wobble amplitude in UV space (0–0.05 is sensible). */
  distortion?: number
  /** Spatial frequency of the noise wobble. */
  noiseScale?: number
  /** Time scale of the noise wobble. */
  noiseSpeed?: number
  /** How much the pointer's velocity smears the image directionally. */
  smear?: number
  /** Rim-light strength at the warp edge. */
  highlight?: number

  // --- Glass lens mesh (the dispersion technique) ---
  /** 0–1: how visible the glass mesh is (0 disables its refraction entirely). */
  lensVisibility?: number
  /** Glass mesh radius as a fraction of the panel's height. */
  lensSpread?: number
  /** Glass thickness: z-scale relative to its radius (1 = full sphere). */
  lensDepth?: number
  /** Refraction offset strength per sample inside the glass. */
  lensRefraction?: number
  /** Spread between the glass's per-wavelength refraction vectors. */
  lensChroma?: number
  /** ≥1; re-saturates the pastel tint the dispersion loop introduces. */
  lensSaturation?: number
  /** Index of refraction per spectral band. */
  iorR?: number
  iorY?: number
  iorG?: number
  iorC?: number
  iorB?: number
  iorP?: number

  // --- Motion ---
  /** Damping for the trailing cursor (higher = tighter follow). */
  follow?: number
  /** Damping for the hover fade in/out (higher = snappier). */
  ease?: number
  className?: string
}

type SceneProps = Omit<RefractionMediaProps, 'className'>

function RefractionScene({
  src,
  video = false,
  source,
  onReady,
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
  lensVisibility = 1,
  lensSpread = 0.22,
  lensDepth = 0.55,
  lensRefraction = 0.15,
  lensChroma = 0.5,
  lensSaturation = 1.04,
  iorR = 1.15,
  iorY = 1.16,
  iorG = 1.18,
  iorC = 1.22,
  iorB = 1.22,
  iorP = 1.22,
  follow = 8,
  ease = 6,
}: SceneProps) {
  // Select only what's needed; `useThree()` re-renders on any R3F state change.
  const viewport = useThree((state) => state.viewport)
  const invalidate = useThree((state) => state.invalidate)

  const meshRef = useRef<Mesh>(null)
  const warpMaterialRef = useRef<ShaderMaterial>(null)
  const lensMaterialRef = useRef<ShaderMaterial>(null)

  const onScreen = useOnScreen()
  const pointer = usePointerTracking(onScreen)

  // Velocity state lives in refs and feeds uniforms via useFrame — never React
  // state (perf-never-set-state-in-useframe).
  const velocityTarget = useRef(new Vector2())
  const previousMouse = useRef(new Vector2(0.5, 0.5))

  // Scene snapshot with the mesh hidden — the glass samples the *warped*
  // backdrop, so both effects compose.
  const backdropFBO = useFBO()

  // Initial values only — R3F may copy these objects into the materials, so
  // runtime updates go through the material refs, never these objects.
  const warpUniforms = useMemo(
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
  const lensUniforms = useMemo(() => {
    const uniforms = createDispersionUniforms()
    // The glass starts optically invisible and eases in on hover.
    uniforms.uHover.value = 0
    return uniforms
  }, [])

  const sourceAspect = useBackdropTexture({
    src,
    video,
    source,
    onReady,
    materialRef: warpMaterialRef,
    onScreen,
  })
  useCoverFit(warpMaterialRef, sourceAspect)
  useWinResolution(lensMaterialRef)

  // Shader parameters sync on prop change (not in useFrame: with a demand
  // frameloop no frames run while idle, so GUI tweaks would go stale).
  useEffect(() => {
    const u = warpMaterialRef.current?.uniforms
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

  useEffect(() => {
    const u = lensMaterialRef.current?.uniforms
    if (!u) return
    u.uRefractPower.value = lensRefraction
    u.uChromaticAberration.value = lensChroma
    u.uSaturation.value = lensSaturation
    u.uIorR.value = iorR
    u.uIorY.value = iorY
    u.uIorG.value = iorG
    u.uIorC.value = iorC
    u.uIorB.value = iorB
    u.uIorP.value = iorP
    invalidate()
  }, [lensRefraction, lensChroma, lensSaturation, iorR, iorY, iorG, iorC, iorB, iorP, invalidate])

  useFrame((state, delta) => {
    const mesh = meshRef.current
    const warp = warpMaterialRef.current
    const lens = lensMaterialRef.current
    if (!mesh || !warp || !lens) return
    const u = warp.uniforms
    // Clamp tab-switch deltas so damping never overshoots.
    const dt = Math.min(delta, 1 / 30)

    const mouse = u.uMouse.value as Vector2
    previousMouse.current.copy(mouse)
    mouse.x = MathUtils.damp(mouse.x, pointer.uv.current.x, follow, dt)
    mouse.y = MathUtils.damp(mouse.y, pointer.uv.current.y, follow, dt)

    velocityTarget.current
      .set((mouse.x - previousMouse.current.x) / dt, (mouse.y - previousMouse.current.y) / dt)
      .clampLength(0, 2)
    const velocity = u.uVelocity.value as Vector2
    velocity.x = MathUtils.damp(velocity.x, velocityTarget.current.x, follow, dt)
    velocity.y = MathUtils.damp(velocity.y, velocityTarget.current.y, follow, dt)

    const hoverTarget = pointer.inside.current ? 1 : 0
    u.uHover.value = MathUtils.damp(u.uHover.value, hoverTarget, ease, dt)
    u.uTime.value += dt

    // The glass rides the same damped pointer as the warp's center, and its
    // refraction shares the hover ease, scaled by how visible it should be.
    const plane = glassPlaneSize(state.size.width / state.size.height)
    mesh.position.x = (mouse.x - 0.5) * plane.width
    mesh.position.y = (mouse.y - 0.5) * plane.height
    lens.uniforms.uHover.value = u.uHover.value * lensVisibility

    // Capture pass: hide the glass, snapshot the warped backdrop into the
    // FBO, then let R3F's default pass render glass + backdrop to the screen.
    // An optically absent glass (uHover ~0 would reproduce the backdrop
    // exactly) stays hidden, skipping its fragment work entirely.
    const { gl, scene, camera } = state
    mesh.visible = false
    gl.setRenderTarget(backdropFBO)
    gl.render(scene, camera)
    mesh.visible = lens.uniforms.uHover.value > 0.002
    gl.setRenderTarget(null)
    lens.uniforms.uTexture.value = backdropFBO.texture

    // Keep requesting frames only while the lens is visible or still moving;
    // once everything settles the canvas goes fully idle. A playing video
    // source drives its own invalidation, so it is unaffected by settling.
    const settled = hoverTarget === 0 && u.uHover.value < 0.002 && velocity.lengthSq() < 1e-6
    if (!settled && onScreen.current) invalidate()
  })

  // Sphere radius is 1, so the world radius equals lensSpread × panel height
  // at the glass's depth; the z-scale flattens the sphere into a lens.
  const lensScale = lensSpread * glassPlaneSize(1).height

  return (
    <>
      <mesh scale-x={viewport.width} scale-y={viewport.height} raycast={() => null}>
        <planeGeometry />
        <shaderMaterial
          ref={warpMaterialRef}
          uniforms={warpUniforms}
          vertexShader={BACKDROP_VERTEX}
          fragmentShader={WARP_FRAGMENT}
        />
      </mesh>

      <mesh
        ref={meshRef}
        position-z={GLASS_MESH_Z}
        scale={[lensScale, lensScale, lensScale * lensDepth]}
        raycast={() => null}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          ref={lensMaterialRef}
          uniforms={lensUniforms}
          vertexShader={DISPERSION_VERTEX}
          fragmentShader={DISPERSION_FRAGMENT}
        />
      </mesh>
    </>
  )
}

/**
 * WebGL media panel with a two-layer cursor lens: the original screen-space
 * warp (refraction, chroma, noise, smear) plus a real glass mesh refracting
 * the warped image through six spectral bands, both trailing the cursor on
 * hover. Give it a sized container via className (e.g. an aspect-ratio
 * utility); the media cover-fits inside.
 */
export function RefractionMedia({ className, ...scene }: RefractionMediaProps) {
  return (
    <div className={cn('relative', className)}>
      <Canvas
        dpr={GLASS_DPR}
        flat
        linear
        frameloop="demand"
        camera={GLASS_CAMERA}
        gl={GLASS_GL_OPTIONS}
      >
        <RefractionScene {...scene} />
      </Canvas>
    </div>
  )
}

'use client'

import { useFBO } from '@react-three/drei'
import { Canvas, type RootState, useFrame, useThree } from '@react-three/fiber'
import cn from 'clsx'
import { useEffect, useMemo, useRef } from 'react'
import {
  MathUtils,
  type Mesh,
  type ShaderMaterial,
  type Texture,
  Vector2,
  type WebGLRenderTarget,
} from 'three'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import { resolveTuning } from '../resolve-tuning'
import {
  applyGlassIorUniforms,
  BACKDROP_VERTEX,
  bleedToInset,
  canvasOverscan,
  createDispersionUniforms,
  DISPERSION_FRAGMENT,
  DISPERSION_VERTEX,
  GLASS_CAMERA,
  GLASS_DPR,
  GLASS_GL_OPTIONS,
  GLASS_IOR_DEFAULTS,
  GLASS_MESH_Z,
  type GlassIorProps,
  type GlassMediaSource,
  glassPlaneSize,
  glassSilhouetteRadius,
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
 * Optionally the whole media plane tilts on Y toward the damped cursor
 * (`tilt`, degrees at the horizontal edges) — off by default, riding the same
 * hover ease so the plane settles back flat on leave.
 *
 * With `bleed` the canvas extends past the container and the media renders
 * inset within it; the warp then displaces the media's *silhouette* — alpha
 * coverage is computed after displacement, and `melt` adds a dedicated
 * noise band along the boundary — so the effect escapes the bounding box
 * instead of clipping at it. A visible glass mesh grows that overscan to at
 * least its radius, so a lens sitting on the silhouette isn't clipped by
 * the framebuffer.
 *
 * `lensFade` keeps the glass mesh contained within the media: it fades out as
 * its own rim approaches the media's edge and dissolves per-pixel over the
 * same margin, so it never hangs off the silhouette or stamps an opaque disc
 * over the transparent bleed. Only the mesh is affected — the screen-space
 * warp and the edge melt keep working right up to the boundary.
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
uniform float uInset;
uniform float uMelt;
uniform float uMeltScale;
uniform float uMeltDetail;
uniform float uMeltSpeed;
uniform float uMeltBand;
uniform float uMeltFeather;
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

/**
 * Edge-melt displacement field. A single simplex octave reads as one
 * wavelength marching along the edge, so a second, finer octave is sampled
 * through a position the coarse one warps — lobes then vary in size and curl
 * as they drift. The 2.7x frequency step is deliberately non-integer so the
 * two octaves never line up into a repeating beat. Amplitude is normalized by
 * the mix, so uMeltDetail changes the character of the edge without changing
 * how far it spills into the bleed.
 */
vec2 meltFlow(vec2 p, float t) {
  vec2 coarse = vec2(snoise(vec3(p, t)), snoise(vec3(p + 31.7, t)));
  if (uMeltDetail <= 0.0) return coarse;
  vec2 warped = p * 2.7 + coarse * 0.6;
  float fineT = t * 1.7 + 11.3;
  vec2 fine = vec2(snoise(vec3(warped, fineT)), snoise(vec3(warped + 53.1, fineT)));
  return (coarse + fine * uMeltDetail * 0.5) / (1.0 + uMeltDetail * 0.5);
}

// Anti-aliased coverage of the media rect for a (possibly displaced) media-
// local coordinate. Constant-width smoothstep instead of fwidth(): the call
// sits behind a per-pixel mask branch, where derivatives are undefined. With
// no bleed the rect fills the canvas exactly — short-circuit to opaque so the
// legacy full-bleed layout can never grow a translucent seam at its border.
float coverage(vec2 q) {
  if (uInset <= 0.0) return 1.0;
  vec2 soft = vec2(uMeltFeather + 0.0015);
  vec2 c = smoothstep(vec2(0.0), soft, q) * (vec2(1.0) - smoothstep(vec2(1.0) - soft, vec2(1.0), q));
  return c.x * c.y;
}

void main() {
  // Media-local UV: 0–1 spans the media rect inset from the canvas by the
  // bleed margin. With no bleed uInset is 0 and this is exactly vUv, so every
  // parameter keeps its original panel-relative meaning.
  float span = 1.0 - 2.0 * uInset;
  vec2 mediaUv = (vUv - vec2(uInset)) / span;
  vec2 mouse = (uMouse - vec2(uInset)) / span;

  // Distances measured in aspect-corrected space so the lens stays circular.
  vec2 aspect = vec2(uAspect, 1.0);
  float dist = length((mediaUv - mouse) * aspect);

  // Two falloff shapes: a ringed smoothstep lens with a discernible boundary,
  // and a gaussian that fades to nothing with no boundary at all. uEdge blends
  // between them — 0 keeps every effect but hides the lens itself.
  float inner = uRadius * (1.0 - clamp(uFeather, 0.0, 1.0));
  float ring = 1.0 - smoothstep(inner, uRadius, dist);
  float gauss = exp(-3.0 * dist * dist / (uRadius * uRadius));
  float mask = mix(gauss, ring, uEdge) * uHover;

  // Every term below scales by mask, so outside the lens the result is just
  // the untouched texture clipped to the media rect. Taking that path early
  // skips the simplex evaluations and extra texture fetches — on a full-bleed
  // surface most of the screen, and all of it while idle. The mask is
  // spatially coherent, so warps branch uniformly.
  if (mask < 0.002) {
    float cov = coverage(mediaUv);
    if (cov <= 0.0) { gl_FragColor = vec4(0.0); return; }
    gl_FragColor = vec4(texture2D(uMap, coverUv(mediaUv)).rgb, cov);
    return;
  }

  // Refraction: pull space toward the cursor. Zero at the mask edge, so the
  // lens blends seamlessly into the undistorted image.
  vec2 displacement = (mouse - mediaUv) * uRefraction * mask;

  // Animated noise wobble inside the lens.
  vec3 noiseUv = vec3(mediaUv * aspect * uNoiseScale, uTime * uNoiseSpeed);
  displacement += vec2(snoise(noiseUv), snoise(noiseUv + 17.31)) * uDistortion * mask;

  // Directional smear trailing the pointer's velocity.
  displacement -= uVelocity * uSmear * mask;

  // Edge melt: dedicated noise displacement in a band hugging the media
  // rect's silhouette, riding the same cursor mask. Coverage is computed
  // *after* displacement, so the boundary itself deforms — the image spills
  // out into the bleed margin and caves back in near the cursor, instead of
  // warping strictly inside a hard rectangle.
  if (uInset > 0.0 && uMelt > 0.0) {
    vec2 edgeD = min(mediaUv, 1.0 - mediaUv) * aspect;
    float sd = min(edgeD.x, edgeD.y); // signed: negative out in the bleed
    float band = exp(-(sd * sd) / (uMeltBand * uMeltBand));
    vec2 meltP = mediaUv * aspect * uMeltScale;
    displacement += meltFlow(meltP, uTime * uMeltSpeed + 43.7) * uMelt * band * mask;
  }

  vec2 q = mediaUv + displacement;
  float cov = coverage(q);
  if (cov <= 0.0) { gl_FragColor = vec4(0.0); return; }

  // Chroma: disperse the total displacement per channel, like wavelength-
  // dependent refraction in real glass. No displacement = no fringing.
  vec3 color = vec3(
    texture2D(uMap, coverUv(mediaUv + displacement * (1.0 + uChroma))).r,
    texture2D(uMap, coverUv(q)).g,
    texture2D(uMap, coverUv(mediaUv + displacement * (1.0 - uChroma))).b
  );

  // Faint rim light peaking mid-falloff. Tied to the ring shape and scaled by
  // uEdge: an edgeless lens draws no rim.
  color += ring * (1.0 - ring) * 4.0 * uHighlight * uEdge * uHover;

  gl_FragColor = vec4(color, cov);
}
`

/**
 * Signed distance from a media-local point to the media rect's edge, in the
 * same aspect-corrected units as `lensSpread` (1 = the media's height);
 * negative once the point sits outside the media. Drives the glass mesh's
 * containment fade from its center; the dispersion shader measures the same
 * distance per fragment for the dissolve.
 */
const boundaryDistance = (x: number, y: number, aspect: number): number =>
  Math.min(Math.min(x, 1 - x) * aspect, Math.min(y, 1 - y))

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
  /**
   * External 0–1 activation source (1 = true hover) — e.g. the cursor
   * provider's proximity via `useCursorProximitySource` from
   * `@/features/cursor`, bound to a cursor target wrapping this panel. The
   * hover effects (warp, tilt, glass) pre-activate at that strength as the
   * pointer approaches, instead of waiting for it to enter the panel. The
   * subscribe function must return its unsubscribe.
   */
  subscribeProximity?: (listener: (t: number) => void) => () => void

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

  // --- Edge bleed & melt (the effect escaping the media box) ---
  /**
   * Fraction of the container the canvas extends past it on every side
   * (0 disables). The media itself keeps the container's rect; the margin is
   * transparent room the warp and melt displace the media's *silhouette*
   * into, so the effect isn't clipped at the bounding box. A visible glass
   * mesh also grows this overscan to at least `lensSpread`, so the sphere
   * can hang off the silhouette without hitting the framebuffer edge. The
   * parent chain must not clip (no overflow-hidden / residual clip-path)
   * for the overhang to show. The glass mesh clamps FBO samples that land
   * in that transparent margin back onto the media, so a visible lens can
   * hang over the edge without filling with the FBO's clear black.
   */
  bleed?: number
  /**
   * Amplitude of the edge-melt displacement in UV space (0–0.12 is
   * sensible). Deforms the media's boundary itself near the cursor — spilling
   * into the bleed and caving back in. Needs `bleed > 0`.
   */
  melt?: number
  /** Spatial frequency of the edge-melt noise — lower is broader and more fluid. */
  meltScale?: number
  /**
   * 0–1: how much of a second, warped octave joins the melt. 0 is a single
   * frequency (evenly sized lobes marching along the edge); higher mixes in
   * finer curling detail for an organic silhouette. Normalized, so it changes
   * the character of the edge, not how far it spills.
   */
  meltDetail?: number
  /** Time scale of the edge-melt noise. */
  meltSpeed?: number
  /** Width of the band around the media's edge that melts, in UV space. */
  meltBand?: number
  /** Softness of the melted silhouette's alpha edge, in UV space. */
  meltFeather?: number

  // --- Glass lens mesh (the dispersion technique) ---
  /** 0–1: how visible the glass mesh is (0 disables its refraction entirely). */
  lensVisibility?: number
  /** Glass mesh radius as a fraction of the panel's height. */
  lensSpread?: number
  /**
   * Keeps the glass mesh contained within the media. It fades out as its own
   * rim approaches the media's edge — full strength only while the whole
   * sphere sits inside, gone by the time the rim would cross — and dissolves
   * per-pixel across the same margin, so it can never hang off the silhouette
   * or stamp an opaque disc over the transparent bleed. This is the width of
   * that fade, in the same units as `lensSpread` (1 = the media's height).
   * Only the mesh is affected: the screen-space warp (refraction, chroma,
   * noise, smear) and the edge melt keep running right up to the boundary.
   * 0 disables.
   */
  lensFade?: number
  /** Glass thickness: z-scale relative to its radius (1 = full sphere). */
  lensDepth?: number
  /** Refraction offset strength per sample inside the glass. */
  lensRefraction?: number
  /** Spread between the glass's per-wavelength refraction vectors. */
  lensChroma?: number
  /** ≥1; re-saturates the pastel tint the dispersion loop introduces. */
  lensSaturation?: number

  // --- Motion ---
  /**
   * Max Y tilt of the media plane in degrees, reached at the panel's
   * horizontal edges. The plane presses away under the cursor and eases in
   * and out with hover; the perspective inset reveals the container behind
   * the transparent canvas, so give the panel a background. 0 disables.
   */
  tilt?: number
  /** Damping for the trailing cursor (higher = tighter follow). */
  follow?: number
  /** Damping for the hover fade in/out (higher = snappier). */
  ease?: number
  className?: string
} & GlassIorProps

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site or via a
 * named preset (see `../presets.ts`).
 */
export const REFRACTION_MEDIA_DEFAULTS = {
  spread: 0.22,
  feather: 0.6,
  edge: 0,
  refraction: 0.12,
  chroma: 0.35,
  distortion: 0.008,
  noiseScale: 6,
  noiseSpeed: 0.4,
  smear: 0.02,
  highlight: 0.08,
  bleed: 0,
  melt: 0.05,
  meltScale: 2.5,
  meltDetail: 0.65,
  meltSpeed: 0.4,
  meltBand: 0.1,
  meltFeather: 0.01,
  lensVisibility: 1,
  lensSpread: 0.22,
  lensFade: 0,
  lensDepth: 0.55,
  lensRefraction: 0.15,
  lensChroma: 0.5,
  lensSaturation: 1.04,
  ...GLASS_IOR_DEFAULTS,
  tilt: 0,
  follow: 8,
  ease: 6,
} as const satisfies Partial<RefractionMediaProps>

type RefractionMediaTuning = Required<
  Pick<RefractionMediaProps, keyof typeof REFRACTION_MEDIA_DEFAULTS>
>

type SceneProps = Pick<
  RefractionMediaProps,
  'src' | 'video' | 'source' | 'onReady' | 'subscribeProximity'
> & {
  /** Caller deltas already resolved against `REFRACTION_MEDIA_DEFAULTS`. */
  tuning: RefractionMediaTuning
}

/**
 * External activation (cursor-provider proximity): a ref fed by the
 * subscription, read in useFrame — never React state. Each change requests
 * a frame so the demand loop follows the approach.
 */
function useProximityHover(
  subscribeProximity: SceneProps['subscribeProximity'],
  invalidate: () => void,
) {
  const externalHover = useRef(0)

  useEffect(() => {
    if (!subscribeProximity) return
    const unsubscribe = subscribeProximity((t) => {
      if (externalHover.current === t) return
      externalHover.current = t
      invalidate()
    })
    return () => {
      unsubscribe()
      externalHover.current = 0
    }
  }, [subscribeProximity, invalidate])

  return externalHover
}

/**
 * The screen-space warp layer — the original hover effect: the material that
 * paints the media, the texture pipeline feeding it, and the parameter sync
 * that keeps the shader in step.
 */
function useWarpLayer({
  invalidate,
  onReady,
  onScreen,
  overscan,
  source,
  src,
  tuning,
  video,
}: Pick<SceneProps, 'src' | 'video' | 'source' | 'onReady'> & {
  invalidate: () => void
  onScreen: ReturnType<typeof useOnScreen>
  overscan: number
  tuning: RefractionMediaTuning
}) {
  const materialRef = useRef<ShaderMaterial>(null)

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
      uInset: { value: 0 },
      uMelt: { value: 0 },
      uMeltScale: { value: 2.5 },
      uMeltDetail: { value: 0.65 },
      uMeltSpeed: { value: 0.4 },
      uMeltBand: { value: 0.1 },
      uMeltFeather: { value: 0.01 },
    }),
    [],
  )

  const sourceAspect = useBackdropTexture({
    src,
    video,
    source,
    onReady,
    materialRef,
    onScreen,
  })
  useCoverFit(materialRef, sourceAspect)

  const {
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
    melt,
    meltScale,
    meltDetail,
    meltSpeed,
    meltBand,
    meltFeather,
  } = tuning

  // Shader parameters sync on prop change (not in useFrame: with a demand
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
    // Canvas-UV inset of the media: the wrapper grows by `overscan` per side
    // (bleed, or the glass radius if that's larger), so a panel-relative
    // fraction b maps to b / (1 + 2b) of the enlarged canvas.
    u.uInset.value = bleedToInset(overscan)
    u.uMelt.value = melt
    u.uMeltScale.value = meltScale
    u.uMeltDetail.value = meltDetail
    u.uMeltSpeed.value = meltSpeed
    u.uMeltBand.value = meltBand
    u.uMeltFeather.value = meltFeather
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
    overscan,
    melt,
    meltScale,
    meltDetail,
    meltSpeed,
    meltBand,
    meltFeather,
    invalidate,
  ])

  return { materialRef, uniforms }
}

/**
 * The glass lens layer: a real refracting mesh over the warped backdrop. It
 * only exists while it is optically present, so its material ref is null on
 * every render before that — `mounted` keys both syncs so they re-run when
 * the mesh appears. Otherwise a lens switched on after mount (the
 * playground's glass-lens control) keeps its seed resolution and stale
 * dispersion values, and paints a black disc.
 */
function useLensLayer({
  invalidate,
  mounted,
  overscan,
  tuning,
}: {
  invalidate: () => void
  mounted: boolean
  overscan: number
  tuning: RefractionMediaTuning
}) {
  const materialRef = useRef<ShaderMaterial>(null)

  const uniforms = useMemo(() => {
    const uniforms = createDispersionUniforms()
    // The glass starts optically invisible and eases in on hover.
    uniforms.uHover.value = 0
    return uniforms
  }, [])

  useWinResolution(materialRef, mounted)

  const {
    lensRefraction,
    lensChroma,
    lensSaturation,
    lensFade,
    iorR,
    iorY,
    iorG,
    iorC,
    iorB,
    iorP,
  } = tuning

  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!mounted || !u) return
    u.uRefractPower.value = lensRefraction
    u.uChromaticAberration.value = lensChroma
    u.uSaturation.value = lensSaturation
    u.uInset.value = bleedToInset(overscan)
    // The shader measures in canvas UV, the prop in media UV — rescale by the
    // media's share of the canvas so the dissolve spans the intended band.
    u.uEdgeFade.value = lensFade * (1 - 2 * bleedToInset(overscan))
    applyGlassIorUniforms(u, { iorR, iorY, iorG, iorC, iorB, iorP })
    invalidate()
  }, [
    mounted,
    lensRefraction,
    lensChroma,
    lensSaturation,
    overscan,
    lensFade,
    iorR,
    iorY,
    iorG,
    iorC,
    iorB,
    iorP,
    invalidate,
  ])

  return { materialRef, uniforms }
}

/**
 * Containment gate for the glass mesh alone: how much room its rim still has
 * inside the media, faded over lensFade. 0 once the sphere would cross the
 * media's edge — including a pointer parked out in the bleed while proximity
 * pre-activates the panel — so the mesh stays a lens *on* the media instead of
 * hanging off it. The warp and melt read uHover directly and are untouched by
 * this.
 */
function lensContainmentGate({
  aspect,
  inset,
  lensFade,
  lensSpread,
  mouse,
}: {
  aspect: number
  inset: number
  lensFade: number
  lensSpread: number
  mouse: Vector2
}) {
  if (lensFade <= 0) return 1
  const span = 1 - 2 * inset
  return MathUtils.smoothstep(
    boundaryDistance((mouse.x - inset) / span, (mouse.y - inset) / span, aspect) -
      glassSilhouetteRadius(lensSpread),
    0,
    lensFade,
  )
}

/**
 * Snapshot of the scene with the mesh hidden, for the glass to refract. Runs
 * only while the glass is optically present: an absent lens (lensVisibility 0,
 * or hover still easing out) would reproduce the backdrop exactly — skip the
 * extra scene render rather than pay it on every demand frame. The hero ships
 * with the glass off; IndustryWork keeps a small mesh on top of the warp.
 */
function captureBackdrop(
  state: RootState,
  mesh: Mesh,
  lens: ShaderMaterial,
  target: WebGLRenderTarget,
  glassHover: number,
) {
  if (glassHover <= 0.002) {
    mesh.visible = false
    return
  }
  const { gl, scene, camera } = state
  mesh.visible = false
  gl.setRenderTarget(target)
  gl.render(scene, camera)
  mesh.visible = true
  gl.setRenderTarget(null)
  lens.uniforms.uTexture.value = target.texture
}

function RefractionScene({
  src,
  video = false,
  source,
  onReady,
  subscribeProximity,
  tuning,
}: SceneProps) {
  const { bleed, ease, follow, lensDepth, lensFade, lensSpread, lensVisibility, tilt } = tuning
  const overscan = canvasOverscan(bleed, lensVisibility, lensSpread)

  // Select only what's needed; `useThree()` re-renders on any R3F state change.
  const viewport = useThree((state) => state.viewport)
  const invalidate = useThree((state) => state.invalidate)

  const meshRef = useRef<Mesh>(null)
  const backdropRef = useRef<Mesh>(null)

  const onScreen = useOnScreen()
  const pointer = usePointerTracking(onScreen)

  // The glass mesh only exists while it is optically present, so its material
  // ref is null on every render before that.
  const lensMounted = lensVisibility > 0

  const externalHover = useProximityHover(subscribeProximity, invalidate)

  // Velocity state lives in refs and feeds uniforms via useFrame — never React
  // state (perf-never-set-state-in-useframe).
  const velocityTarget = useRef(new Vector2())
  const previousMouse = useRef(new Vector2(0.5, 0.5))

  // Scene snapshot with the mesh hidden — the glass samples the *warped*
  // backdrop, so both effects compose.
  const backdropFBO = useFBO()

  const { materialRef: warpMaterialRef, uniforms: warpUniforms } = useWarpLayer({
    invalidate,
    onReady,
    onScreen,
    overscan,
    source,
    src,
    tuning,
    video,
  })
  const { materialRef: lensMaterialRef, uniforms: lensUniforms } = useLensLayer({
    invalidate,
    mounted: lensMounted,
    overscan,
    tuning,
  })

  // Tilt applies to the mesh in useFrame; on the demand frameloop a prop
  // change still needs to request the frame that picks it up. Same for
  // lensVisibility, which mounts or unmounts the glass mesh.
  // biome-ignore lint/correctness/useExhaustiveDependencies: prop changes must request a frame without being read here
  useEffect(() => invalidate(), [tilt, lensVisibility, invalidate])

  useFrame((state, delta) => {
    const mesh = meshRef.current
    const warp = warpMaterialRef.current
    const lens = lensMaterialRef.current
    if (!warp) return
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

    // True hover wins; otherwise an external proximity source drives a
    // partial activation while the pointer approaches the panel.
    const hoverTarget = pointer.inside.current ? 1 : externalHover.current
    u.uHover.value = MathUtils.damp(u.uHover.value, hoverTarget, ease, dt)
    u.uTime.value += dt

    const gate = lensContainmentGate({
      aspect: u.uAspect.value as number,
      inset: u.uInset.value as number,
      lensFade,
      lensSpread,
      mouse,
    })

    // Y tilt toward the cursor: the edge under the pointer presses away, at
    // full `tilt` degrees when the cursor reaches a horizontal edge. Driven by
    // the damped mouse (trails, never snaps) and scaled by the hover ease, so
    // it enters and settles back flat together with the warp.
    const backdrop = backdropRef.current
    if (backdrop) {
      backdrop.rotation.y = (mouse.x - 0.5) * 2 * MathUtils.degToRad(tilt) * u.uHover.value
    }

    // The glass rides the same damped pointer as the warp's center, and its
    // refraction shares the hover ease, scaled by how visible it should be and
    // by the containment gate — a mesh whose rim would cross the media's edge
    // retires instead of hanging off it.
    const glassHover = u.uHover.value * lensVisibility * gate
    if (mesh && lens) {
      const plane = glassPlaneSize(state.size.width / state.size.height)
      mesh.position.x = (mouse.x - 0.5) * plane.width
      mesh.position.y = (mouse.y - 0.5) * plane.height
      lens.uniforms.uHover.value = glassHover
      captureBackdrop(state, mesh, lens, backdropFBO, glassHover)
    } else if (mesh) {
      mesh.visible = false
    }

    // Keep requesting frames only while the lens is visible or still moving;
    // once everything settles the canvas goes fully idle. A playing video
    // source drives its own invalidation, so it is unaffected by settling.
    const settled = hoverTarget === 0 && u.uHover.value < 0.002 && velocity.lengthSq() < 1e-6
    if (!settled && onScreen.current) invalidate()
  })

  // Overscan grows the framebuffer past the media so a lens sitting on the
  // silhouette isn't clipped; keep `lensSpread` as a fraction of the *panel*
  // (the media rect), not the enlarged canvas, so bumping overscan doesn't
  // silently enlarge the sphere.
  const mediaSpan = 1 - 2 * bleedToInset(overscan)
  const lensScale = lensSpread * glassPlaneSize(1).height * mediaSpan

  return (
    <>
      <mesh
        ref={backdropRef}
        scale-x={viewport.width}
        scale-y={viewport.height}
        raycast={() => null}
      >
        <planeGeometry />
        {/* Transparent whenever the canvas hangs past the media: melt and the
            glass silhouette need alpha blending there. The legacy full-bleed
            path (no overscan) stays opaque so the page never shows through. */}
        <shaderMaterial
          ref={warpMaterialRef}
          transparent={overscan > 0}
          uniforms={warpUniforms}
          vertexShader={BACKDROP_VERTEX}
          fragmentShader={WARP_FRAGMENT}
        />
      </mesh>

      {lensMounted ? (
        <mesh
          ref={meshRef}
          position-z={GLASS_MESH_Z}
          scale={[lensScale, lensScale, lensScale * lensDepth]}
          raycast={() => null}
        >
          <sphereGeometry args={[1, 64, 64]} />
          {/* Transparent alongside the backdrop whenever the canvas hangs past
              the media: the boundary fade dissolves the mesh's own alpha there
              instead of stamping an opaque disc over the bleed. */}
          <shaderMaterial
            ref={lensMaterialRef}
            transparent={overscan > 0}
            uniforms={lensUniforms}
            vertexShader={DISPERSION_VERTEX}
            fragmentShader={DISPERSION_FRAGMENT}
          />
        </mesh>
      ) : null}
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
export function RefractionMedia({
  className,
  src,
  video,
  source,
  onReady,
  subscribeProximity,
  ...deltas
}: RefractionMediaProps) {
  const tuning = resolveTuning<RefractionMediaTuning>(REFRACTION_MEDIA_DEFAULTS, deltas)
  const overscan = canvasOverscan(tuning.bleed, tuning.lensVisibility, tuning.lensSpread)
  return (
    <div className={cn('pointer-events-none relative', className)}>
      {/* Overscan host: the canvas hangs past the container so melt and a
          glass mesh on the silhouette have transparent room. CSS inset %
          resolves against the matching axis, matching the shader's per-axis
          margin. Ancestors must not clip for the overhang to paint. */}
      <div className="absolute" style={{ inset: `${(-overscan * 100).toFixed(3)}%` }}>
        <Canvas
          dpr={GLASS_DPR}
          flat
          linear
          frameloop="demand"
          camera={GLASS_CAMERA}
          gl={GLASS_GL_OPTIONS}
          resize={CANVAS_RESIZE}
        >
          <RefractionScene
            onReady={onReady}
            source={source}
            src={src}
            subscribeProximity={subscribeProximity}
            tuning={tuning}
            video={video}
          />
        </Canvas>
      </div>
    </div>
  )
}

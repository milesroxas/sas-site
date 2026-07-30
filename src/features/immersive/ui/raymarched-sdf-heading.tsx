'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import {
  DataTexture,
  GLSL3,
  LinearFilter,
  RedFormat,
  type ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
} from 'three'

/**
 * True raymarching take on the heading reveal, built from the techniques in
 * Maxime Heckel's "Painting with Math: A Gentle Study of Raymarching":
 *
 * - The heading is converted into a real signed distance field (Euclidean
 *   distance transform of the DOM glyphs) lifted into 3D as a flat sheet on
 *   the z=0 plane.
 * - A fragment-shader raymarcher (ray origin + direction, marching by the
 *   scene SDF distance up to MAX_STEPS until within SURFACE_DIST) renders it.
 * - The reveal is a smooth-max intersection with a sweeping half-space, and
 *   metaball droplets ride the front, melting into the glyphs via the
 *   polynomial smooth-min from the article.
 * - Hits are lit with normals derived from the SDF gradient (Inigo Quilez's
 *   getNormal) — ambient from normal.y plus diffuse — and faded with a
 *   Beer's-law exponential over marched distance, both per the article.
 *
 * Renders in its own small WebGL canvas (classic renderer), like
 * RayMarchedHeading: GlobalCanvas prefers WebGPU where raw GLSL
 * ShaderMaterial is unsupported, and the panel must overlay a DOM heading.
 */

/** Overflow around the heading box so droplets and goo aren't clipped. */
const PAD_X = 160
const PAD_Y = 110
/** SDF texture resolution: 1 texel per CSS px (an SDF stays smooth anyway). */
const SDF_SCALE = 1
/** Encoded distance range (CSS px) around the glyph edge; also caps steps. */
const SPREAD_PX = 64
const DPR: [number, number] = [1, 2]

const VERTEX_SHADER = /* glsl */ `
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * The raymarcher. World units are CSS pixels of the overlay canvas; the text
 * SDF lives on the z=0 plane and the camera sits on +z, so a ray through
 * pixel q hits z=0 exactly at q and the settled silhouette matches the DOM.
 */
const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uSdf;
uniform vec2 uSize;      // overlay canvas size, CSS px
uniform float uSpread;   // SDF encode range, CSS px
uniform float uProgress; // 0 hidden -> 1 fully resolved
uniform float uTime;
uniform float uSteps;    // ray-march step budget
uniform float uGooey;    // smooth-min blend radius, px
uniform float uEdge;     // reveal-front smooth-max radius, px
uniform vec2 uDir;       // sweep direction (unit)
uniform float uDroplet;  // metaball base radius, px
uniform float uCount;    // active droplet count (0 disables)
uniform float uStretch;  // droplet elongation along the sweep (1 = sphere)
uniform float uScatter;  // droplet side scatter, fraction of heading height
uniform float uWobble;   // droplet wander amplitude, px
uniform vec3 uLightDir;  // key light direction (unit)
uniform float uCamZ;     // camera distance to the text plane, px
uniform vec3 uColor;     // settled text color, sampled from the DOM heading
in vec2 vUv;
out vec4 outColor;

const int MAX_STEPS = 96;
const float SURFACE_DIST = 0.4;
const int MAX_DROPLETS = 8;
const vec3 WARM = vec3(1.0, 0.85, 0.62);

// Polynomial smooth minimum (Inigo Quilez), the article's gooey-union glue.
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Smooth maximum = smooth intersection, used to cut the unrevealed half.
float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

/** 2D signed distance (CSS px) to the glyph outlines, from the EDT texture. */
float sdText(vec2 xy) {
  vec2 uv = xy / uSize + 0.5;
  return (0.5 - texture(uSdf, uv).r) * 2.0 * uSpread;
}

float revealFront() {
  float halfExt = 0.5 * (abs(uDir.x) * uSize.x + abs(uDir.y) * uSize.y);
  float pad = uEdge + uDroplet * 2.0 * max(uStretch, 1.0) + uGooey;
  return mix(-halfExt - pad, halfExt + pad, uProgress);
}

/** The world: flat text sheet, sweep-cut, unioned with droplets — all SDFs. */
float scene(vec3 p) {
  // Flat text sheet on the z=0 plane (2D field lifted into 3D, no extrusion).
  float d2 = sdText(p.xy);
  vec2 w = vec2(d2, abs(p.z));
  float text = min(max(w.x, w.y), 0.0) + length(max(w, 0.0));

  // Smooth intersection with the sweeping half-space: glyphs past the front
  // don't exist yet; those at the front are soft, half-melted.
  float front = revealFront();
  float d = smax(text, dot(p.xy, uDir) - front, uEdge);

  // Metaball droplets riding the front. smooth-min melts them into the
  // emerging glyphs; their envelope shrinks to zero as the reveal settles.
  float env = smoothstep(0.02, 0.18, uProgress) * (1.0 - smoothstep(0.72, 0.96, uProgress));
  if (env > 0.001 && uDroplet > 0.5 && uCount > 0.5) {
    vec2 perp = vec2(-uDir.y, uDir.x);
    for (int i = 0; i < MAX_DROPLETS; i++) {
      if (float(i) >= uCount) break;
      float fi = float(i);
      float h1 = hash(fi + 1.3);
      float h2 = hash(fi * 7.7 + 2.9);
      float along = front - (0.3 + 1.1 * h1) * uEdge
        + sin(uTime * (0.7 + 0.6 * h2) + fi * 2.4) * uEdge * 0.3;
      float side = (h2 - 0.5) * uSize.y * uScatter
        + sin(uTime * (1.0 + 0.8 * h1) + fi * 1.7) * uWobble;
      vec3 c = vec3(uDir * along + perp * side, 0.0);
      float r = uDroplet * (0.5 + 0.7 * h1) * env;
      // Ellipsoid: scale the along-sweep axis by uStretch, then correct the
      // distance bound by the smallest axis scale so marching stays safe.
      vec3 rel = p - c;
      float ax = dot(rel.xy, uDir);
      float sd = dot(rel.xy, perp);
      vec3 lq = vec3(ax / max(uStretch, 0.05), sd, rel.z);
      float dd = (length(lq) - r) * min(uStretch, 1.0);
      d = smin(d, dd, uGooey);
    }
  }
  return d;
}

/** Normal from the SDF gradient — the article's getNormal, 1px epsilon. */
vec3 getNormal(vec3 p) {
  vec2 e = vec2(0.75, 0.0);
  vec3 n = scene(p) - vec3(scene(p - e.xyy), scene(p - e.yxy), scene(p - e.yyx));
  return normalize(n);
}

void main() {
  vec2 q = (vUv - 0.5) * uSize;
  vec3 ro = vec3(0.0, 0.0, uCamZ);
  vec3 rd = normalize(vec3(q, -uCamZ));

  // March: step by the scene distance until a hit or the budget runs out.
  float maxDist = uCamZ * 2.5;
  float t = 0.0;
  float minD = 1e6;
  bool hit = false;
  for (int i = 0; i < MAX_STEPS; i++) {
    if (float(i) >= uSteps) break;
    vec3 p = ro + rd * t;
    float dS = scene(p);
    minD = min(minD, dS);
    if (dS < SURFACE_DIST) {
      hit = true;
      break;
    }
    t += dS * 0.85; // conservative step: smooth ops can slightly overestimate
    if (t > maxDist) break;
  }

  vec3 col = uColor * 0.8;
  float alpha = 0.0;

  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = getNormal(p);
    float amb = clamp(0.5 + 0.5 * n.y, 0.0, 1.0);
    float diffuse = clamp(dot(n, uLightDir), 0.0, 1.0);
    float spec = pow(clamp(dot(reflect(-uLightDir, n), -rd), 0.0, 1.0), 24.0);
    col = uColor * (0.38 + 0.34 * amb + 0.5 * diffuse) + WARM * spec * 0.45;
    // Beer's law: goo that sits behind the text plane fades exponentially.
    alpha = exp(-max(0.0, t - uCamZ) * 0.004);
  } else {
    // Near-miss glow doubles as silhouette anti-aliasing.
    alpha = 1.0 - smoothstep(0.0, 1.5, minD);
  }

  // Converge onto flat, analytically-antialiased glyphs as the reveal
  // settles so the crossfade to the DOM heading is seamless.
  float dFlat = sdText(q);
  float aaw = max(fwidth(dFlat), 0.5);
  float crisp = 1.0 - smoothstep(-aaw, aaw, dFlat);
  float settle = smoothstep(0.82, 1.0, uProgress);
  col = mix(col, uColor, settle);
  alpha = mix(alpha, crisp, settle);

  alpha *= smoothstep(0.0, 0.04, uProgress);
  outColor = vec4(col, alpha);
}
`

export type RaymarchedSdfHeadingProps = {
  /** Heading text; rendered as real DOM chars and mirrored into the SDF. */
  text: string
  /** Tweened externally (GSAP): 0 hidden → 1 fully resolved. */
  progressRef: RefObject<{ value: number }>
  /** Ray-march step budget (16–96). */
  steps?: number
  /** smooth-min blend radius in px melting droplets into glyphs. */
  gooeyPx?: number
  /** Softness in px of the sweeping reveal front. */
  edgePx?: number
  /** Sweep direction in degrees (0 = left → right). */
  angle?: number
  /** Metaball droplet base radius in px (0 disables droplets). */
  dropletPx?: number
  /** Number of droplets riding the front (0–8; 0 disables). */
  dropletCount?: number
  /** Droplet elongation along the sweep (1 = sphere, >1 = teardrop streak). */
  dropletStretch?: number
  /** Side scatter of droplets, as a fraction of the heading height (0–1). */
  dropletScatter?: number
  /** Droplet wander amplitude in px. */
  wobblePx?: number
  /** Key light direction in degrees around the text plane. */
  lightAngle?: number
  /** Applied to the DOM heading (sizing/color); the GL panel mirrors it. */
  className?: string
}

/**
 * Single source of truth for this shader's tunable defaults.
 * TextLoadInRaymarched's public defaults reference these — change them here,
 * not at call sites.
 */
export const RAYMARCHED_SDF_HEADING_DEFAULTS = {
  steps: 64,
  gooeyPx: 18,
  edgePx: 56,
  angle: 0,
  dropletPx: 12,
  dropletCount: 5,
  dropletStretch: 1,
  dropletScatter: 0.5,
  wobblePx: 10,
  lightAngle: 125,
} as const satisfies Partial<RaymarchedSdfHeadingProps>

type SceneProps = Pick<
  RaymarchedSdfHeadingProps,
  | 'progressRef'
  | 'steps'
  | 'gooeyPx'
  | 'edgePx'
  | 'angle'
  | 'dropletPx'
  | 'dropletCount'
  | 'dropletStretch'
  | 'dropletScatter'
  | 'wobblePx'
  | 'lightAngle'
> & {
  headingRef: RefObject<HTMLHeadingElement | null>
  dirtyRef: RefObject<boolean>
}

const INF = 1e20

/**
 * Felzenszwalb & Huttenlocher 1D squared-distance transform (in place),
 * the standard exact Euclidean distance transform used by tiny-sdf.
 */
function edt1d(
  grid: Float32Array,
  offset: number,
  stride: number,
  length: number,
  f: Float32Array,
  v: Uint16Array,
  z: Float32Array,
): void {
  v[0] = 0
  z[0] = -INF
  z[1] = INF
  for (let q = 0; q < length; q++) f[q] = grid[offset + q * stride]
  for (let q = 1, k = 0; q < length; q++) {
    let s = 0
    let r = 0
    do {
      r = v[k]
      s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2
    } while (s <= z[k] && --k > -1)
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }
  for (let q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) k++
    const r = v[k]
    grid[offset + q * stride] = f[r] + (q - r) * (q - r)
  }
}

function edt(
  grid: Float32Array,
  width: number,
  height: number,
  f: Float32Array,
  v: Uint16Array,
  z: Float32Array,
): void {
  for (let x = 0; x < width; x++) edt1d(grid, x, width, height, f, v, z)
  for (let y = 0; y < height; y++) edt1d(grid, y * width, 1, width, f, v, z)
}

type SdfBuild = {
  data: Uint8Array
  width: number
  height: number
  cssWidth: number
  cssHeight: number
  /** Heading's computed CSS color as sRGB 0–1 — the shader's settled color. */
  color: [number, number, number]
}

/**
 * Rasterize the heading's characters at their DOM-measured positions, then
 * run an exact Euclidean distance transform (seeded from coverage for
 * sub-pixel edges, tiny-sdf style) to produce a signed distance texture:
 * 0.5 at the glyph edge, >0.5 inside, <0.5 outside, ±SPREAD_PX px range.
 */
function buildSdfField(heading: HTMLHeadingElement): SdfBuild | null {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const box = heading.getBoundingClientRect()
  const cssWidth = Math.max(1, box.width + PAD_X * 2)
  const cssHeight = Math.max(1, box.height + PAD_Y * 2)
  const width = Math.ceil(cssWidth * SDF_SCALE)
  const height = Math.ceil(cssHeight * SDF_SCALE)
  canvas.width = width
  canvas.height = height

  const style = getComputedStyle(heading)

  // Resolve the heading's computed color (may be oklch) to sRGB by drawing it.
  ctx.fillStyle = style.color
  ctx.fillRect(0, 0, 1, 1)
  const px = ctx.getImageData(0, 0, 1, 1).data
  const color: [number, number, number] = [px[0] / 255, px[1] / 255, px[2] / 255]

  ctx.clearRect(0, 0, width, height)
  ctx.font = `${style.fontWeight} ${parseFloat(style.fontSize) * SDF_SCALE}px ${style.fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff'

  // CSS puts each char span's baseline at half-leading + ascent below the
  // span's top; using the raw font ascent alone leaves the raster offset from
  // the DOM glyphs, which reads as a snap when the overlay hands off.
  const metrics = ctx.measureText('Hg')
  const fontExtent = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
  const lineHeight = parseFloat(style.lineHeight)
  const halfLeading = Number.isFinite(lineHeight) ? (lineHeight - fontExtent) / 2 : 0
  const baseline = (halfLeading + metrics.fontBoundingBoxAscent) * SDF_SCALE

  for (const span of heading.querySelectorAll<HTMLElement>('[data-char]')) {
    const ch = span.textContent
    if (!ch) continue
    const rect = span.getBoundingClientRect()
    ctx.fillText(
      ch,
      (rect.left - box.left + PAD_X) * SDF_SCALE,
      (rect.top - box.top + PAD_Y) * SDF_SCALE + baseline,
    )
  }

  const img = ctx.getImageData(0, 0, width, height)
  const n = width * height
  const gridOuter = new Float32Array(n)
  const gridInner = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const a = img.data[i * 4 + 3] / 255
    gridOuter[i] = a === 1 ? 0 : a === 0 ? INF : Math.max(0, 0.5 - a) ** 2
    gridInner[i] = a === 1 ? INF : a === 0 ? 0 : Math.max(0, a - 0.5) ** 2
  }

  const size = Math.max(width, height)
  const f = new Float32Array(size)
  const v = new Uint16Array(size)
  const z = new Float32Array(size + 1)
  edt(gridOuter, width, height, f, v, z)
  edt(gridInner, width, height, f, v, z)

  const spread = SPREAD_PX * SDF_SCALE
  const data = new Uint8Array(n)
  for (let y = 0; y < height; y++) {
    // Flip rows so uv v=0 is the bottom (GL convention; DataTexture no flipY).
    const src = (height - 1 - y) * width
    for (let x = 0; x < width; x++) {
      const i = src + x
      const d = Math.sqrt(gridOuter[i]) - Math.sqrt(gridInner[i])
      data[y * width + x] = Math.max(0, Math.min(255, Math.round(255 * (0.5 - (0.5 * d) / spread))))
    }
  }

  return { data, width, height, cssWidth, cssHeight, color }
}

function RaymarchScene({
  headingRef,
  dirtyRef,
  progressRef,
  steps = RAYMARCHED_SDF_HEADING_DEFAULTS.steps,
  gooeyPx = RAYMARCHED_SDF_HEADING_DEFAULTS.gooeyPx,
  edgePx = RAYMARCHED_SDF_HEADING_DEFAULTS.edgePx,
  angle = RAYMARCHED_SDF_HEADING_DEFAULTS.angle,
  dropletPx = RAYMARCHED_SDF_HEADING_DEFAULTS.dropletPx,
  dropletCount = RAYMARCHED_SDF_HEADING_DEFAULTS.dropletCount,
  dropletStretch = RAYMARCHED_SDF_HEADING_DEFAULTS.dropletStretch,
  dropletScatter = RAYMARCHED_SDF_HEADING_DEFAULTS.dropletScatter,
  wobblePx = RAYMARCHED_SDF_HEADING_DEFAULTS.wobblePx,
  lightAngle = RAYMARCHED_SDF_HEADING_DEFAULTS.lightAngle,
}: SceneProps) {
  const viewport = useThree((state) => state.viewport)
  const materialRef = useRef<ShaderMaterial>(null)
  const sizeRef = useRef<[number, number]>([1, 1])

  // Initial values only — runtime updates go through materialRef.current.
  const uniforms = useMemo(
    () => ({
      uSdf: { value: null as DataTexture | null },
      uSize: { value: new Vector2(1, 1) },
      uSpread: { value: SPREAD_PX },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSteps: { value: 64 },
      uGooey: { value: 18 },
      uEdge: { value: 56 },
      uDir: { value: new Vector2(1, 0) },
      uDroplet: { value: 12 },
      uCount: { value: 5 },
      uStretch: { value: 1 },
      uScatter: { value: 0.5 },
      uWobble: { value: 10 },
      uLightDir: { value: new Vector3(0, 0, 1) },
      uCamZ: { value: 800 },
      uColor: { value: new Vector3(0.957, 0.957, 0.961) },
    }),
    [],
  )

  useEffect(() => {
    const material = materialRef.current
    return () => {
      const texture = material?.uniforms.uSdf.value as DataTexture | null
      texture?.dispose()
    }
  }, [])

  useFrame(({ clock }) => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms

    const heading = headingRef.current
    if (dirtyRef.current && heading) {
      dirtyRef.current = false
      const built = buildSdfField(heading)
      if (built) {
        sizeRef.current = [built.cssWidth, built.cssHeight]
        ;(u.uColor.value as Vector3).set(...built.color)
        const texture = new DataTexture(
          built.data,
          built.width,
          built.height,
          RedFormat,
          UnsignedByteType,
        )
        texture.minFilter = LinearFilter
        texture.magFilter = LinearFilter
        texture.unpackAlignment = 1
        texture.needsUpdate = true
        ;(u.uSdf.value as DataTexture | null)?.dispose()
        u.uSdf.value = texture
      }
    }

    u.uProgress.value = progressRef.current?.value ?? 0
    u.uTime.value = clock.elapsedTime
    u.uSteps.value = steps
    u.uGooey.value = Math.max(gooeyPx, 1)
    u.uEdge.value = Math.max(edgePx, 1)
    u.uDroplet.value = dropletPx
    u.uCount.value = Math.min(Math.max(Math.round(dropletCount), 0), 8)
    u.uStretch.value = Math.max(dropletStretch, 0.05)
    u.uScatter.value = Math.max(dropletScatter, 0)
    u.uWobble.value = wobblePx

    const [w, h] = sizeRef.current
    ;(u.uSize.value as Vector2).set(w, h)
    u.uCamZ.value = Math.max(w, h) * 1.2

    const sweep = (angle * Math.PI) / 180
    ;(u.uDir.value as Vector2).set(Math.cos(sweep), Math.sin(sweep))
    const light = (lightAngle * Math.PI) / 180
    ;(u.uLightDir.value as Vector3)
      .set(Math.cos(light) * 0.8, Math.sin(light) * 0.8, 0.6)
      .normalize()
  })

  return (
    <mesh scale-x={viewport.width} scale-y={viewport.height}>
      <planeGeometry />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        glslVersion={GLSL3}
        transparent
      />
    </mesh>
  )
}

/**
 * Heading revealed by a genuine SDF raymarcher: real DOM characters
 * (data-heading-final) are distance-transformed into a flat 3D scene
 * on a WebGL overlay (data-heading-gl), where a smooth-min goo sweep resolves
 * them with SDF-gradient lighting. The parent owns the GSAP timeline: it
 * tweens `progressRef` and crossfades the overlay back to the DOM heading at
 * the end so the settled text is crisp and selectable.
 */
export function RaymarchedSdfHeading({ text, className, ...scene }: RaymarchedSdfHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const dirtyRef = useRef(true)

  const chars = useMemo(() => Array.from(text), [text])

  useEffect(() => {
    void text
    dirtyRef.current = true
  }, [text])

  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      dirtyRef.current = true
    })
    observer.observe(el)
    // Theme toggles flip [data-theme] on <html>; rebuild so the shader picks
    // up the heading's new computed color.
    const themeObserver = new MutationObserver(() => {
      dirtyRef.current = true
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) dirtyRef.current = true
    })
    return () => {
      cancelled = true
      observer.disconnect()
      themeObserver.disconnect()
    }
  }, [])

  return (
    // w-fit: the GL overlay is sized off this box via inset, so it must
    // shrink-wrap the heading exactly or the texture stretches to fill.
    <div className="relative w-fit">
      <h3 ref={headingRef} data-heading-final className={className}>
        {chars.map((ch, i) =>
          ch === ' ' ? (
            ' '
          ) : (
            <span key={i} data-char className="inline-block">
              {ch}
            </span>
          ),
        )}
      </h3>
      <div
        data-heading-gl
        aria-hidden
        className="pointer-events-none absolute"
        style={{ inset: `${-PAD_Y}px ${-PAD_X}px` }}
      >
        <Canvas dpr={DPR} flat linear>
          <RaymarchScene headingRef={headingRef} dirtyRef={dirtyRef} {...scene} />
        </Canvas>
      </div>
    </div>
  )
}

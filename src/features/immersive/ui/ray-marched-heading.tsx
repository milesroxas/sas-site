'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import {
  CanvasTexture,
  GLSL3,
  LinearFilter,
  LinearMipmapLinearFilter,
  type ShaderMaterial,
  Vector2,
} from 'three'

/**
 * Renders in its own small WebGL canvas (classic renderer), like
 * ChromaSplitText: GlobalCanvas prefers WebGPU where raw GLSL ShaderMaterial
 * is unsupported, and the panel must overlay a DOM heading anyway.
 */

/** Overflow around the heading box so the smear halo isn't clipped. */
const PAD_X = 220
const PAD_Y = 120
/** Texture resolution multiplier over CSS pixels. */
const TEXTURE_SCALE = 2
const DPR: [number, number] = [1, 2]

const VERTEX_SHADER = /* glsl */ `
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * WebGL2 / GLSL ES 3.00 anisotropic-blur reveal.
 *
 * The heading is drawn once into a mipmapped canvas texture; each glyph's
 * reveal rank lives in the color channel (premultiplied upload, so a blurred
 * sample's r/a is the coverage-weighted rank around that point).
 *
 * Per fragment: march jittered taps along the smear direction. Each tap
 * decodes the sampled glyph's reveal progress from a mid-level mip (a smooth
 * rank field), then fetches coverage as pure trilinear mip diffusion sized
 * by that glyph's unresolvedness — the blob is the mip pyramid itself, so it
 * is perfectly smooth and isotropic with no sample pattern; the 1D march
 * only elongates it into a motion-blur streak whose reach shrinks as the
 * character resolves. Peak-preserving normalization keeps blobs visible from
 * the first frame, the soft threshold (uGooey) melts overlapping blobs into
 * one mass, and each fragment converges onto the crisp lod-0 texel as its
 * glyph resolves so the settled frame matches the DOM heading exactly.
 */
const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uMap;
uniform float uProgress;
uniform float uStagger;
uniform vec2 uSmearUv;
uniform vec2 uDir;
uniform float uSteps;
uniform float uMaxLod;
uniform float uGooey;
uniform float uFade;
in vec2 vUv;
out vec4 outColor;

const int MAX_TAPS = 33;

float charProgress(float rank) {
  float s = uStagger * 0.95;
  return clamp((uProgress - rank * s) / max(1.0 - s, 0.001), 0.0, 1.0);
}

/** Interleaved gradient noise: stable per-pixel dither along the ray. */
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

void main() {
  // Rank decodes from a mid-level mip: a smooth field, so reveal progress
  // blends continuously between neighbouring characters.
  float rankLod = uMaxLod * 0.55;

  float taps = clamp(uSteps, 9.0, float(MAX_TAPS));
  float halfT = floor((taps - 1.0) * 0.5);
  float dt = 1.0 / max(halfT, 1.0);
  // Sub-step jitter turns any residual tap banding into invisible noise.
  float jitter = (ign(gl_FragCoord.xy) - 0.5) * dt;

  float acc = 0.0;
  float wsum = 0.0;

  for (int i = 0; i < MAX_TAPS; i++) {
    if (float(i) >= taps) break;
    float t = (float(i) - halfT) * dt + jitter; // -1..1 along the smear
    vec2 uv = vUv + uDir * t * uSmearUv;

    vec4 rs = textureLod(uMap, uv, rankLod);
    // Empty taps keep full reach so they dilute the streak toward its tips.
    float pS = rs.a > 0.002 ? charProgress(rs.r / rs.a) : 0.0;
    float reach = max(1.0 - pS, 0.05);

    // The blob itself is pure trilinear mip diffusion — perfectly smooth,
    // isotropic, no sample pattern — sized by the sampled glyph's own
    // unresolvedness. The 1D march only elongates it into a smear.
    float cov = textureLod(uMap, uv, reach * uMaxLod).a;
    float w = clamp(1.0 - abs(t) / reach, 0.0, 1.0);
    w = w * w * (3.0 - 2.0 * w); // smooth shoulder, soft tips
    float fadeMul = mix(1.0, smoothstep(0.0, 0.85, pS), uFade);
    acc += cov * fadeMul * w;
    wsum += w;
  }

  float blob = wsum > 0.0 ? acc / wsum : 0.0;

  // Soft threshold: overlapping blobs from neighbouring characters sum past
  // it and melt into one mass while unresolved.
  float lo = 0.25 * uGooey;
  float hi = max(1.0 - 0.55 * uGooey, lo + 0.001);
  float goo = smoothstep(lo, hi, blob);

  // Converge onto the crisp texel as the local glyph resolves so the final
  // frame matches the DOM heading exactly for the crossfade.
  vec4 c0 = textureLod(uMap, vUv, rankLod);
  float pLocal = c0.a > 0.002 ? charProgress(c0.r / c0.a) : 0.0;
  float crisp = texture(uMap, vUv).a;
  float alpha = mix(goo, crisp, smoothstep(0.55, 0.95, pLocal));
  alpha *= smoothstep(0.0, 0.05, uProgress);

  outColor = vec4(vec3(0.957, 0.957, 0.961), alpha);
}
`

export type RayMarchedHeadingProps = {
  /** Heading text; rendered as real DOM chars and mirrored into the shader. */
  text: string
  /** Tweened externally (GSAP): 0 hidden → 1 fully resolved. */
  progressRef: RefObject<{ value: number }>
  /** 0 = all characters together, → 1 = fully sequential reveal. */
  stagger?: number
  /** Max smear distance in CSS px while a character is unresolved. */
  smearPx?: number
  /** Gaussian gather tap count (8–32). */
  steps?: number
  /** Smear direction in degrees (0 = horizontal). */
  angle?: number
  /** 0–1: soft-threshold strength melting adjacent characters together. */
  gooey?: number
  /** 0–1: how much unresolved characters are faded down. */
  fade?: number
  /** Applied to the DOM heading (sizing/color); the GL panel mirrors it. */
  className?: string
}

/**
 * Single source of truth for this shader's tunable defaults. TextLoadIn's
 * public defaults reference these — change them here, not at call sites.
 */
export const RAY_MARCHED_HEADING_DEFAULTS = {
  stagger: 0.6,
  smearPx: 170,
  steps: 24,
  angle: 0,
  gooey: 0.5,
  fade: 0.35,
} as const satisfies Partial<RayMarchedHeadingProps>

type SceneProps = Pick<
  RayMarchedHeadingProps,
  'progressRef' | 'stagger' | 'smearPx' | 'steps' | 'angle' | 'gooey' | 'fade'
> & {
  headingRef: RefObject<HTMLHeadingElement | null>
  dirtyRef: RefObject<boolean>
}

/**
 * Draw the heading's characters into the 2D canvas at their DOM-measured
 * positions (so GL and DOM text align exactly), encoding each character's
 * reveal rank as the fill color while alpha stays glyph coverage.
 * Returns the canvas CSS size.
 */
function drawGlyphTexture(
  heading: HTMLHeadingElement,
  canvas: HTMLCanvasElement,
): [number, number] {
  const ctx = canvas.getContext('2d')
  if (!ctx) return [1, 1]

  const box = heading.getBoundingClientRect()
  const cssWidth = Math.max(1, box.width + PAD_X * 2)
  const cssHeight = Math.max(1, box.height + PAD_Y * 2)
  canvas.width = Math.ceil(cssWidth * TEXTURE_SCALE)
  canvas.height = Math.ceil(cssHeight * TEXTURE_SCALE)

  const style = getComputedStyle(heading)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = `${style.fontWeight} ${parseFloat(style.fontSize) * TEXTURE_SCALE}px ${style.fontFamily}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  const ascent = ctx.measureText('Hg').fontBoundingBoxAscent

  const spans = [...heading.querySelectorAll<HTMLElement>('[data-char]')]
  const count = Math.max(spans.length - 1, 1)
  spans.forEach((span, i) => {
    const ch = span.textContent
    if (!ch) return
    const rect = span.getBoundingClientRect()
    const rank = Math.round((i / count) * 255)
    ctx.fillStyle = `rgb(${rank},${rank},${rank})`
    ctx.fillText(
      ch,
      (rect.left - box.left + PAD_X) * TEXTURE_SCALE,
      (rect.top - box.top + PAD_Y) * TEXTURE_SCALE + ascent,
    )
  })

  return [cssWidth, cssHeight]
}

function SmearScene({
  headingRef,
  dirtyRef,
  progressRef,
  stagger = RAY_MARCHED_HEADING_DEFAULTS.stagger,
  smearPx = RAY_MARCHED_HEADING_DEFAULTS.smearPx,
  steps = RAY_MARCHED_HEADING_DEFAULTS.steps,
  angle = RAY_MARCHED_HEADING_DEFAULTS.angle,
  gooey = RAY_MARCHED_HEADING_DEFAULTS.gooey,
  fade = RAY_MARCHED_HEADING_DEFAULTS.fade,
}: SceneProps) {
  const viewport = useThree((state) => state.viewport)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  const sizeRef = useRef<[number, number]>([1, 1])

  // Initial values only — runtime updates go through materialRef.current.
  const uniforms = useMemo(
    () => ({
      uMap: { value: null as CanvasTexture | null },
      uProgress: { value: 0 },
      uStagger: { value: 0.6 },
      uSmearUv: { value: new Vector2() },
      uDir: { value: new Vector2(1, 0) },
      uSteps: { value: 24 },
      uMaxLod: { value: 6 },
      uGooey: { value: 0.5 },
      uFade: { value: 0.35 },
    }),
    [],
  )

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvasRef.current = canvas
    const texture = new CanvasTexture(canvas)
    // The mip pyramid doubles as the blur backbone (textureLod), and the
    // premultiplied upload makes blurred r/a a weighted-average rank field.
    texture.generateMipmaps = true
    texture.minFilter = LinearMipmapLinearFilter
    texture.magFilter = LinearFilter
    texture.premultiplyAlpha = true
    const material = materialRef.current
    if (material) material.uniforms.uMap.value = texture
    dirtyRef.current = true
    return () => {
      texture.dispose()
      if (material) material.uniforms.uMap.value = null
    }
  }, [dirtyRef])

  useFrame(() => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms

    const heading = headingRef.current
    const canvas = canvasRef.current
    const texture = u.uMap.value as CanvasTexture | null
    if (dirtyRef.current && heading && canvas && texture) {
      dirtyRef.current = false
      sizeRef.current = drawGlyphTexture(heading, canvas)
      texture.needsUpdate = true
    }

    u.uProgress.value = progressRef.current?.value ?? 0
    u.uStagger.value = stagger
    u.uSteps.value = steps
    u.uGooey.value = gooey
    u.uFade.value = fade

    const [w, h] = sizeRef.current
    ;(u.uSmearUv.value as Vector2).set(smearPx / w, smearPx / h)
    const rad = (angle * Math.PI) / 180
    ;(u.uDir.value as Vector2).set(Math.cos(rad), Math.sin(rad))

    // Deepest mip the shader may sample: enough to blur ~smearPx of glyph,
    // capped below the coarsest levels (those average the whole texture).
    const mipTop = Math.log2(Math.max(4, Math.max(w, h) * TEXTURE_SCALE)) - 2
    const blurLod = Math.log2(Math.max(2, smearPx * TEXTURE_SCALE * 0.5))
    u.uMaxLod.value = Math.max(1, Math.min(blurLod, mipTop))
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
 * Heading whose reveal runs through an anisotropic-blur smear shader: real
 * DOM characters (data-heading-final) are mirrored into a WebGL overlay
 * (data-heading-gl) that blurs and melts characters into each other while
 * they resolve. The parent owns the GSAP timeline: it tweens `progressRef`
 * and crossfades the overlay back to the DOM heading at the end so the
 * settled text is crisp and selectable.
 */
export function RayMarchedHeading({ text, className, ...scene }: RayMarchedHeadingProps) {
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
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) dirtyRef.current = true
    })
    return () => {
      cancelled = true
      observer.disconnect()
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
          <SmearScene headingRef={headingRef} dirtyRef={dirtyRef} {...scene} />
        </Canvas>
      </div>
    </div>
  )
}

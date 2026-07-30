'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import cn from 'clsx'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, LinearFilter, MathUtils, type ShaderMaterial } from 'three'

/**
 * Renders in its own small WebGL canvas (classic renderer) rather than the
 * global one: GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is
 * unsupported (WebGPURenderer only accepts TSL node materials), and the panel
 * needs to sit inside a DOM card anyway.
 */

const TEXTURE_WIDTH = 1024
const TEXTURE_HEIGHT = 256
const DPR: [number, number] = [1, 2]

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
uniform float uStrength;
uniform float uAngle;
uniform float uWobble;
uniform float uRadial;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  float pulse = 1.0 + uWobble * 0.6 * sin(uTime * 1.3);
  float angle = uAngle + uWobble * 0.8 * sin(uTime * 0.7);
  vec2 offset = uStrength * pulse * vec2(cos(angle), sin(angle)) * uIntensity;
  if (uRadial > 0.5) {
    offset = (vUv - 0.5) * uStrength * pulse * 2.0 * uIntensity;
  }

  vec4 base = texture2D(uMap, vUv);
  vec4 shiftA = texture2D(uMap, vUv + offset);
  vec4 shiftB = texture2D(uMap, vUv - offset);

  float alpha = max(base.a, max(shiftA.a, shiftB.a));
  gl_FragColor = vec4(shiftA.r, base.g, shiftB.b, alpha);
}
`

export type ChromaSplitTextProps = {
  /** Element whose textContent is mirrored into the shader (observed live). */
  sourceRef: RefObject<HTMLElement | null>
  /** Max RGB offset in UV space (0–0.05 is a sensible range). */
  strength?: number
  /** Time scale for the wobble animation. */
  speed?: number
  /** 0–1: how much the offset pulses and its angle drifts. */
  wobble?: number
  /** Base split direction in degrees. */
  angle?: number
  /** Split radially from the center instead of along one direction. */
  radial?: boolean
  /** When false the split eases out to plain text (e.g. between transitions). */
  active?: boolean
  /**
   * Texts the font size is fitted against (widest wins) so the rendered size
   * stays constant while the source text changes. Defaults to the current text.
   */
  fitTexts?: readonly string[]
  className?: string
}

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site.
 */
export const CHROMA_SPLIT_TEXT_DEFAULTS = {
  strength: 0.005,
  speed: 0.4,
  wobble: 0.9,
  angle: 0,
  radial: false,
} as const satisfies Partial<ChromaSplitTextProps>

type SceneProps = Omit<ChromaSplitTextProps, 'className'>

function ChromaScene({
  sourceRef,
  strength = CHROMA_SPLIT_TEXT_DEFAULTS.strength,
  speed = CHROMA_SPLIT_TEXT_DEFAULTS.speed,
  wobble = CHROMA_SPLIT_TEXT_DEFAULTS.wobble,
  angle = CHROMA_SPLIT_TEXT_DEFAULTS.angle,
  radial = CHROMA_SPLIT_TEXT_DEFAULTS.radial,
  active = true,
  fitTexts,
}: SceneProps) {
  const viewport = useThree((state) => state.viewport)
  const dirtyRef = useRef(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const materialRef = useRef<ShaderMaterial>(null)

  const fitKey = fitTexts?.join('|') ?? ''
  useEffect(() => {
    void fitKey
    dirtyRef.current = true
  }, [fitKey])

  // Initial values only — R3F may copy this object into the material, so all
  // runtime updates go through materialRef.current.uniforms, never this object.
  const uniforms = useMemo(
    () => ({
      uMap: { value: null as CanvasTexture | null },
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uAngle: { value: 0 },
      uWobble: { value: 0 },
      uRadial: { value: 0 },
      uIntensity: { value: 0 },
    }),
    [],
  )

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = TEXTURE_WIDTH
    canvas.height = TEXTURE_HEIGHT
    canvasRef.current = canvas

    const texture = new CanvasTexture(canvas)
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    const material = materialRef.current
    if (material) material.uniforms.uMap = { value: texture }

    const source = sourceRef.current
    const observer = new MutationObserver(() => {
      dirtyRef.current = true
    })
    if (source) {
      observer.observe(source, { characterData: true, childList: true, subtree: true })
    }
    dirtyRef.current = true

    return () => {
      observer.disconnect()
      texture.dispose()
      if (material) material.uniforms.uMap = { value: null }
    }
  }, [sourceRef])

  useFrame((_, delta) => {
    const material = materialRef.current
    if (!material) return
    const u = material.uniforms
    if (u.uTime) u.uTime.value += delta * speed
    if (u.uStrength) u.uStrength.value = strength
    if (u.uAngle) u.uAngle.value = (angle * Math.PI) / 180
    if (u.uWobble) u.uWobble.value = wobble
    if (u.uRadial) u.uRadial.value = radial ? 1 : 0
    if (u.uIntensity) {
      u.uIntensity.value = MathUtils.damp(u.uIntensity.value, active ? 1 : 0, 6, delta)
    }

    if (!dirtyRef.current) return

    const canvas = canvasRef.current
    const source = sourceRef.current
    const texture = u.uMap?.value as CanvasTexture | null
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !texture) return
    dirtyRef.current = false

    const text = source?.textContent ?? ''
    const fontFamily = source ? getComputedStyle(source).fontFamily : 'sans-serif'

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Fit against the widest known text (not the current one) so the font
    // size stays constant while phrases of different lengths cycle through.
    const fitTargets = fitTexts?.length ? fitTexts : [text]
    let fontSize = 110
    ctx.font = `600 ${fontSize}px ${fontFamily}`
    let widest = 0
    for (const candidate of fitTargets) {
      widest = Math.max(widest, ctx.measureText(candidate).width)
    }
    const maxWidth = canvas.width * 0.88
    if (widest > maxWidth) {
      fontSize = Math.floor((fontSize * maxWidth) / widest)
      ctx.font = `600 ${fontSize}px ${fontFamily}`
    }
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    texture.needsUpdate = true
  })

  // Fit the plane to the viewport while keeping the texture's aspect ratio.
  const textureAspect = TEXTURE_HEIGHT / TEXTURE_WIDTH
  const width = Math.min(viewport.width, viewport.height / textureAspect)
  const height = width * textureAspect

  return (
    <mesh scale-x={width} scale-y={height}>
      <planeGeometry />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
      />
    </mesh>
  )
}

/**
 * WebGL panel that mirrors a DOM element's live text and runs an animated
 * chromatic-aberration (RGB split) shader over it.
 */
export function ChromaSplitText({ className, ...scene }: ChromaSplitTextProps) {
  return (
    <div className={cn('relative', className)}>
      <Canvas dpr={DPR} flat linear>
        <ChromaScene {...scene} />
      </Canvas>
    </div>
  )
}

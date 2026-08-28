'use client'

import { useFBO } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import cn from 'clsx'
import { useEffect, useMemo, useRef } from 'react'
import { MathUtils, type Mesh, type ShaderMaterial } from 'three'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'
import {
  applyGlassIorUniforms,
  BACKDROP_FRAGMENT,
  BACKDROP_VERTEX,
  createBackdropUniforms,
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
  useBackdropTexture,
  useCoverFit,
  useOnScreen,
  usePointerTracking,
  useWinResolution,
} from './glass-media-internals'

/**
 * A slowly tumbling glass mesh trailing the cursor in front of an image or
 * video panel, refracting it with wavelength-dependent chromatic dispersion —
 * Maxime Heckel's technique from "Refraction, dispersion, and other shader
 * light effects": the backdrop is rendered into an FBO with the mesh hidden,
 * then the mesh samples that texture along per-wavelength `refract()` vectors
 * for six spectral bands (red, yellow, green, cyan, blue, purple), blurred by
 * a multi-sample loop and re-saturated. The mesh damps toward the pointer
 * while it is over the panel and glides back to center when it leaves.
 *
 * Renders in its own small classic-renderer canvas rather than the global one
 * (GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is unsupported)
 * and uses frameloop="demand": frames are only requested while the mesh is
 * rotating or gliding on screen or a video source produces frames — never
 * while the canvas is scrolled out of view.
 */

/** A DOM element already painting the media, reused as the texture source. */
export type DispersionSource = GlassMediaSource

export type DispersionShape = 'icosahedron' | 'torus'

export type DispersionMediaProps = {
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
   * bytes the browser already has. Must be same-origin or CORS-enabled,
   * otherwise the texture upload taints the canvas and throws.
   */
  source?: GlassMediaSource | null
  /** Fired once the first texture is on the GPU — use it to reveal the canvas. */
  onReady?: () => void
  /** Refracting mesh shape. */
  shape?: DispersionShape
  /** Uniform scale of the mesh (world units; the panel is ~5 units tall). */
  scale?: number
  /** Tumble speed in radians/second (0 freezes the mesh). */
  speed?: number
  /** Damping for the cursor follow (higher = tighter follow). */
  follow?: number
  /** Refraction offset strength per sample. */
  refraction?: number
  /** Spread between the per-wavelength refraction vectors. */
  chromaticAberration?: number
  /** ≥1; re-saturates the pastel tint the dispersion loop introduces. */
  saturation?: number
  className?: string
} & GlassIorProps

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site or via a
 * named preset (see `../presets.ts`).
 */
export const DISPERSION_MEDIA_DEFAULTS = {
  shape: 'icosahedron',
  scale: 1.4,
  speed: 0.3,
  follow: 6,
  refraction: 0.4,
  chromaticAberration: 0.6,
  saturation: 1.08,
  ...GLASS_IOR_DEFAULTS,
} as const satisfies Partial<DispersionMediaProps>

type SceneProps = Omit<DispersionMediaProps, 'className'>

function DispersionScene({
  src,
  video = false,
  source,
  onReady,
  shape = DISPERSION_MEDIA_DEFAULTS.shape,
  scale = DISPERSION_MEDIA_DEFAULTS.scale,
  speed = DISPERSION_MEDIA_DEFAULTS.speed,
  follow = DISPERSION_MEDIA_DEFAULTS.follow,
  refraction = DISPERSION_MEDIA_DEFAULTS.refraction,
  chromaticAberration = DISPERSION_MEDIA_DEFAULTS.chromaticAberration,
  saturation = DISPERSION_MEDIA_DEFAULTS.saturation,
  iorR = DISPERSION_MEDIA_DEFAULTS.iorR,
  iorY = DISPERSION_MEDIA_DEFAULTS.iorY,
  iorG = DISPERSION_MEDIA_DEFAULTS.iorG,
  iorC = DISPERSION_MEDIA_DEFAULTS.iorC,
  iorB = DISPERSION_MEDIA_DEFAULTS.iorB,
  iorP = DISPERSION_MEDIA_DEFAULTS.iorP,
}: SceneProps) {
  // Select only what's needed; `useThree()` re-renders on any R3F state change.
  const viewport = useThree((state) => state.viewport)
  const invalidate = useThree((state) => state.invalidate)

  const meshRef = useRef<Mesh>(null)
  const backdropMaterialRef = useRef<ShaderMaterial>(null)
  const dispersionMaterialRef = useRef<ShaderMaterial>(null)

  const onScreen = useOnScreen()
  const pointer = usePointerTracking(onScreen)

  // Scene snapshot with the mesh hidden, sampled by the dispersion shader.
  const backdropFBO = useFBO()

  // Initial values only — R3F may copy these objects into the materials, so
  // runtime updates go through the material refs, never these objects.
  const backdropUniforms = useMemo(createBackdropUniforms, [])
  const dispersionUniforms = useMemo(createDispersionUniforms, [])

  const sourceAspect = useBackdropTexture({
    src,
    video,
    source,
    onReady,
    materialRef: backdropMaterialRef,
    onScreen,
  })
  useCoverFit(backdropMaterialRef, sourceAspect)
  useWinResolution(dispersionMaterialRef)

  // Shader parameters sync on prop change (not in useFrame: with a demand
  // frameloop no frames run while idle, so GUI tweaks would go stale).
  useEffect(() => {
    const u = dispersionMaterialRef.current?.uniforms
    if (!u) return
    u.uRefractPower.value = refraction
    u.uChromaticAberration.value = chromaticAberration
    u.uSaturation.value = saturation
    applyGlassIorUniforms(u, { iorR, iorY, iorG, iorC, iorB, iorP })
    invalidate()
  }, [refraction, chromaticAberration, saturation, iorR, iorY, iorG, iorC, iorB, iorP, invalidate])

  useFrame((state, delta) => {
    const mesh = meshRef.current
    const material = dispersionMaterialRef.current
    if (!mesh || !material) return

    // Clamp tab-switch deltas so tumble and damping never jump.
    const dt = Math.min(delta, 1 / 30)
    mesh.rotation.x += dt * speed * 0.6
    mesh.rotation.y += dt * speed

    // Damp toward the cursor while it is over the panel; back to center when
    // it leaves. Pointer UV maps to world space at the mesh's depth.
    let targetX = 0
    let targetY = 0
    if (pointer.inside.current) {
      const plane = glassPlaneSize(state.size.width / state.size.height)
      targetX = (pointer.uv.current.x - 0.5) * plane.width
      targetY = (pointer.uv.current.y - 0.5) * plane.height
    }
    mesh.position.x = MathUtils.damp(mesh.position.x, targetX, follow, dt)
    mesh.position.y = MathUtils.damp(mesh.position.y, targetY, follow, dt)

    // Article's capture pass: hide the mesh, snapshot the backdrop into the
    // FBO, then let R3F's default pass render mesh + backdrop to the screen.
    const { gl, scene, camera } = state
    mesh.visible = false
    gl.setRenderTarget(backdropFBO)
    gl.render(scene, camera)
    mesh.visible = true
    gl.setRenderTarget(null)
    material.uniforms.uTexture.value = backdropFBO.texture

    // Keep the demand loop spinning only while there is motion to show:
    // tumbling, or the mesh still gliding toward its target.
    const gliding =
      Math.abs(mesh.position.x - targetX) > 1e-3 || Math.abs(mesh.position.y - targetY) > 1e-3
    if ((speed > 0 || gliding) && onScreen.current) invalidate()
  })

  return (
    <>
      <mesh scale-x={viewport.width} scale-y={viewport.height} raycast={() => null}>
        <planeGeometry />
        <shaderMaterial
          ref={backdropMaterialRef}
          uniforms={backdropUniforms}
          vertexShader={BACKDROP_VERTEX}
          fragmentShader={BACKDROP_FRAGMENT}
        />
      </mesh>

      <mesh
        ref={meshRef}
        position-z={GLASS_MESH_Z}
        rotation={[MathUtils.degToRad(15), MathUtils.degToRad(-30), 0]}
        scale={scale}
        raycast={() => null}
      >
        {shape === 'torus' ? (
          <torusGeometry args={[0.75, 0.35, 64, 128]} />
        ) : (
          <icosahedronGeometry args={[1, 20]} />
        )}
        <shaderMaterial
          ref={dispersionMaterialRef}
          uniforms={dispersionUniforms}
          vertexShader={DISPERSION_VERTEX}
          fragmentShader={DISPERSION_FRAGMENT}
        />
      </mesh>
    </>
  )
}

/**
 * Refraction + chromatic dispersion panel: a glass mesh tumbling after the
 * cursor over an image or video backdrop, splitting it into six spectral
 * bands. Give it a sized container via className (e.g. an aspect-ratio
 * utility); the media cover-fits behind the mesh.
 */
export function DispersionMedia({ className, ...scene }: DispersionMediaProps) {
  return (
    <div className={cn('relative', className)}>
      <Canvas
        dpr={GLASS_DPR}
        flat
        linear
        frameloop="demand"
        camera={GLASS_CAMERA}
        gl={GLASS_GL_OPTIONS}
        resize={CANVAS_RESIZE}
      >
        <DispersionScene {...scene} />
      </Canvas>
    </div>
  )
}

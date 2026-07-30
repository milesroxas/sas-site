'use client'

import { useFBO } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import cn from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LinearFilter,
  MathUtils,
  type Mesh,
  type ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  VideoTexture,
} from 'three'

/**
 * A slowly tumbling glass mesh floating in front of an image or video panel,
 * refracting it with wavelength-dependent chromatic dispersion — Maxime
 * Heckel's technique from "Refraction, dispersion, and other shader light
 * effects": the backdrop is rendered into an FBO with the mesh hidden, then
 * the mesh samples that texture along per-wavelength `refract()` vectors for
 * six spectral bands (red, yellow, green, cyan, blue, purple), blurred by a
 * multi-sample loop and re-saturated.
 *
 * Renders in its own small classic-renderer canvas rather than the global one
 * (GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is unsupported)
 * and uses frameloop="demand": frames are only requested while the mesh is
 * rotating on screen or a video source produces frames — never while the
 * canvas is scrolled out of view.
 */

const DPR: [number, number] = [1, 2]
// 3D mesh over a textured quad: depth for the mesh, MSAA for its silhouette.
const GL_OPTIONS = { antialias: true, stencil: false }
const CAMERA = { position: [0, 0, 7] as [number, number, number], fov: 45 }
const MESH_Z = 1.5

/** Plain cover-fit blit for the backdrop media plane. */
const BACKDROP_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const BACKDROP_FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
uniform vec2 uCover;
varying vec2 vUv;

void main() {
  // CSS object-fit: cover, in UV space.
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  gl_FragColor = vec4(texture2D(uMap, uv).rgb, 1.0);
}
`

/** Article's vertex shader: world normal + eye vector for refract(). */
const DISPERSION_VERTEX = /* glsl */ `
varying vec3 worldNormal;
varying vec3 eyeVector;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;

  vec3 transformedNormal = normalMatrix * normal;
  worldNormal = normalize(transformedNormal);

  eyeVector = normalize(worldPos.xyz - cameraPosition);
}
`

/**
 * Article's final dispersion fragment shader: six IORs (RYGCBV via Fourier
 * interpolation between RGB channels), multi-sample blur loop, saturation.
 */
const DISPERSION_FRAGMENT = /* glsl */ `
uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;

uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform vec2 winResolution;
uniform sampler2D uTexture;

varying vec3 worldNormal;
varying vec3 eyeVector;

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

const int LOOP = 16;

void main() {
  vec2 uv = gl_FragCoord.xy / winResolution.xy;
  vec3 normal = worldNormal;
  vec3 color = vec3(0.0);

  for (int i = 0; i < LOOP; i++) {
    float slide = float(i) / float(LOOP) * 0.1;

    vec3 refractVecR = refract(eyeVector, normal, (1.0 / uIorR));
    vec3 refractVecY = refract(eyeVector, normal, (1.0 / uIorY));
    vec3 refractVecG = refract(eyeVector, normal, (1.0 / uIorG));
    vec3 refractVecC = refract(eyeVector, normal, (1.0 / uIorC));
    vec3 refractVecB = refract(eyeVector, normal, (1.0 / uIorB));
    vec3 refractVecP = refract(eyeVector, normal, (1.0 / uIorP));

    float r = texture2D(uTexture, uv + refractVecR.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 0.5;

    float y = (texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 +
               texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y * 2.0 -
               texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z) / 6.0;

    float g = texture2D(uTexture, uv + refractVecG.xy * (uRefractPower + slide * 2.0) * uChromaticAberration).y * 0.5;

    float c = (texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).y * 2.0 +
               texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).z * 2.0 -
               texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * uChromaticAberration).x) / 6.0;

    float b = texture2D(uTexture, uv + refractVecB.xy * (uRefractPower + slide * 3.0) * uChromaticAberration).z * 0.5;

    float p = (texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).z * 2.0 +
               texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).x * 2.0 -
               texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).y) / 6.0;

    float R = r + (2.0 * p + 2.0 * y - c) / 3.0;
    float G = g + (2.0 * y + 2.0 * c - p) / 3.0;
    float B = b + (2.0 * c + 2.0 * p - y) / 3.0;

    color.r += R;
    color.g += G;
    color.b += B;

    color = sat(color, uSaturation);
  }

  // Divide by the number of layers to normalize colors (rgb values can be worth up to the value of LOOP).
  color /= float(LOOP);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

/** A DOM element already painting the media, reused as the texture source. */
export type DispersionSource = HTMLImageElement | HTMLVideoElement

const isVideoElement = (node: DispersionSource): node is HTMLVideoElement =>
  node.tagName === 'VIDEO'

const VIDEO_URL_PATTERN = /\.(mp4|webm|mov|m3u8|ogv)($|[?#])/i

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
  source?: DispersionSource | null
  /** Fired once the first texture is on the GPU — use it to reveal the canvas. */
  onReady?: () => void
  /** Refracting mesh shape. */
  shape?: DispersionShape
  /** Uniform scale of the mesh (world units; the panel is ~5 units tall). */
  scale?: number
  /** Tumble speed in radians/second (0 freezes the mesh). */
  speed?: number
  /** Refraction offset strength per sample. */
  refraction?: number
  /** Spread between the per-wavelength refraction vectors. */
  chromaticAberration?: number
  /** ≥1; re-saturates the pastel tint the dispersion loop introduces. */
  saturation?: number
  /** Index of refraction per spectral band. */
  iorR?: number
  iorY?: number
  iorG?: number
  iorC?: number
  iorB?: number
  iorP?: number
  className?: string
}

type SceneProps = Omit<DispersionMediaProps, 'className'>

function DispersionScene({
  src,
  video = false,
  source,
  onReady,
  shape = 'icosahedron',
  scale = 1.4,
  speed = 0.3,
  refraction = 0.4,
  chromaticAberration = 0.6,
  saturation = 1.08,
  iorR = 1.15,
  iorY = 1.16,
  iorG = 1.18,
  iorC = 1.22,
  iorB = 1.22,
  iorP = 1.22,
}: SceneProps) {
  // Select only what's needed; `useThree()` re-renders on any R3F state change.
  const viewport = useThree((state) => state.viewport)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const canvas = useThree((state) => state.gl.domElement)

  const meshRef = useRef<Mesh>(null)
  const backdropMaterialRef = useRef<ShaderMaterial>(null)
  const dispersionMaterialRef = useRef<ShaderMaterial>(null)
  const [sourceAspect, setSourceAspect] = useState(16 / 9)
  // The element actually decoding video frames (owned player or `source`),
  // so the demand loop can follow the decoder clock.
  const [activeVideo, setActiveVideo] = useState<HTMLVideoElement | null>(null)
  const onScreen = useRef(true)

  // Scene snapshot with the mesh hidden, sampled by the dispersion shader.
  const backdropFBO = useFBO()

  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onReadyRef.current = onReady
  })

  // Initial values only — R3F may copy these objects into the materials, so
  // runtime updates go through the material refs, never these objects.
  const backdropUniforms = useMemo(
    () => ({
      uMap: { value: null as Texture | null },
      uCover: { value: new Vector2(1, 1) },
    }),
    [],
  )

  const dispersionUniforms = useMemo(
    () => ({
      uTexture: { value: null as Texture | null },
      winResolution: { value: new Vector2() },
      uRefractPower: { value: 0.4 },
      uChromaticAberration: { value: 0.6 },
      uSaturation: { value: 1.08 },
      uIorR: { value: 1.15 },
      uIorY: { value: 1.16 },
      uIorG: { value: 1.18 },
      uIorC: { value: 1.22 },
      uIorB: { value: 1.22 },
      uIorP: { value: 1.22 },
    }),
    [],
  )

  // Bind the backdrop texture. A `source` element is sampled in place (no
  // second download); a `src` video URL gets an internally-owned muted looping
  // player; a `src` image URL is fetched. Either way the previous texture
  // stays visible until the new one is ready, then gets disposed — textures
  // inside uniforms are not auto-disposed.
  useEffect(() => {
    const material = backdropMaterialRef.current
    if (!material) return
    let cancelled = false
    let ownedVideo: HTMLVideoElement | null = null

    const apply = (texture: Texture, width: number, height: number) => {
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
      if (width > 0 && height > 0) setSourceAspect(width / height)
      invalidate()
      onReadyRef.current?.()
    }

    const bindVideo = (videoEl: HTMLVideoElement) => {
      const bind = () => {
        apply(new VideoTexture(videoEl), videoEl.videoWidth, videoEl.videoHeight)
        setActiveVideo(videoEl)
      }
      if (videoEl.readyState >= videoEl.HAVE_CURRENT_DATA) bind()
      else videoEl.addEventListener('loadeddata', bind, { once: true })
      return () => videoEl.removeEventListener('loadeddata', bind)
    }

    if (source) {
      if (isVideoElement(source)) {
        const unbind = bindVideo(source)
        return () => {
          cancelled = true
          setActiveVideo(null)
          unbind()
        }
      }

      const image = source
      // Fires again whenever a responsive srcset swaps in a different file, so
      // the existing texture is re-uploaded rather than left on the old bitmap.
      const bind = () => {
        if (cancelled) return
        const existing = material.uniforms.uMap?.value as Texture | null
        if (existing?.image === image) {
          existing.needsUpdate = true
          invalidate()
          return
        }
        const texture = new Texture(image)
        texture.needsUpdate = true
        apply(texture, image.naturalWidth, image.naturalHeight)
      }
      if (image.complete && image.naturalWidth > 0) bind()
      image.addEventListener('load', bind)
      return () => {
        cancelled = true
        setActiveVideo(null)
        image.removeEventListener('load', bind)
      }
    }

    if (!src) return

    if (video || VIDEO_URL_PATTERN.test(src)) {
      const videoEl = document.createElement('video')
      ownedVideo = videoEl
      videoEl.crossOrigin = 'anonymous'
      videoEl.muted = true
      videoEl.loop = true
      videoEl.playsInline = true
      videoEl.src = src
      const unbind = bindVideo(videoEl)
      videoEl.play().catch(() => {
        // Autoplay rejection leaves the first decoded frame as a still.
      })
      return () => {
        cancelled = true
        setActiveVideo(null)
        unbind()
        ownedVideo?.pause()
        ownedVideo?.removeAttribute('src')
        ownedVideo?.load()
      }
    }

    new TextureLoader().load(src, (texture) => {
      const image = texture.image as { width: number; height: number }
      apply(texture, image.width, image.height)
    })
    return () => {
      cancelled = true
      setActiveVideo(null)
    }
  }, [src, video, source, invalidate])

  useEffect(() => {
    const material = backdropMaterialRef.current
    return () => {
      ;(material?.uniforms.uMap?.value as Texture | null)?.dispose()
    }
  }, [])

  // A video source only produces work when it produces a frame, so drive the
  // demand loop off the decoder rather than the display refresh rate.
  useEffect(() => {
    if (!activeVideo) return
    const videoEl = activeVideo

    // Typed as always present, but still absent on older Safari and Firefox.
    if (typeof videoEl.requestVideoFrameCallback === 'function') {
      let handle = videoEl.requestVideoFrameCallback(function onVideoFrame() {
        if (onScreen.current) invalidate()
        handle = videoEl.requestVideoFrameCallback(onVideoFrame)
      })
      return () => videoEl.cancelVideoFrameCallback(handle)
    }

    // Otherwise fall back to the display clock.
    let frame = requestAnimationFrame(function onAnimationFrame() {
      if (onScreen.current && !videoEl.paused) invalidate()
      frame = requestAnimationFrame(onAnimationFrame)
    })
    return () => cancelAnimationFrame(frame)
  }, [activeVideo, invalidate])

  // Scrolled out of view: stop asking for frames entirely.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      onScreen.current = entry?.isIntersecting ?? true
      if (onScreen.current) invalidate()
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [canvas, invalidate])

  // Cover-fit whenever the panel or source aspect changes.
  useEffect(() => {
    const u = backdropMaterialRef.current?.uniforms
    if (!u) return
    const planeAspect = viewport.aspect
    if (planeAspect > sourceAspect) {
      u.uCover.value.set(1, sourceAspect / planeAspect)
    } else {
      u.uCover.value.set(planeAspect / sourceAspect, 1)
    }
    invalidate()
  }, [viewport.aspect, sourceAspect, invalidate])

  // gl_FragCoord is in device pixels; so is the (auto-resizing) FBO.
  useEffect(() => {
    const u = dispersionMaterialRef.current?.uniforms
    if (!u) return
    u.winResolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr)
    invalidate()
  }, [size.width, size.height, viewport.dpr, invalidate])

  // Shader parameters sync on prop change (not in useFrame: with a demand
  // frameloop no frames run while idle, so GUI tweaks would go stale).
  useEffect(() => {
    const u = dispersionMaterialRef.current?.uniforms
    if (!u) return
    u.uRefractPower.value = refraction
    u.uChromaticAberration.value = chromaticAberration
    u.uSaturation.value = saturation
    u.uIorR.value = iorR
    u.uIorY.value = iorY
    u.uIorG.value = iorG
    u.uIorC.value = iorC
    u.uIorB.value = iorB
    u.uIorP.value = iorP
    invalidate()
  }, [refraction, chromaticAberration, saturation, iorR, iorY, iorG, iorC, iorB, iorP, invalidate])

  useFrame((state, delta) => {
    const mesh = meshRef.current
    const material = dispersionMaterialRef.current
    if (!mesh || !material) return

    // Clamp tab-switch deltas so the tumble never jumps.
    const dt = Math.min(delta, 1 / 30)
    mesh.rotation.x += dt * speed * 0.6
    mesh.rotation.y += dt * speed

    // Article's capture pass: hide the mesh, snapshot the backdrop into the
    // FBO, then let R3F's default pass render mesh + backdrop to the screen.
    const { gl, scene, camera } = state
    mesh.visible = false
    gl.setRenderTarget(backdropFBO)
    gl.render(scene, camera)
    mesh.visible = true
    gl.setRenderTarget(null)
    material.uniforms.uTexture.value = backdropFBO.texture

    // Keep the demand loop spinning only while there is motion to show.
    if (speed > 0 && onScreen.current) invalidate()
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
        position-z={MESH_Z}
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
 * Refraction + chromatic dispersion panel: a glass mesh tumbling over an
 * image or video backdrop, splitting it into six spectral bands. Give it a
 * sized container via className (e.g. an aspect-ratio utility); the media
 * cover-fits behind the mesh.
 */
export function DispersionMedia({ className, ...scene }: DispersionMediaProps) {
  return (
    <div className={cn('relative', className)}>
      <Canvas dpr={DPR} flat linear frameloop="demand" camera={CAMERA} gl={GL_OPTIONS}>
        <DispersionScene {...scene} />
      </Canvas>
    </div>
  )
}

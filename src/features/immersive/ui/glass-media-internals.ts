'use client'

import { useThree } from '@react-three/fiber'
import { type RefObject, useEffect, useRef, useState } from 'react'
import {
  LinearFilter,
  type ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  VideoTexture,
} from 'three'

/**
 * Shared internals for the glass media surfaces (DispersionMedia and
 * RefractionMedia). Both render the same scene shape — a cover-fit backdrop
 * plane snapshotted into an FBO, sampled by a glass mesh through Maxime
 * Heckel's six-band dispersion shader — and share all the plumbing around it:
 * texture binding, video-driven demand invalidation, visibility gating,
 * cover-fit, and cursor tracking.
 */

/** Camera shared by both glass canvases; the mesh floats at GLASS_MESH_Z. */
export const GLASS_CAMERA = { position: [0, 0, 7] as [number, number, number], fov: 45 }
export const GLASS_MESH_Z = 1.5
export const GLASS_DPR: [number, number] = [1, 2]
// 3D mesh over a textured quad: depth for the mesh, MSAA for its silhouette.
export const GLASS_GL_OPTIONS = { antialias: true, stencil: false }

/** World-space viewport dimensions at the glass mesh's depth. */
export const glassPlaneSize = (aspect: number): { width: number; height: number } => {
  const distance = GLASS_CAMERA.position[2] - GLASS_MESH_Z
  const height = 2 * distance * Math.tan((GLASS_CAMERA.fov / 2) * (Math.PI / 180))
  return { width: height * aspect, height }
}

/** Plain cover-fit blit for the backdrop media plane. */
export const BACKDROP_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const BACKDROP_FRAGMENT = /* glsl */ `
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
export const DISPERSION_VERTEX = /* glsl */ `
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
 *
 * uHover scales every refraction offset and lerps saturation back to identity,
 * so at 0 each fragment samples its own screen UV — the mesh reproduces the
 * backdrop exactly and disappears without a fade-to-black or opacity pass.
 */
export const DISPERSION_FRAGMENT = /* glsl */ `
uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;

uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uHover;
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
  float aberration = uChromaticAberration * uHover;
  float saturation = mix(1.0, uSaturation, uHover);

  for (int i = 0; i < LOOP; i++) {
    float slide = float(i) / float(LOOP) * 0.1;

    vec3 refractVecR = refract(eyeVector, normal, (1.0 / uIorR));
    vec3 refractVecY = refract(eyeVector, normal, (1.0 / uIorY));
    vec3 refractVecG = refract(eyeVector, normal, (1.0 / uIorG));
    vec3 refractVecC = refract(eyeVector, normal, (1.0 / uIorC));
    vec3 refractVecB = refract(eyeVector, normal, (1.0 / uIorB));
    vec3 refractVecP = refract(eyeVector, normal, (1.0 / uIorP));

    float r = texture2D(uTexture, uv + refractVecR.xy * (uRefractPower + slide * 1.0) * aberration).x * 0.5;

    float y = (texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * aberration).x * 2.0 +
               texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * aberration).y * 2.0 -
               texture2D(uTexture, uv + refractVecY.xy * (uRefractPower + slide * 1.0) * aberration).z) / 6.0;

    float g = texture2D(uTexture, uv + refractVecG.xy * (uRefractPower + slide * 2.0) * aberration).y * 0.5;

    float c = (texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * aberration).y * 2.0 +
               texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * aberration).z * 2.0 -
               texture2D(uTexture, uv + refractVecC.xy * (uRefractPower + slide * 2.5) * aberration).x) / 6.0;

    float b = texture2D(uTexture, uv + refractVecB.xy * (uRefractPower + slide * 3.0) * aberration).z * 0.5;

    float p = (texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * aberration).z * 2.0 +
               texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * aberration).x * 2.0 -
               texture2D(uTexture, uv + refractVecP.xy * (uRefractPower + slide * 1.0) * aberration).y) / 6.0;

    float R = r + (2.0 * p + 2.0 * y - c) / 3.0;
    float G = g + (2.0 * y + 2.0 * c - p) / 3.0;
    float B = b + (2.0 * c + 2.0 * p - y) / 3.0;

    color.r += R;
    color.g += G;
    color.b += B;

    color = sat(color, saturation);
  }

  // Divide by the number of layers to normalize colors (rgb values can be worth up to the value of LOOP).
  color /= float(LOOP);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

/**
 * Initial dispersion uniform values. Called once per material — R3F may copy
 * the object into the material, so runtime updates go through the material
 * ref, never the returned object.
 */
export const createDispersionUniforms = () => ({
  uTexture: { value: null as Texture | null },
  winResolution: { value: new Vector2() },
  uRefractPower: { value: 0.4 },
  uChromaticAberration: { value: 0.6 },
  uSaturation: { value: 1.08 },
  uHover: { value: 1 },
  uIorR: { value: 1.15 },
  uIorY: { value: 1.16 },
  uIorG: { value: 1.18 },
  uIorC: { value: 1.22 },
  uIorB: { value: 1.22 },
  uIorP: { value: 1.22 },
})

export const createBackdropUniforms = () => ({
  uMap: { value: null as Texture | null },
  uCover: { value: new Vector2(1, 1) },
})

/** A DOM element already painting the media, reused as the texture source. */
export type GlassMediaSource = HTMLImageElement | HTMLVideoElement

const isVideoElement = (node: GlassMediaSource): node is HTMLVideoElement =>
  node.tagName === 'VIDEO'

const VIDEO_URL_PATTERN = /\.(mp4|webm|mov|m3u8|ogv)($|[?#])/i

export type BackdropTextureOptions = {
  src?: string
  /** Treat `src` as a video even when its URL has no video extension. */
  video?: boolean
  source?: GlassMediaSource | null
  onReady?: () => void
  materialRef: RefObject<ShaderMaterial | null>
  onScreen: RefObject<boolean>
}

/**
 * Binds media to the backdrop material's uMap. A `source` element is sampled
 * in place (no second download); a `src` video URL gets an internally-owned
 * muted looping player; a `src` image URL is fetched. The previous texture
 * stays visible until the new one is ready, then gets disposed — textures
 * inside uniforms are not auto-disposed. Video sources drive the demand loop
 * off the decoder clock. Returns the source's aspect ratio for cover-fit.
 */
export function useBackdropTexture({
  src,
  video = false,
  source,
  onReady,
  materialRef,
  onScreen,
}: BackdropTextureOptions): number {
  const invalidate = useThree((state) => state.invalidate)
  const [sourceAspect, setSourceAspect] = useState(16 / 9)
  // The element actually decoding video frames (owned player or `source`),
  // so the demand loop can follow the decoder clock.
  const [activeVideo, setActiveVideo] = useState<HTMLVideoElement | null>(null)

  // Read through a ref so a caller re-creating the callback never re-runs the
  // texture effect (which would rebuild the texture on every parent render).
  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onReadyRef.current = onReady
  })

  useEffect(() => {
    let cancelled = false
    let ownedVideo: HTMLVideoElement | null = null
    let detachSource: (() => void) | undefined
    let raf = 0

    const disposeMap = (material: ShaderMaterial) => {
      const current = material.uniforms.uMap?.value as Texture | null
      if (!current) return
      // Null first so a Strict Mode remount cannot revive a disposed texture
      // via the `existing?.image === image` short-circuit.
      material.uniforms.uMap.value = null
      current.dispose()
    }

    const apply = (material: ShaderMaterial, texture: Texture, width: number, height: number) => {
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
      // Demand frameloop: paint the textured frame while the canvas is still
      // opacity-0, then announce ready so the consumer can fade it in. Calling
      // onReady synchronously here reveals a clear/unpainted buffer — a flash.
      invalidate()
      requestAnimationFrame(() => {
        if (cancelled) return
        invalidate()
        requestAnimationFrame(() => {
          if (!cancelled) onReadyRef.current?.()
        })
      })
    }

    const bindVideo = (material: ShaderMaterial, videoEl: HTMLVideoElement) => {
      const bind = () => {
        apply(material, new VideoTexture(videoEl), videoEl.videoWidth, videoEl.videoHeight)
        setActiveVideo(videoEl)
      }
      if (videoEl.readyState >= videoEl.HAVE_CURRENT_DATA) bind()
      else videoEl.addEventListener('loadeddata', bind, { once: true })
      return () => videoEl.removeEventListener('loadeddata', bind)
    }

    const attach = (material: ShaderMaterial) => {
      if (source) {
        if (isVideoElement(source)) {
          detachSource = bindVideo(material, source)
          return
        }

        const image = source
        // Fires again whenever a responsive srcset swaps in a different file, so
        // the existing texture is re-uploaded rather than left on the old bitmap.
        const bind = () => {
          if (cancelled) return
          const existing = material.uniforms.uMap?.value as Texture | null
          // Only reuse when the uniform still holds a live texture for this
          // element. A disposed texture (Strict Mode cleanup) must be replaced.
          if (existing?.image === image && existing.source !== null) {
            existing.needsUpdate = true
            invalidate()
            requestAnimationFrame(() => {
              if (!cancelled) onReadyRef.current?.()
            })
            return
          }
          const texture = new Texture(image)
          texture.needsUpdate = true
          apply(material, texture, image.naturalWidth, image.naturalHeight)
        }
        if (image.complete && image.naturalWidth > 0) bind()
        image.addEventListener('load', bind)
        detachSource = () => image.removeEventListener('load', bind)
        return
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
        detachSource = bindVideo(material, videoEl)
        videoEl.play().catch(() => {
          // Autoplay rejection leaves the first decoded frame as a still.
        })
        return
      }

      const loader = new TextureLoader()
      loader.setCrossOrigin('anonymous')
      loader.load(src, (texture) => {
        const image = texture.image as { width: number; height: number }
        apply(material, texture, image.width, image.height)
      })
    }

    // shaderMaterial refs attach after the first commit; wait one frame if needed
    // rather than bailing forever on a null ref.
    const start = () => {
      const material = materialRef.current
      if (!material) {
        raf = requestAnimationFrame(start)
        return
      }
      attach(material)
    }
    start()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      setActiveVideo(null)
      detachSource?.()
      ownedVideo?.pause()
      ownedVideo?.removeAttribute('src')
      ownedVideo?.load()
      const material = materialRef.current
      if (material) disposeMap(material)
    }
  }, [src, video, source, invalidate, materialRef])

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
  }, [activeVideo, invalidate, onScreen])

  return sourceAspect
}

/** Scrolled out of view: stop asking for frames entirely. */
export function useOnScreen(): RefObject<boolean> {
  const invalidate = useThree((state) => state.invalidate)
  const canvas = useThree((state) => state.gl.domElement)
  const onScreen = useRef(true)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      onScreen.current = entry?.isIntersecting ?? true
      if (onScreen.current) invalidate()
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [canvas, invalidate])

  return onScreen
}

/** Cover-fit the backdrop whenever the panel or source aspect changes. */
export function useCoverFit(
  materialRef: RefObject<ShaderMaterial | null>,
  sourceAspect: number,
): void {
  const viewport = useThree((state) => state.viewport)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    const planeAspect = viewport.aspect
    if (planeAspect > sourceAspect) {
      u.uCover.value.set(1, sourceAspect / planeAspect)
    } else {
      u.uCover.value.set(planeAspect / sourceAspect, 1)
    }
    // Materials that warp in UV space also need the panel aspect to stay circular.
    if (u.uAspect) u.uAspect.value = planeAspect
    invalidate()
  }, [viewport.aspect, sourceAspect, invalidate, materialRef])
}

/** gl_FragCoord is in device pixels; so is the (auto-resizing) FBO. */
export function useWinResolution(materialRef: RefObject<ShaderMaterial | null>): void {
  const size = useThree((state) => state.size)
  const viewport = useThree((state) => state.viewport)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    u.winResolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr)
    invalidate()
  }, [size.width, size.height, viewport.dpr, invalidate, materialRef])
}

export type PointerTracking = {
  /** Last pointer position over the canvas, in UV space (bottom-left origin). */
  uv: RefObject<Vector2>
  /** Whether the pointer is currently over the canvas. */
  inside: RefObject<boolean>
}

/**
 * Pointer is tracked against the canvas rect rather than by raycasting a
 * mesh, so the glass still follows the cursor when the canvas sits behind
 * other content or is pointer-events-none (as a page background is). State
 * lives in refs and feeds uniforms via useFrame — never React state
 * (perf-never-set-state-in-useframe).
 */
export function usePointerTracking(onScreen: RefObject<boolean>): PointerTracking {
  const invalidate = useThree((state) => state.invalidate)
  const canvas = useThree((state) => state.gl.domElement)
  const uv = useRef(new Vector2(0.5, 0.5))
  const inside = useRef(false)

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!onScreen.current) {
        if (inside.current) {
          inside.current = false
          invalidate()
        }
        return
      }
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const x = (event.clientX - rect.left) / rect.width
      // UV origin is bottom-left; client coordinates run top-down.
      const y = 1 - (event.clientY - rect.top) / rect.height
      const within = x >= 0 && x <= 1 && y >= 0 && y <= 1
      // Clamped even when outside: proximity-activated scenes (see
      // `subscribeProximity`) run their effects while the pointer approaches,
      // and the lens should ride the panel edge nearest the cursor rather
      // than freeze at the last inside position. Hover-only scenes are
      // unaffected — their effects are invisible while `inside` is false.
      uv.current.set(Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1))
      // A dropdown sitting in the canvas bleed (or just above the panel) must
      // not count as hovering the media — keep in sync with the cursor
      // provider's `[data-slot^="dropdown-menu"]` occluder.
      const onDropdown =
        typeof document.elementFromPoint === 'function' &&
        Boolean(
          document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest('[data-slot^="dropdown-menu"]'),
        )
      const nextInside = within && !onDropdown
      const wasInside = inside.current
      inside.current = nextInside
      // Demand frameloop: idle pointer motion across the page must not
      // request frames. Approaching scenes invalidate from their proximity
      // subscription; hover-only scenes only need a frame on enter/leave
      // or while the pointer is actually over the canvas.
      if (nextInside || wasInside) invalidate()
    }

    const handleLeave = () => {
      inside.current = false
      invalidate()
    }

    window.addEventListener('pointermove', handleMove, { passive: true })
    document.addEventListener('pointerleave', handleLeave)
    window.addEventListener('blur', handleLeave)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerleave', handleLeave)
      window.removeEventListener('blur', handleLeave)
    }
  }, [canvas, invalidate, onScreen])

  return { uv, inside }
}

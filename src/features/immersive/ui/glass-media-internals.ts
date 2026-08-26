'use client'

import { useThree } from '@react-three/fiber'
import { type RefObject, useEffect, useRef, useState } from 'react'
import { type ShaderMaterial, Texture, TextureLoader, Vector2, VideoTexture } from 'three'
import { swapMapTexture } from '@/lib/webgl/utils/swap-map-texture'

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
// `alpha` so overscan around the media composites over the page instead of a
// solid clear-color rectangle that would clip the glass at the canvas edge.
export const GLASS_GL_OPTIONS = { antialias: true, alpha: true, stencil: false }

/** World-space viewport dimensions at the glass mesh's depth. */
export const glassPlaneSize = (aspect: number): { width: number; height: number } => {
  const distance = GLASS_CAMERA.position[2] - GLASS_MESH_Z
  const height = 2 * distance * Math.tan((GLASS_CAMERA.fov / 2) * (Math.PI / 180))
  return { width: height * aspect, height }
}

/** Canvas-UV margin of the media rect when the canvas hangs past it by `bleed`. */
export const bleedToInset = (bleed: number): number => (bleed > 0 ? bleed / (1 + 2 * bleed) : 0)

/**
 * On-screen radius of the glass mesh, as a fraction of the media's height —
 * `lensSpread` plus a little for the closer hemisphere's silhouette growing
 * under perspective. Both the framebuffer's overscan and the mesh's own
 * containment fade measure against it, so the margin is defined once.
 */
export const glassSilhouetteRadius = (lensSpread: number): number => lensSpread * 1.1

/**
 * Extra canvas around the media, as a fraction of the container. Melt needs
 * `bleed`; a glass mesh parked on the silhouette needs room equal to its
 * on-screen radius. The media stays the container's rect — this only grows the
 * framebuffer so the sphere isn't clipped by it.
 */
export const canvasOverscan = (bleed: number, lensVisibility: number, lensSpread: number): number =>
  Math.max(bleed, lensVisibility > 0 ? glassSilhouetteRadius(lensSpread) : 0)

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
 *
 * uEdgeFade extends that retirement to the media's silhouette: within a margin
 * that wide (canvas-height units, measured inward from the media rect uInset
 * describes) the mesh both flattens toward the backdrop and fades its own
 * alpha out, so a lens riding the edge dissolves instead of painting an opaque
 * disc of clamped edge samples out over the transparent bleed. 0 disables it —
 * the legacy full-bleed surfaces, where the media *is* the canvas.
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
uniform float uInset;
uniform float uEdgeFade;
uniform vec2 winResolution;
uniform sampler2D uTexture;

varying vec3 worldNormal;
varying vec3 eyeVector;

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

/**
 * Sample the backdrop FBO without falling into the clear-color black of
 * transparent bleed (or refraction offsets that walk off the media). Prefer
 * the live UV so melt overflow into the margin still refracts; only when that
 * texel is empty do we snap to the media rect and, if melt carved that edge
 * too, step toward the panel center.
 *
 * Coverage is blended into the FBO, so RGB arrives premultiplied — restore it
 * or the melt feather would read as a dark rim inside the lens.
 */
vec4 sampleScene(vec2 sampleUv) {
  vec4 s = texture2D(uTexture, sampleUv);
  if (s.a < 0.01) {
    float pad = uInset + 0.02;
    vec2 clamped = clamp(sampleUv, vec2(pad), vec2(1.0 - pad));
    s = texture2D(uTexture, clamped);
    if (s.a < 0.01) s = texture2D(uTexture, mix(clamped, vec2(0.5), 0.25));
  }
  if (s.a > 0.001 && s.a < 0.999) s.rgb /= s.a;
  return s;
}

const int LOOP = 16;

void main() {
  vec2 uv = gl_FragCoord.xy / winResolution.xy;

  // Coverage of the media rect, softened over uEdgeFade. x is scaled by the
  // canvas aspect so the margin is the same physical width on both axes (the
  // media rect is inset by the same fraction per axis, so it shares the
  // canvas's aspect).
  float edge = 1.0;
  if (uEdgeFade > 0.0) {
    vec2 d = min(uv - vec2(uInset), vec2(1.0 - uInset) - uv);
    float sd = min(d.x * (winResolution.x / winResolution.y), d.y);
    edge = smoothstep(0.0, uEdgeFade, sd);
    if (edge <= 0.0) discard;
  }

  vec3 normal = worldNormal;
  vec3 color = vec3(0.0);
  float hover = uHover * edge;
  float aberration = uChromaticAberration * hover;
  float saturation = mix(1.0, uSaturation, hover);

  for (int i = 0; i < LOOP; i++) {
    float slide = float(i) / float(LOOP) * 0.1;

    vec3 refractVecR = refract(eyeVector, normal, (1.0 / uIorR));
    vec3 refractVecY = refract(eyeVector, normal, (1.0 / uIorY));
    vec3 refractVecG = refract(eyeVector, normal, (1.0 / uIorG));
    vec3 refractVecC = refract(eyeVector, normal, (1.0 / uIorC));
    vec3 refractVecB = refract(eyeVector, normal, (1.0 / uIorB));
    vec3 refractVecP = refract(eyeVector, normal, (1.0 / uIorP));

    float r = sampleScene(uv + refractVecR.xy * (uRefractPower + slide * 1.0) * aberration).x * 0.5;

    float y = (sampleScene(uv + refractVecY.xy * (uRefractPower + slide * 1.0) * aberration).x * 2.0 +
               sampleScene(uv + refractVecY.xy * (uRefractPower + slide * 1.0) * aberration).y * 2.0 -
               sampleScene(uv + refractVecY.xy * (uRefractPower + slide * 1.0) * aberration).z) / 6.0;

    float g = sampleScene(uv + refractVecG.xy * (uRefractPower + slide * 2.0) * aberration).y * 0.5;

    float c = (sampleScene(uv + refractVecC.xy * (uRefractPower + slide * 2.5) * aberration).y * 2.0 +
               sampleScene(uv + refractVecC.xy * (uRefractPower + slide * 2.5) * aberration).z * 2.0 -
               sampleScene(uv + refractVecC.xy * (uRefractPower + slide * 2.5) * aberration).x) / 6.0;

    float b = sampleScene(uv + refractVecB.xy * (uRefractPower + slide * 3.0) * aberration).z * 0.5;

    float p = (sampleScene(uv + refractVecP.xy * (uRefractPower + slide * 1.0) * aberration).z * 2.0 +
               sampleScene(uv + refractVecP.xy * (uRefractPower + slide * 1.0) * aberration).x * 2.0 -
               sampleScene(uv + refractVecP.xy * (uRefractPower + slide * 1.0) * aberration).y) / 6.0;

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

  gl_FragColor = vec4(color, edge);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

/** The six per-band refraction indices every glass surface exposes. */
export type GlassIorProps = {
  iorR?: number
  iorY?: number
  iorG?: number
  iorC?: number
  iorB?: number
  iorP?: number
}

/**
 * The dispersion spread, owned once. Both glass surfaces refract the same six
 * spectral bands, so the shader's initial uniforms and each component's
 * `*_DEFAULTS` read these values rather than restating them.
 */
export const GLASS_IOR_DEFAULTS = {
  iorR: 1.15,
  iorY: 1.16,
  iorG: 1.18,
  iorC: 1.22,
  iorB: 1.22,
  iorP: 1.22,
} as const satisfies Required<GlassIorProps>

/** Pushes the six band indices into a live dispersion material. */
export function applyGlassIorUniforms(
  uniforms: ShaderMaterial['uniforms'],
  ior: Required<GlassIorProps>,
) {
  uniforms.uIorR.value = ior.iorR
  uniforms.uIorY.value = ior.iorY
  uniforms.uIorG.value = ior.iorG
  uniforms.uIorC.value = ior.iorC
  uniforms.uIorB.value = ior.iorB
  uniforms.uIorP.value = ior.iorP
}

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
  uInset: { value: 0 },
  uEdgeFade: { value: 0 },
  uIorR: { value: GLASS_IOR_DEFAULTS.iorR },
  uIorY: { value: GLASS_IOR_DEFAULTS.iorY },
  uIorG: { value: GLASS_IOR_DEFAULTS.iorG },
  uIorC: { value: GLASS_IOR_DEFAULTS.iorC },
  uIorB: { value: GLASS_IOR_DEFAULTS.iorB },
  uIorP: { value: GLASS_IOR_DEFAULTS.iorP },
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

    const apply = (material: ShaderMaterial, texture: Texture, width: number, height: number) => {
      if (!swapMapTexture(material, texture, { cancelled })) return
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
      // Leave uMap in place on src change so the last frame holds until
      // apply() swaps in the new texture. Disposing here paints an unbound
      // sampler (opaque black) if the canvas is still visible.
    }
  }, [src, video, source, invalidate, materialRef])

  // Unmount only — src-change cleanup above must not dispose the live map.
  useEffect(() => {
    return () => {
      const material = materialRef.current
      if (!material) return
      const current = material.uniforms.uMap?.value as Texture | null
      if (!current) return
      // Null first so a Strict Mode remount cannot revive a disposed texture
      // via the `existing?.image === image` short-circuit.
      material.uniforms.uMap.value = null
      current.dispose()
    }
  }, [materialRef])

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

/**
 * gl_FragCoord is in device pixels; so is the (auto-resizing) FBO. Pass
 * `mounted` for a material whose mesh renders conditionally: its ref is null
 * until the mesh appears, and nothing about the canvas size changes at that
 * moment, so without it the resolution would stay at its (0, 0) seed and the
 * shader would divide by zero.
 */
export function useWinResolution(
  materialRef: RefObject<ShaderMaterial | null>,
  mounted = true,
): void {
  const size = useThree((state) => state.size)
  const viewport = useThree((state) => state.viewport)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!mounted) return
    const u = materialRef.current?.uniforms
    if (!u) return
    u.winResolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr)
    invalidate()
  }, [mounted, size.width, size.height, viewport.dpr, invalidate, materialRef])
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
const clampUnit = (value: number) => Math.min(Math.max(value, 0), 1)

const isWithinUnit = (value: number) => value >= 0 && value <= 1

/**
 * A dropdown sitting in the canvas bleed (or just above the panel) must not
 * count as hovering the media — keep in sync with the cursor provider's
 * `[data-slot^="dropdown-menu"]` occluder.
 */
const isOccludedByDropdown = (clientX: number, clientY: number) =>
  typeof document.elementFromPoint === 'function' &&
  Boolean(document.elementFromPoint(clientX, clientY)?.closest('[data-slot^="dropdown-menu"]'))

/**
 * Where the pointer sits on the canvas in UV, and whether that counts as
 * hovering the media. Null while the canvas has no layout box to measure.
 */
function readCanvasPointer(canvas: HTMLCanvasElement, event: PointerEvent) {
  const rect = canvas.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return null
  const x = (event.clientX - rect.left) / rect.width
  // UV origin is bottom-left; client coordinates run top-down.
  const y = 1 - (event.clientY - rect.top) / rect.height
  const within = isWithinUnit(x) && isWithinUnit(y)
  return { x, y, inside: within && !isOccludedByDropdown(event.clientX, event.clientY) }
}

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
      const reading = readCanvasPointer(canvas, event)
      if (!reading) return
      // Clamped even when outside: proximity-activated scenes (see
      // `subscribeProximity`) run their effects while the pointer approaches,
      // and the lens should ride the panel edge nearest the cursor rather
      // than freeze at the last inside position. Hover-only scenes are
      // unaffected — their effects are invisible while `inside` is false.
      uv.current.set(clampUnit(reading.x), clampUnit(reading.y))
      const wasInside = inside.current
      inside.current = reading.inside
      // Demand frameloop: idle pointer motion across the page must not
      // request frames. Approaching scenes invalidate from their proximity
      // subscription; hover-only scenes only need a frame on enter/leave
      // or while the pointer is actually over the canvas.
      if (reading.inside || wasInside) invalidate()
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

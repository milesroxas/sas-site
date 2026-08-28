'use client'

import { useMemo, useRef, useState } from 'react'
import {
  SCROLL_GALLERY_DEFAULTS as DEFAULTS,
  ScrollGallery,
  type ScrollGalleryItem,
} from '@/features/immersive'
import {
  DEMO_IMAGE_SRC,
  DEMO_VIDEO_SRC,
  DemoBrowserFrame,
  DemoScroller,
  useDemoControls,
  useDemoSnippet,
} from '@/shared/ui/demo-kit'

/**
 * Demo items: the shared demo still and the home hero's gradient video, each
 * with its own palette so the mood blend is visible as the camera dollies.
 * Media is FPO — upload an image from the GUI to swap the stills.
 */
const DEMO_MOODS = [
  { background: '#fbe8cd', blob1: '#ffd56d', blob2: '#5d816a' },
  { background: '#101418', blob1: '#2f5d8a', blob2: '#8a2f5d' },
  { background: '#1c1a17', blob1: '#c47a3a', blob2: '#3a5cc4' },
  { background: '#0f1a14', blob1: '#3aa66a', blob2: '#a63a5c' },
  { background: '#1a1024', blob1: '#8a5cff', blob2: '#ff5c8a' },
] as const

/** Which demo items play the video; the rest take the still. */
const VIDEO_ITEMS = new Set([1])

const padIndex = (index: number) => String(index + 1).padStart(2, '0')

/**
 * Demo content: the scroll gallery inside a browser window with its own
 * scroller, every layout, scroll-response, motion and background parameter
 * wired to the surrounding DemoSection's GUI. The window hands the gallery
 * its viewport as `scrollSource`, so scrolling the frame — not the demo
 * shell around it — drives the camera. Demo-only — not shipped UI.
 */
export function ScrollGalleryPlayground() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const { image } = useDemoControls('Media', {
    image: { image: undefined, label: 'upload' },
  })

  const { planeGap, planeWidth, planeAspect, lateralOffset, cornerRadius, cameraDistance } =
    useDemoControls('Layout', {
      planeGap: { value: DEFAULTS.planeGap, min: 0.5, max: 6, step: 0.1, label: 'gap' },
      planeWidth: { value: DEFAULTS.planeWidth, min: 0.5, max: 3, step: 0.05, label: 'width' },
      planeAspect: { value: DEFAULTS.planeAspect, min: 0.5, max: 2.4, step: 0.01, label: 'aspect' },
      lateralOffset: {
        value: DEFAULTS.lateralOffset,
        min: 0,
        max: 1.5,
        step: 0.05,
        label: 'lateral',
      },
      cornerRadius: {
        value: DEFAULTS.cornerRadius,
        min: 0,
        max: 0.2,
        step: 0.005,
        label: 'corners',
      },
      cameraDistance: {
        value: DEFAULTS.cameraDistance,
        min: 1,
        max: 5,
        step: 0.1,
        label: 'camera',
      },
    })

  const { scrollSmoothing, velocityDamping, velocityMax, velocityStopThreshold } = useDemoControls(
    'Scroll response',
    {
      scrollSmoothing: {
        value: DEFAULTS.scrollSmoothing,
        min: 0.5,
        max: 20,
        step: 0.1,
        label: 'smoothing',
      },
      velocityDamping: {
        value: DEFAULTS.velocityDamping,
        min: 0.5,
        max: 20,
        step: 0.1,
        label: 'damping',
      },
      velocityMax: { value: DEFAULTS.velocityMax, min: 0.5, max: 10, step: 0.1, label: 'max' },
      velocityStopThreshold: {
        value: DEFAULTS.velocityStopThreshold,
        min: 0,
        max: 0.05,
        step: 0.001,
        label: 'stop threshold',
      },
    },
  )

  const { parallaxAmount, driftAmount, breathTilt, breathScale, fadeFar, fadeNear } =
    useDemoControls('Motion', {
      parallaxAmount: {
        value: DEFAULTS.parallaxAmount,
        min: 0,
        max: 0.5,
        step: 0.01,
        label: 'parallax',
      },
      driftAmount: { value: DEFAULTS.driftAmount, min: 0, max: 1, step: 0.01, label: 'drift' },
      breathTilt: { value: DEFAULTS.breathTilt, min: 0, max: 0.6, step: 0.01, label: 'tilt' },
      breathScale: { value: DEFAULTS.breathScale, min: 0, max: 0.3, step: 0.005, label: 'pulse' },
      fadeFar: { value: DEFAULTS.fadeFar, min: 2, max: 20, step: 0.5, label: 'fade far' },
      fadeNear: { value: DEFAULTS.fadeNear, min: 0.1, max: 2, step: 0.05, label: 'fade near' },
    })

  const {
    blobRadius,
    blobRadiusSecondary,
    blobStrength,
    noiseStrength,
    velocityBrightness,
    blobSpeed,
  } = useDemoControls('Background', {
    blobRadius: {
      value: DEFAULTS.blobRadius,
      min: 0.1,
      max: 2,
      step: 0.01,
      label: 'blob 1 radius',
    },
    blobRadiusSecondary: {
      value: DEFAULTS.blobRadiusSecondary,
      min: 0.1,
      max: 2,
      step: 0.01,
      label: 'blob 2 radius',
    },
    blobStrength: { value: DEFAULTS.blobStrength, min: 0, max: 1, step: 0.01, label: 'strength' },
    noiseStrength: { value: DEFAULTS.noiseStrength, min: 0, max: 0.3, step: 0.005, label: 'grain' },
    velocityBrightness: {
      value: DEFAULTS.velocityBrightness,
      min: 0,
      max: 0.4,
      step: 0.005,
      label: 'velocity lift',
    },
    blobSpeed: { value: DEFAULTS.blobSpeed, min: 0, max: 1, step: 0.01, label: 'blob drift' },
  })

  // Default palette — what an item without its own mood falls back to.
  const { background, blob1, blob2 } = useDemoControls('Default mood', {
    background: { value: DEFAULTS.background },
    blob1: { value: DEFAULTS.blob1, label: 'glow 1' },
    blob2: { value: DEFAULTS.blob2, label: 'glow 2' },
  })

  const { dpr } = useDemoControls('Canvas', {
    dpr: { value: DEFAULTS.dpr, min: 1, max: 2, step: 0.25, label: 'max dpr' },
  })

  const items = useMemo<ScrollGalleryItem[]>(
    () =>
      DEMO_MOODS.map((mood, index) =>
        VIDEO_ITEMS.has(index)
          ? { src: DEMO_VIDEO_SRC, video: true, mood }
          : { src: image ?? DEMO_IMAGE_SRC, mood },
      ),
    [image],
  )

  const props = {
    planeGap,
    planeWidth,
    planeAspect,
    lateralOffset,
    cornerRadius,
    cameraDistance,
    scrollSmoothing,
    velocityDamping,
    velocityMax,
    velocityStopThreshold,
    parallaxAmount,
    driftAmount,
    breathTilt,
    breathScale,
    fadeFar,
    fadeNear,
    blobRadius,
    blobRadiusSecondary,
    blobStrength,
    noiseStrength,
    velocityBrightness,
    blobSpeed,
    background,
    blob1,
    blob2,
    dpr,
  }

  // Items, the scroll track and the scroller stay out: the consumer owns its
  // media, its palette per item and the pinned shell the canvas sits in.
  useDemoSnippet(props)

  return (
    <DemoBrowserFrame
      path="/works/scroll-gallery"
      trailing={
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {padIndex(active)} / {padIndex(items.length - 1)}
        </span>
      }
    >
      <DemoScroller viewportRef={scrollRef} className="h-[70vh]">
        <div className="h-[30vh]" />
        <div
          className="relative"
          ref={trackRef}
          style={{ height: `calc(70vh + ${(items.length - 1) * 70}vh)` }}
        >
          <div className="sticky top-0 h-[70vh] overflow-hidden bg-zinc-950">
            {/* force: the demo has to render the effect even for a visitor
                whose device or motion preference would suppress it in production. */}
            <ScrollGallery
              force
              items={items}
              onActiveChange={setActive}
              pinRef={trackRef}
              scrollSource={scrollRef}
              {...props}
            />
          </div>
        </div>
        <div className="h-[30vh]" />
      </DemoScroller>
    </DemoBrowserFrame>
  )
}

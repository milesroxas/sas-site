'use client'

import { DispersionMedia, type DispersionShape } from '@/features/immersive'
import { useDemoControls } from './demo-section'

/** Default lives in /public; the GUI upload swaps in a blob URL. */
const DEFAULT_IMAGE = '/images/bg-fpo-01.jpg'
/**
 * The home hero's gradient video (media #22), through the same-origin Payload
 * proxy — the R2 custom domain sends no CORS headers, so sampling it
 * cross-origin would taint the WebGL canvas.
 */
const DEFAULT_VIDEO = '/api/media/file/Gradient%20Animation_converted-1.mp4'

/**
 * Demo content: DispersionMedia with every shader parameter wired to the
 * surrounding DemoSection's GUI, plus an image upload and a video URL field.
 * Demo-only — not shipped UI.
 */
export function DispersionPlayground() {
  const { media, image, videoUrl } = useDemoControls('Media', {
    media: { value: 'video', options: ['video', 'image'] },
    image: {
      image: undefined,
      label: 'upload',
      render: (get) => get('Media.media') === 'image',
    },
    videoUrl: {
      value: DEFAULT_VIDEO,
      label: 'video url',
      render: (get) => get('Media.media') === 'video',
    },
  })

  // leva select values widen to string; the options list is the source of truth.
  const { shape, scale, speed } = useDemoControls('Mesh', {
    shape: {
      value: 'icosahedron',
      options: ['icosahedron', 'torus'] satisfies DispersionShape[],
    },
    scale: { value: 1.4, min: 0.5, max: 2.5, step: 0.05 },
    speed: { value: 0.3, min: 0, max: 2, step: 0.05 },
  })

  const { refraction, chroma, saturation } = useDemoControls('Dispersion', {
    refraction: { value: 0.4, min: 0, max: 1, step: 0.01 },
    chroma: { value: 0.6, min: 0, max: 1.5, step: 0.01 },
    saturation: { value: 1.08, min: 1, max: 1.25, step: 0.01 },
  })

  const { iorR, iorY, iorG, iorC, iorB, iorP } = useDemoControls('IOR', {
    iorR: { value: 1.15, min: 1, max: 2.33, step: 0.01, label: 'red' },
    iorY: { value: 1.16, min: 1, max: 2.33, step: 0.01, label: 'yellow' },
    iorG: { value: 1.18, min: 1, max: 2.33, step: 0.01, label: 'green' },
    iorC: { value: 1.22, min: 1, max: 2.33, step: 0.01, label: 'cyan' },
    iorB: { value: 1.22, min: 1, max: 2.33, step: 0.01, label: 'blue' },
    iorP: { value: 1.22, min: 1, max: 2.33, step: 0.01, label: 'purple' },
  })

  const isVideo = media === 'video' && Boolean(videoUrl)
  const src = isVideo ? videoUrl : (image ?? DEFAULT_IMAGE)

  return (
    <DispersionMedia
      src={src}
      video={isVideo}
      shape={shape as DispersionShape}
      scale={scale}
      speed={speed}
      refraction={refraction}
      chromaticAberration={chroma}
      saturation={saturation}
      iorR={iorR}
      iorY={iorY}
      iorG={iorG}
      iorC={iorC}
      iorB={iorB}
      iorP={iorP}
      className="aspect-video overflow-hidden rounded-md bg-zinc-950"
    />
  )
}

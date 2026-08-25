'use client'

import {
  DISPERSION_MEDIA_DEFAULTS as DEFAULTS,
  DispersionMedia,
  type DispersionShape,
} from '@/features/immersive'
import { useDemoControls, useDemoMediaSource, useDemoSnippet } from '@/shared/ui/demo-kit'

/**
 * Demo content: DispersionMedia with every shader parameter wired to the
 * surrounding DemoSection's GUI, plus an image upload and a video URL field.
 * Demo-only — not shipped UI.
 */
export function DispersionPlayground() {
  const { src, isVideo } = useDemoMediaSource('video')

  // leva select values widen to string; the options list is the source of truth.
  const { shape, scale, speed, follow } = useDemoControls('Mesh', {
    shape: {
      value: DEFAULTS.shape,
      options: ['icosahedron', 'torus'] satisfies DispersionShape[],
    },
    scale: { value: DEFAULTS.scale, min: 0.5, max: 2.5, step: 0.05 },
    speed: { value: DEFAULTS.speed, min: 0, max: 2, step: 0.05 },
    follow: { value: DEFAULTS.follow, min: 1, max: 20, step: 0.5 },
  })

  const { refraction, chroma, saturation } = useDemoControls('Dispersion', {
    refraction: { value: DEFAULTS.refraction, min: 0, max: 1, step: 0.01 },
    chroma: { value: DEFAULTS.chromaticAberration, min: 0, max: 1.5, step: 0.01 },
    saturation: { value: DEFAULTS.saturation, min: 1, max: 1.25, step: 0.01 },
  })

  const { iorR, iorY, iorG, iorC, iorB, iorP } = useDemoControls('IOR', {
    iorR: { value: DEFAULTS.iorR, min: 1, max: 2.33, step: 0.01, label: 'red' },
    iorY: { value: DEFAULTS.iorY, min: 1, max: 2.33, step: 0.01, label: 'yellow' },
    iorG: { value: DEFAULTS.iorG, min: 1, max: 2.33, step: 0.01, label: 'green' },
    iorC: { value: DEFAULTS.iorC, min: 1, max: 2.33, step: 0.01, label: 'cyan' },
    iorB: { value: DEFAULTS.iorB, min: 1, max: 2.33, step: 0.01, label: 'blue' },
    iorP: { value: DEFAULTS.iorP, min: 1, max: 2.33, step: 0.01, label: 'purple' },
  })

  // Media stays out: the consumer binds its own source.
  useDemoSnippet({
    shape,
    scale,
    speed,
    follow,
    refraction,
    chromaticAberration: chroma,
    saturation,
    iorR,
    iorY,
    iorG,
    iorC,
    iorB,
    iorP,
  })

  return (
    <DispersionMedia
      src={src}
      video={isVideo}
      shape={shape as DispersionShape}
      scale={scale}
      speed={speed}
      follow={follow}
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

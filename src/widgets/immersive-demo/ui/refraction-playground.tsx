'use client'

import { RefractionMedia } from '@/features/immersive'
import { useDemoControls } from './demo-section'

/** Default lives in /public; the GUI upload swaps in a blob URL. */
const DEFAULT_IMAGE = '/images/bg-fpo-01.jpg'

/**
 * Demo content: RefractionMedia with every shader parameter wired to the
 * surrounding DemoSection's GUI, plus an image upload. Demo-only — not
 * shipped UI.
 */
export function RefractionPlayground() {
  const { image } = useDemoControls('Image', {
    image: { image: undefined, label: 'upload' },
  })

  const { spread, feather, edge, refraction, chroma } = useDemoControls('Lens', {
    spread: { value: 0.22, min: 0.05, max: 0.6, step: 0.01 },
    // 0 = edgeless gaussian falloff (no visible boundary); 1 = ringed lens.
    edge: { value: 0, min: 0, max: 1, step: 0.05 },
    feather: {
      value: 0.6,
      min: 0,
      max: 1,
      step: 0.05,
      render: (get) => get('Lens.edge') > 0,
    },
    refraction: { value: 0.12, min: 0, max: 0.5, step: 0.01 },
    chroma: { value: 0.35, min: 0, max: 1, step: 0.05 },
  })

  // leva clamps number display to 2 decimals, so tiny UV offsets read as
  // "0.00" — expose distortion ×1000 / smear ×100 and scale back down below.
  const { distortion, noiseScale, noiseSpeed } = useDemoControls('Distortion', {
    distortion: { value: 8, min: 0, max: 40, step: 1, label: 'amount' },
    noiseScale: { value: 6, min: 1, max: 20, step: 0.5, label: 'scale' },
    noiseSpeed: { value: 0.4, min: 0, max: 2, step: 0.05, label: 'speed' },
  })

  const { smear, highlight, follow, ease } = useDemoControls('Motion', {
    smear: { value: 2, min: 0, max: 10, step: 0.5 },
    highlight: {
      value: 0.08,
      min: 0,
      max: 0.5,
      step: 0.01,
      render: (get) => get('Lens.edge') > 0,
    },
    follow: { value: 8, min: 1, max: 20, step: 0.5 },
    ease: { value: 6, min: 1, max: 20, step: 0.5 },
  })

  return (
    <RefractionMedia
      src={image ?? DEFAULT_IMAGE}
      spread={spread}
      feather={feather}
      edge={edge}
      refraction={refraction}
      chroma={chroma}
      distortion={distortion / 1000}
      noiseScale={noiseScale}
      noiseSpeed={noiseSpeed}
      smear={smear / 100}
      highlight={highlight}
      follow={follow}
      ease={ease}
      className="aspect-video overflow-hidden rounded-md bg-zinc-950"
    />
  )
}

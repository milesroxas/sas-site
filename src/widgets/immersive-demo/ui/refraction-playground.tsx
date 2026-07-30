'use client'

import { button } from 'leva'
import { RefractionMedia } from '@/features/immersive'
import { useDemoControls } from './demo-section'
import { useVideoUpload } from './use-video-upload'

/** Default lives in /public; the GUI upload swaps in a blob URL. */
const DEFAULT_IMAGE = '/images/bg-fpo-01.jpg'
/**
 * The home hero's gradient video (media #22), through the same-origin Payload
 * proxy — the R2 custom domain sends no CORS headers, so sampling it
 * cross-origin would taint the WebGL canvas.
 */
const DEFAULT_VIDEO = '/api/media/file/Gradient%20Animation_converted-1.mp4'

/**
 * Demo content: RefractionMedia with every shader parameter wired to the
 * surrounding DemoSection's GUI, plus image and video uploads. Demo-only —
 * not shipped UI.
 */
export function RefractionPlayground() {
  const pickVideo = useVideoUpload({ urlPath: 'Media.videoUrl', mediaPath: 'Media.media' })
  const { media, image, videoUrl } = useDemoControls('Media', {
    media: { value: 'image', options: ['image', 'video'] },
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
    // leva buttons ignore `render`, so this stays visible in image mode too;
    // picking a file flips the media select to video.
    'upload video (≤10 MB)': button(pickVideo),
  })

  const { spread, feather, edge, refraction, chroma } = useDemoControls('Warp', {
    spread: { value: 0.22, min: 0.05, max: 0.6, step: 0.01 },
    // 0 = edgeless gaussian falloff (no visible boundary); 1 = ringed lens.
    edge: { value: 0, min: 0, max: 1, step: 0.05 },
    feather: {
      value: 0.6,
      min: 0,
      max: 1,
      step: 0.05,
      render: (get) => get('Warp.edge') > 0,
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

  const {
    lensEnabled,
    lensVisibility,
    lensSpread,
    lensDepth,
    lensRefraction,
    lensChroma,
    lensSaturation,
  } = useDemoControls('Glass lens', {
    lensEnabled: { value: false, label: 'enabled' },
    lensVisibility: {
      value: 1,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'visibility',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensSpread: {
      value: 0.22,
      min: 0.05,
      max: 0.6,
      step: 0.01,
      label: 'size',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensDepth: {
      value: 0.55,
      min: 0.1,
      max: 1,
      step: 0.05,
      label: 'depth',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensRefraction: {
      value: 0.15,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'refraction',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensChroma: {
      value: 0.5,
      min: 0,
      max: 1.5,
      step: 0.01,
      label: 'chroma',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensSaturation: {
      value: 1.04,
      min: 1,
      max: 1.25,
      step: 0.01,
      label: 'saturation',
      render: (get) => get('Glass lens.lensEnabled'),
    },
  })

  const { iorR, iorY, iorG, iorC, iorB, iorP } = useDemoControls('IOR', {
    iorR: {
      value: 1.15,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'red',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorY: {
      value: 1.16,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'yellow',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorG: {
      value: 1.18,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'green',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorC: {
      value: 1.22,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'cyan',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorB: {
      value: 1.22,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'blue',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorP: {
      value: 1.22,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'purple',
      render: (get) => get('Glass lens.lensEnabled'),
    },
  })

  const { smear, highlight, follow, ease } = useDemoControls('Motion', {
    smear: { value: 2, min: 0, max: 10, step: 0.5 },
    highlight: {
      value: 0.08,
      min: 0,
      max: 0.5,
      step: 0.01,
      render: (get) => get('Warp.edge') > 0,
    },
    follow: { value: 8, min: 1, max: 20, step: 0.5 },
    ease: { value: 6, min: 1, max: 20, step: 0.5 },
  })

  const isVideo = media === 'video' && Boolean(videoUrl)

  return (
    <RefractionMedia
      src={isVideo ? videoUrl : (image ?? DEFAULT_IMAGE)}
      video={isVideo}
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
      lensVisibility={lensEnabled ? lensVisibility : 0}
      lensSpread={lensSpread}
      lensDepth={lensDepth}
      lensRefraction={lensRefraction}
      lensChroma={lensChroma}
      lensSaturation={lensSaturation}
      iorR={iorR}
      iorY={iorY}
      iorG={iorG}
      iorC={iorC}
      iorB={iorB}
      iorP={iorP}
      follow={follow}
      ease={ease}
      className="aspect-video overflow-hidden rounded-md bg-zinc-950"
    />
  )
}

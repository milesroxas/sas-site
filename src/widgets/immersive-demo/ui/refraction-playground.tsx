'use client'

import {
  REFRACTION_MEDIA_DEFAULTS as DEFAULTS,
  HERO_LENS,
  RefractionMedia,
  type RefractionMediaProps,
} from '@/features/immersive'
import { useDemoControls, useDemoMediaSource, useDemoSnippet } from '@/shared/ui/demo-kit'
import { cn } from '@/utilities/ui'
import { useRefractionEdgeControls } from './use-refraction-edge-controls'

/**
 * Demo content: RefractionMedia with every shader parameter wired to the
 * surrounding DemoSection's GUI, plus image and video uploads. Demo-only —
 * not shipped UI.
 */
export function RefractionPlayground() {
  const { src, isVideo } = useDemoMediaSource()

  // Initial values mirror the shipped home-hero look (HERO_LENS); lens-mesh
  // controls fall back to the component defaults the preset leaves untouched.
  const { spread, feather, edge, refraction, chroma } = useDemoControls('Warp', {
    spread: { value: HERO_LENS.spread, min: 0.05, max: 0.6, step: 0.01 },
    // 0 = edgeless gaussian falloff (no visible boundary); 1 = ringed lens.
    edge: { value: HERO_LENS.edge, min: 0, max: 1, step: 0.05 },
    feather: {
      value: HERO_LENS.feather,
      min: 0,
      max: 1,
      step: 0.05,
      render: (get) => get('Warp.edge') > 0,
    },
    refraction: { value: HERO_LENS.refraction, min: 0, max: 0.5, step: 0.01 },
    chroma: { value: HERO_LENS.chroma, min: 0, max: 1, step: 0.05 },
  })

  // leva clamps number display to 2 decimals, so tiny UV offsets read as
  // "0.00" — expose distortion ×1000 / smear ×100 and scale back down below.
  const { distortion, noiseScale, noiseSpeed } = useDemoControls('Distortion', {
    distortion: { value: HERO_LENS.distortion * 1000, min: 0, max: 40, step: 1, label: 'amount' },
    noiseScale: { value: HERO_LENS.noiseScale, min: 1, max: 20, step: 0.5, label: 'scale' },
    noiseSpeed: { value: HERO_LENS.noiseSpeed, min: 0, max: 2, step: 0.05, label: 'speed' },
  })

  // Edge melt: the canvas bleeds past its box and the warp deforms the
  // media's silhouette into that margin (HERO_LENS ships without it, so
  // everything initializes from the component defaults with bleed off).
  const { bleed, melt, meltScale, meltSpeed, meltBand, meltFeather } = useRefractionEdgeControls(
    DEFAULTS.bleed,
  )

  const {
    lensEnabled,
    lensVisibility,
    lensSpread,
    lensDepth,
    lensRefraction,
    lensChroma,
    lensSaturation,
  } = useDemoControls('Glass lens', {
    // HERO_LENS ships with the mesh optically absent (lensVisibility: 0).
    lensEnabled: { value: HERO_LENS.lensVisibility > 0, label: 'enabled' },
    lensVisibility: {
      value: DEFAULTS.lensVisibility,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'visibility',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensSpread: {
      value: DEFAULTS.lensSpread,
      min: 0.05,
      max: 0.6,
      step: 0.01,
      label: 'size',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensDepth: {
      value: DEFAULTS.lensDepth,
      min: 0.1,
      max: 1,
      step: 0.05,
      label: 'depth',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensRefraction: {
      value: DEFAULTS.lensRefraction,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'refraction',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensChroma: {
      value: DEFAULTS.lensChroma,
      min: 0,
      max: 1.5,
      step: 0.01,
      label: 'chroma',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    lensSaturation: {
      value: DEFAULTS.lensSaturation,
      min: 1,
      max: 1.25,
      step: 0.01,
      label: 'saturation',
      render: (get) => get('Glass lens.lensEnabled'),
    },
  })

  const { iorR, iorY, iorG, iorC, iorB, iorP } = useDemoControls('IOR', {
    iorR: {
      value: DEFAULTS.iorR,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'red',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorY: {
      value: DEFAULTS.iorY,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'yellow',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorG: {
      value: DEFAULTS.iorG,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'green',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorC: {
      value: DEFAULTS.iorC,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'cyan',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorB: {
      value: DEFAULTS.iorB,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'blue',
      render: (get) => get('Glass lens.lensEnabled'),
    },
    iorP: {
      value: DEFAULTS.iorP,
      min: 1,
      max: 2.33,
      step: 0.01,
      label: 'purple',
      render: (get) => get('Glass lens.lensEnabled'),
    },
  })

  const { tilt, smear, highlight, follow, ease } = useDemoControls('Motion', {
    // HERO_LENS leaves tilt at the component default (0, off).
    tilt: { value: DEFAULTS.tilt, min: -15, max: 15, step: 0.5 },
    smear: { value: HERO_LENS.smear * 100, min: 0, max: 10, step: 0.5 },
    highlight: {
      value: HERO_LENS.highlight,
      min: 0,
      max: 0.5,
      step: 0.01,
      render: (get) => get('Warp.edge') > 0,
    },
    follow: { value: HERO_LENS.follow, min: 1, max: 20, step: 0.5 },
    ease: { value: HERO_LENS.ease, min: 1, max: 20, step: 0.5 },
  })

  // One object drives both the rendered effect and copied snippet so the
  // playground cannot display one tuning while exporting another. Media stays
  // out because the hero binds its own source.
  const effectProps = {
    spread,
    edge,
    feather,
    refraction,
    chroma,
    distortion: distortion / 1000,
    noiseScale,
    noiseSpeed,
    bleed,
    melt: melt / 1000,
    meltScale,
    meltSpeed,
    meltBand,
    meltFeather,
    smear: smear / 100,
    highlight,
    lensVisibility: lensEnabled ? lensVisibility : 0,
    lensSpread,
    lensDepth,
    lensRefraction,
    lensChroma,
    lensSaturation,
    iorR,
    iorY,
    iorG,
    iorC,
    iorB,
    iorP,
    tilt,
    follow,
    ease,
  } satisfies Omit<RefractionMediaProps, 'className' | 'src' | 'video'>

  useDemoSnippet(effectProps)

  return (
    <RefractionMedia
      src={src}
      video={isVideo}
      {...effectProps}
      // Clipping would swallow the bleed overhang — only round/clip without it.
      className={cn('aspect-video bg-zinc-950', bleed === 0 && 'overflow-hidden rounded-md')}
    />
  )
}

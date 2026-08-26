'use client'

import {
  REFRACTION_MEDIA_DEFAULTS as DEFAULTS,
  INDUSTRY_WORK_MEDIA as PRESET,
  RefractionMedia,
} from '@/features/immersive'
import { useDemoControls, useDemoMediaSource, useDemoSnippet } from '@/shared/ui/demo-kit'
import { useRefractionEdgeControls } from './use-refraction-edge-controls'

/**
 * Demo content: the IndustryWork main-media hover effect on a standalone
 * stage — RefractionMedia with the shipped `INDUSTRY_WORK_MEDIA` preset as
 * the GUI's initial values, plus a title overlapping the media's edge the way
 * the block composes it. The effect stays the single reusable piece (the
 * block reads the same preset); media and text are GUI-configurable here so
 * dialing doesn't depend on CMS content. Demo-only — not shipped UI.
 */
export function IndustryWorkPlayground() {
  const { src, isVideo } = useDemoMediaSource()

  const { title } = useDemoControls('Text', {
    title: { value: 'Clarity for a payments platform' },
  })

  // Initial values mirror the shipped INDUSTRY_WORK_MEDIA preset; anything the
  // preset leaves untouched falls back to the component defaults.
  const { tilt, spread, refraction, chroma } = useDemoControls('Tilt & warp', {
    tilt: { value: PRESET.tilt, min: -15, max: 15, step: 0.5 },
    spread: { value: PRESET.spread, min: 0.05, max: 0.6, step: 0.01 },
    refraction: { value: PRESET.refraction, min: 0, max: 0.5, step: 0.01 },
    chroma: { value: PRESET.chroma, min: 0, max: 1, step: 0.05 },
  })

  // leva clamps number display to 2 decimals, so tiny UV offsets read as
  // "0.00" — expose distortion ×1000 / smear ×100 and scale back down below.
  const { distortion, noiseScale, noiseSpeed } = useDemoControls('Distortion', {
    distortion: { value: PRESET.distortion * 1000, min: 0, max: 40, step: 1, label: 'amount' },
    noiseScale: { value: PRESET.noiseScale, min: 1, max: 20, step: 0.5, label: 'scale' },
    noiseSpeed: { value: PRESET.noiseSpeed, min: 0, max: 2, step: 0.05, label: 'speed' },
  })

  // Edge melt: the canvas bleeds past the panel and the warp deforms the
  // media's silhouette into that margin. Amount rides the same ×1000 display
  // scaling as distortion; soften is the one knob the preset leaves at the
  // component default.
  const { bleed, melt, meltScale, meltDetail, meltSpeed, meltBand, meltFeather } =
    useRefractionEdgeControls(PRESET)

  const { smear, follow, ease, lensVisibility, lensSpread, lensFade } = useDemoControls('Motion', {
    smear: { value: PRESET.smear * 100, min: 0, max: 10, step: 0.5 },
    follow: { value: PRESET.follow, min: 1, max: 20, step: 0.5 },
    ease: { value: PRESET.ease, min: 1, max: 20, step: 0.5 },
    lensVisibility: {
      value: PRESET.lensVisibility,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'glass lens',
    },
    // Glass mesh diameter as a fraction of the panel height; only meaningful
    // once the mesh above is visible, so it hides with it.
    lensSpread: {
      value: PRESET.lensSpread,
      min: 0.05,
      max: 0.6,
      step: 0.01,
      label: 'lens radius',
      render: (get) => get('Motion.lensVisibility') > 0,
    },
    // How far inside the panel the mesh has retired by the time its rim would
    // reach the edge — the knob that keeps the lens inset instead of clipping.
    lensFade: {
      value: PRESET.lensFade ?? DEFAULTS.lensFade,
      min: 0,
      max: 0.4,
      step: 0.01,
      label: 'lens fade',
      render: (get) => get('Motion.lensVisibility') > 0,
    },
  })

  // Media and text stay out: the block binds CMS content. Units match the
  // shipped `INDUSTRY_WORK_MEDIA` preset, so the snippet drops straight in.
  useDemoSnippet({
    tilt,
    bleed,
    melt: melt / 1000,
    meltScale,
    meltDetail,
    meltSpeed,
    meltBand,
    meltFeather,
    spread,
    refraction,
    chroma,
    distortion: distortion / 1000,
    noiseScale,
    noiseSpeed,
    smear: smear / 100,
    lensVisibility,
    lensSpread,
    lensFade,
    follow,
    ease,
  })

  return (
    // No overflow clipping on the stage: the whole point is the effect
    // escaping the media's bounding box, so give the bleed dark breathing
    // room instead.
    <div className="rounded-md bg-zinc-950 px-8 py-16 md:px-14 md:py-24">
      <div className="relative mx-auto w-full max-w-3xl">
        {/* Same composition beat as the block: the title column overlaps the
            media's left edge, so the melt can be dialed against overlapping
            text and the section background. */}
        <div className="relative ml-[14%] aspect-8/5">
          <RefractionMedia
            className="size-full"
            src={src}
            video={isVideo}
            {...PRESET}
            tilt={tilt}
            bleed={bleed}
            melt={melt / 1000}
            meltScale={meltScale}
            meltDetail={meltDetail}
            meltSpeed={meltSpeed}
            meltBand={meltBand}
            meltFeather={meltFeather}
            spread={spread}
            refraction={refraction}
            chroma={chroma}
            distortion={distortion / 1000}
            noiseScale={noiseScale}
            noiseSpeed={noiseSpeed}
            smear={smear / 100}
            lensVisibility={lensVisibility}
            lensSpread={lensSpread}
            lensFade={lensFade}
            follow={follow}
            ease={ease}
          />
        </div>
        {title ? (
          <h3 className="pointer-events-none absolute top-[10%] left-0 z-10 max-w-[52%] text-heading-3 font-light text-white">
            {title}
          </h3>
        ) : null}
      </div>
    </div>
  )
}

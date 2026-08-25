'use client'

import { REFRACTION_MEDIA_DEFAULTS } from '@/features/immersive'
import { useDemoControls } from '@/shared/ui/demo-kit'

/**
 * Keeps the edge-melt playground contract aligned wherever RefractionMedia is
 * demonstrated. Only bleed varies by preset; the remaining controls expose
 * the component defaults using the display scaling expected by the demos.
 */
export function useRefractionEdgeControls(initialBleed: number) {
  return useDemoControls('Edge melt', {
    bleed: { value: initialBleed, min: 0, max: 0.3, step: 0.01 },
    melt: {
      value: REFRACTION_MEDIA_DEFAULTS.melt * 1000,
      min: 0,
      max: 120,
      step: 1,
      label: 'amount',
    },
    meltScale: {
      value: REFRACTION_MEDIA_DEFAULTS.meltScale,
      min: 1,
      max: 20,
      step: 0.5,
      label: 'scale',
    },
    meltSpeed: {
      value: REFRACTION_MEDIA_DEFAULTS.meltSpeed,
      min: 0,
      max: 2,
      step: 0.05,
      label: 'speed',
    },
    meltBand: {
      value: REFRACTION_MEDIA_DEFAULTS.meltBand,
      min: 0.02,
      max: 0.3,
      step: 0.01,
      label: 'band',
    },
    meltFeather: {
      value: REFRACTION_MEDIA_DEFAULTS.meltFeather,
      min: 0,
      max: 0.1,
      step: 0.005,
      label: 'soften',
    },
  })
}

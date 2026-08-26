'use client'

import { REFRACTION_MEDIA_DEFAULTS, type RefractionMediaProps } from '@/features/immersive'
import { useDemoControls } from '@/shared/ui/demo-kit'

type EdgeMeltInitials = Pick<
  RefractionMediaProps,
  'bleed' | 'melt' | 'meltScale' | 'meltDetail' | 'meltSpeed' | 'meltBand' | 'meltFeather'
>

/**
 * Keeps the edge-melt playground contract aligned wherever RefractionMedia is
 * demonstrated. Initial values come from the preset under test; whatever it
 * leaves untouched falls back to the component defaults, both using the
 * display scaling expected by the demos.
 */
export function useRefractionEdgeControls(preset: EdgeMeltInitials = {}) {
  return useDemoControls('Edge melt', {
    bleed: {
      value: preset.bleed ?? REFRACTION_MEDIA_DEFAULTS.bleed,
      min: 0,
      max: 0.3,
      step: 0.01,
    },
    melt: {
      value: (preset.melt ?? REFRACTION_MEDIA_DEFAULTS.melt) * 1000,
      min: 0,
      max: 120,
      step: 1,
      label: 'amount',
    },
    meltScale: {
      value: preset.meltScale ?? REFRACTION_MEDIA_DEFAULTS.meltScale,
      // Reaches well below 1: a wavelength wider than the panel is what makes
      // the edge read as slow fluid rather than a row of ripples.
      min: 0.25,
      max: 20,
      step: 0.25,
      label: 'frequency',
    },
    meltDetail: {
      value: preset.meltDetail ?? REFRACTION_MEDIA_DEFAULTS.meltDetail,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'organic',
    },
    meltSpeed: {
      value: preset.meltSpeed ?? REFRACTION_MEDIA_DEFAULTS.meltSpeed,
      min: 0,
      max: 2,
      step: 0.05,
      label: 'speed',
    },
    meltBand: {
      value: preset.meltBand ?? REFRACTION_MEDIA_DEFAULTS.meltBand,
      min: 0.02,
      max: 0.3,
      step: 0.01,
      label: 'band',
    },
    meltFeather: {
      value: preset.meltFeather ?? REFRACTION_MEDIA_DEFAULTS.meltFeather,
      min: 0,
      max: 0.1,
      step: 0.005,
      label: 'soften',
    },
  })
}

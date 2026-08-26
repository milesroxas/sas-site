'use client'

import { useState } from 'react'
import {
  TEXT_LOAD_IN_RAYMARCHED_DEFAULTS as DEFAULTS,
  TextLoadInRaymarched,
} from '@/features/immersive'
import { useDemoAction, useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'
import {
  TextLoadInDemoStage,
  useBodyControls,
  useDemoCopyControls,
  useEyebrowControls,
  useTriggerControls,
} from './text-load-in-playground-shared'

const EASES = [
  'power2.inOut',
  'power3.inOut',
  'sine.inOut',
  'power1.out',
  'power2.out',
  'power3.out',
  'expo.out',
  'none',
]

/**
 * Demo content: TextLoadInRaymarched with every parameter wired to the
 * surrounding DemoSection's GUI — copy included. Demo-only — not shipped UI.
 */
export function TextLoadInRaymarchedPlayground() {
  const [replayKey, setReplayKey] = useState(0)

  const { eyebrow, heading, body } = useDemoCopyControls()
  const eyebrowControls = useEyebrowControls(DEFAULTS)

  const timingControls = useDemoControls('Timing', {
    offset: { value: DEFAULTS.offset, min: 0, max: 3, step: 0.05, label: 'offset (s)' },
    stagger: { value: DEFAULTS.stagger, min: 0, max: 3, step: 0.05, label: 'stagger (s)' },
  })

  const headingControls = useDemoControls('Heading', {
    headingDuration: {
      value: DEFAULTS.headingDuration,
      min: 0.5,
      max: 8,
      step: 0.05,
      label: 'duration',
    },
    ease: { value: DEFAULTS.ease, options: EASES },
  })

  const raymarchControls = useDemoControls('Raymarch (SDF)', {
    marchSteps: { value: DEFAULTS.marchSteps, min: 16, max: 96, step: 1, label: 'march steps' },
    gooeyPx: { value: DEFAULTS.gooeyPx, min: 1, max: 90, step: 1, label: 'smooth-min k' },
    edgePx: { value: DEFAULTS.edgePx, min: 10, max: 240, step: 2, label: 'front softness' },
    sweepAngle: { value: DEFAULTS.sweepAngle, min: 0, max: 360, step: 5, label: 'sweep angle' },
    lightAngle: { value: DEFAULTS.lightAngle, min: 0, max: 360, step: 5, label: 'light angle' },
  })

  const dropletControls = useDemoControls('Droplets', {
    dropletPx: { value: DEFAULTS.dropletPx, min: 0, max: 60, step: 1, label: 'size (px)' },
    dropletCount: { value: DEFAULTS.dropletCount, min: 0, max: 8, step: 1, label: 'count' },
    dropletStretch: {
      value: DEFAULTS.dropletStretch,
      min: 0.3,
      max: 4,
      step: 0.05,
      label: 'stretch',
    },
    dropletScatter: {
      value: DEFAULTS.dropletScatter,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'scatter',
    },
    wobblePx: { value: DEFAULTS.wobblePx, min: 0, max: 60, step: 1, label: 'wobble (px)' },
  })

  const bodyControls = useBodyControls(DEFAULTS)
  const triggerControls = useTriggerControls(DEFAULTS)

  useDemoAction('replay', () => setReplayKey((n) => n + 1))

  // One object drives both the emitted snippet and the render, so the code the
  // panel shows can never drift from what is on screen. Copy stays out: the
  // consumer supplies its own eyebrow, heading and body.
  const config = {
    ...triggerControls,
    ...eyebrowControls,
    ...timingControls,
    ...headingControls,
    ...raymarchControls,
    ...dropletControls,
    ...bodyControls,
  }

  useDemoSnippet(config)

  return (
    <TextLoadInDemoStage className="bg-background">
      <TextLoadInRaymarched
        className="relative"
        eyebrow={eyebrow}
        heading={heading}
        body={body}
        replayKey={replayKey}
        {...config}
      />
    </TextLoadInDemoStage>
  )
}

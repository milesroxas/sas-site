'use client'

import { useState } from 'react'
import { TEXT_LOAD_IN_DEFAULTS as DEFAULTS, TextLoadIn } from '@/features/immersive'
import { useDemoAction, useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'
import {
  TextLoadInDemoStage,
  useBodyControls,
  useDemoCopyControls,
  useEyebrowControls,
  useTriggerControls,
} from './text-load-in-playground-shared'

const EASES = [
  'power1.out',
  'power2.out',
  'power3.out',
  'power4.out',
  'sine.out',
  'expo.out',
  'circ.out',
  'none',
]

/**
 * Demo content: TextLoadIn with every parameter wired to the surrounding
 * DemoSection's GUI — copy included. Demo-only — not shipped UI.
 */
export function TextLoadInPlayground() {
  const [replayKey, setReplayKey] = useState(0)

  const { eyebrow, heading, body } = useDemoCopyControls()
  const eyebrowControls = useEyebrowControls(DEFAULTS)

  const headingControls = useDemoControls('Heading', {
    headingStart: { value: DEFAULTS.headingStart, min: 0, max: 3, step: 0.05, label: 'start (s)' },
    headingDuration: {
      value: DEFAULTS.headingDuration,
      min: 0.3,
      max: 5,
      step: 0.05,
      label: 'duration',
    },
    ease: { value: DEFAULTS.ease, options: EASES },
    headingStagger: {
      value: DEFAULTS.headingStagger,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'char stagger',
    },
  })

  const smearControls = useDemoControls('Smear (ray march)', {
    smearPx: { value: DEFAULTS.smearPx, min: 0, max: 400, step: 2, label: 'smear (px)' },
    marchSteps: { value: DEFAULTS.marchSteps, min: 8, max: 32, step: 1, label: 'gather taps' },
    smearAngle: { value: DEFAULTS.smearAngle, min: 0, max: 360, step: 5, label: 'angle' },
    gooey: { value: DEFAULTS.gooey, min: 0, max: 1, step: 0.05 },
    fade: { value: DEFAULTS.fade, min: 0, max: 1, step: 0.05 },
  })

  const bodyControls = useBodyControls(DEFAULTS, {
    bodyStart: { value: DEFAULTS.bodyStart, min: 0, max: 4, step: 0.05, label: 'start (s)' },
  })

  const triggerControls = useTriggerControls(DEFAULTS)

  useDemoAction('replay', () => setReplayKey((n) => n + 1))

  // One object drives both the emitted snippet and the render, so the code the
  // panel shows can never drift from what is on screen. Copy stays out: the
  // consumer supplies its own eyebrow, heading and body.
  const config = {
    ...triggerControls,
    ...eyebrowControls,
    ...headingControls,
    ...smearControls,
    ...bodyControls,
  }

  useDemoSnippet(config)

  return (
    <TextLoadInDemoStage className="bg-zinc-950">
      <TextLoadIn
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

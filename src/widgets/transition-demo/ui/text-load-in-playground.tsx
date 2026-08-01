'use client'

import { button } from 'leva'
import { useState } from 'react'
import { TEXT_LOAD_IN_DEFAULTS as DEFAULTS, TextLoadIn } from '@/features/immersive'
import { useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'

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

const ORDERS = ['leftToRight', 'random', 'simultaneous', 'center', 'edges', 'rightToLeft'] as const
const CHAR_SETS = ['upperCase', 'lowerCase', 'upperAndLowerCase', 'custom']
const DEFAULT_CUSTOM_CHARS = '!<>-_\\/[]{}—=+*^?#________'

/**
 * Demo content: TextLoadIn with every parameter wired to the surrounding
 * DemoSection's GUI — copy included. Demo-only — not shipped UI.
 */
export function TextLoadInPlayground() {
  const [replayKey, setReplayKey] = useState(0)

  const { eyebrow, heading, body } = useDemoControls('Content', {
    eyebrow: { value: 'OUR PERFORMANCE' },
    heading: { value: 'Performance Proven at Scale' },
    body: {
      value:
        'Built for environments where uptime is non-negotiable, our technology delivers measurable reliability.',
    },
  })

  const { scrambleDuration, scrambleOrder, charSet, customChars, scrambleSpeed } = useDemoControls(
    'Eyebrow',
    {
      scrambleDuration: {
        value: DEFAULTS.scrambleDuration,
        min: 0.2,
        max: 4,
        step: 0.05,
        label: 'duration',
      },
      scrambleOrder: {
        value: DEFAULTS.scrambleOrder as (typeof ORDERS)[number],
        options: [...ORDERS],
        label: 'order',
      },
      charSet: { value: DEFAULTS.scrambleChars, options: CHAR_SETS },
      customChars: {
        value: DEFAULT_CUSTOM_CHARS,
        render: (get) => get('Eyebrow.charSet') === 'custom',
      },
      scrambleSpeed: {
        value: DEFAULTS.scrambleSpeed,
        min: 0.05,
        max: 2,
        step: 0.05,
        label: 'churn speed',
      },
    },
  )

  const { headingStart, headingDuration, ease, headingStagger } = useDemoControls('Heading', {
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

  const { smearPx, marchSteps, smearAngle, gooey, fade } = useDemoControls('Smear (ray march)', {
    smearPx: { value: DEFAULTS.smearPx, min: 0, max: 400, step: 2, label: 'smear (px)' },
    marchSteps: { value: DEFAULTS.marchSteps, min: 8, max: 32, step: 1, label: 'gather taps' },
    smearAngle: { value: DEFAULTS.smearAngle, min: 0, max: 360, step: 5, label: 'angle' },
    gooey: { value: DEFAULTS.gooey, min: 0, max: 1, step: 0.05 },
    fade: { value: DEFAULTS.fade, min: 0, max: 1, step: 0.05 },
  })

  const { bodyStart, bodyDuration, bodyBlur, bodyRise } = useDemoControls('Body', {
    bodyStart: { value: DEFAULTS.bodyStart, min: 0, max: 4, step: 0.05, label: 'start (s)' },
    bodyDuration: {
      value: DEFAULTS.bodyDuration,
      min: 0.1,
      max: 3,
      step: 0.05,
      label: 'duration',
    },
    bodyBlur: { value: DEFAULTS.bodyBlur, min: 0, max: 40, step: 1, label: 'blur (px)' },
    bodyRise: { value: DEFAULTS.bodyRise, min: 0, max: 80, step: 1, label: 'rise (px)' },
  })

  const { retrigger, threshold } = useDemoControls('Trigger', {
    // Demo-curated: replays on every viewport entry (component default is once).
    retrigger: { value: true, label: 're-run on enter' },
    threshold: { value: DEFAULTS.threshold, min: 0, max: 1, step: 0.05, label: 'visible fraction' },
  })

  useDemoControls('Actions', { replay: button(() => setReplayKey((n) => n + 1)) })

  // Copy stays out: the consumer supplies its own eyebrow, heading and body.
  useDemoSnippet({
    retriggerOnEnter: retrigger,
    threshold,
    scrambleDuration,
    scrambleChars: charSet === 'custom' ? customChars : charSet,
    scrambleSpeed,
    scrambleOrder,
    headingStart,
    headingDuration,
    ease,
    headingStagger,
    smearPx,
    marchSteps,
    smearAngle,
    gooey,
    fade,
    bodyStart,
    bodyDuration,
    bodyBlur,
    bodyRise,
  })

  return (
    <div className="relative flex min-h-96 items-center overflow-hidden rounded-md bg-zinc-950 px-5 py-12 sm:min-h-105 sm:px-8 sm:py-16 md:px-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/2 h-[150%] w-2/3 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(234,179,8,0.22),transparent)] blur-2xl"
      />
      <TextLoadIn
        className="relative"
        eyebrow={eyebrow}
        heading={heading}
        body={body}
        replayKey={replayKey}
        retriggerOnEnter={retrigger}
        threshold={threshold}
        scrambleDuration={scrambleDuration}
        scrambleChars={charSet === 'custom' ? customChars : charSet}
        scrambleSpeed={scrambleSpeed}
        scrambleOrder={scrambleOrder}
        headingStart={headingStart}
        headingDuration={headingDuration}
        ease={ease}
        headingStagger={headingStagger}
        smearPx={smearPx}
        marchSteps={marchSteps}
        smearAngle={smearAngle}
        gooey={gooey}
        fade={fade}
        bodyStart={bodyStart}
        bodyDuration={bodyDuration}
        bodyBlur={bodyBlur}
        bodyRise={bodyRise}
      />
    </div>
  )
}

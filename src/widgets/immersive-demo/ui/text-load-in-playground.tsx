'use client'

import { button } from 'leva'
import { useState } from 'react'
import { TextLoadIn } from '@/features/immersive'
import { useDemoControls, useDemoSnippet } from './demo-section'

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
      scrambleDuration: { value: 1.1, min: 0.2, max: 4, step: 0.05, label: 'duration' },
      scrambleOrder: {
        value: 'leftToRight' as (typeof ORDERS)[number],
        options: [...ORDERS],
        label: 'order',
      },
      charSet: { value: 'upperCase', options: CHAR_SETS },
      customChars: {
        value: DEFAULT_CUSTOM_CHARS,
        render: (get) => get('Eyebrow.charSet') === 'custom',
      },
      scrambleSpeed: { value: 0.5, min: 0.05, max: 2, step: 0.05, label: 'churn speed' },
    },
  )

  const { headingStart, headingDuration, ease, headingStagger } = useDemoControls('Heading', {
    headingStart: { value: 0.25, min: 0, max: 3, step: 0.05, label: 'start (s)' },
    headingDuration: { value: 1.6, min: 0.3, max: 5, step: 0.05, label: 'duration' },
    ease: { value: 'power2.out', options: EASES },
    headingStagger: { value: 0.6, min: 0, max: 1, step: 0.05, label: 'char stagger' },
  })

  const { smearPx, marchSteps, smearAngle, gooey, fade } = useDemoControls('Smear (ray march)', {
    smearPx: { value: 170, min: 0, max: 400, step: 2, label: 'smear (px)' },
    marchSteps: { value: 24, min: 8, max: 32, step: 1, label: 'gather taps' },
    smearAngle: { value: 0, min: 0, max: 360, step: 5, label: 'angle' },
    gooey: { value: 0.5, min: 0, max: 1, step: 0.05 },
    fade: { value: 0.35, min: 0, max: 1, step: 0.05 },
  })

  const { bodyStart, bodyDuration, bodyBlur, bodyRise } = useDemoControls('Body', {
    bodyStart: { value: 0.9, min: 0, max: 4, step: 0.05, label: 'start (s)' },
    bodyDuration: { value: 1.1, min: 0.1, max: 3, step: 0.05, label: 'duration' },
    bodyBlur: { value: 14, min: 0, max: 40, step: 1, label: 'blur (px)' },
    bodyRise: { value: 14, min: 0, max: 80, step: 1, label: 'rise (px)' },
  })

  const { retrigger, threshold } = useDemoControls('Trigger', {
    retrigger: { value: true, label: 're-run on enter' },
    threshold: { value: 0.4, min: 0, max: 1, step: 0.05, label: 'visible fraction' },
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
    <div className="relative flex min-h-105 items-center overflow-hidden rounded-md bg-zinc-950 px-8 py-16 md:px-14">
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

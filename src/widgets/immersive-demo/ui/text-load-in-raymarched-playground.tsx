'use client'

import { button } from 'leva'
import { useState } from 'react'
import { TextLoadInRaymarched } from '@/features/immersive'
import { useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'

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

const ORDERS = ['leftToRight', 'random', 'simultaneous', 'center', 'edges', 'rightToLeft'] as const
const CHAR_SETS = ['upperCase', 'lowerCase', 'upperAndLowerCase', 'custom']
const DEFAULT_CUSTOM_CHARS = '!<>-_\\/[]{}—=+*^?#________'

/**
 * Demo content: TextLoadInRaymarched with every parameter wired to the
 * surrounding DemoSection's GUI — copy included. Demo-only — not shipped UI.
 */
export function TextLoadInRaymarchedPlayground() {
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

  const { headingStart, headingDuration, ease } = useDemoControls('Heading', {
    headingStart: { value: 0.2, min: 0, max: 3, step: 0.05, label: 'start (s)' },
    headingDuration: { value: 3.4, min: 0.5, max: 8, step: 0.05, label: 'duration' },
    ease: { value: 'power2.inOut', options: EASES },
  })

  const { marchSteps, depthPx, gooeyPx, edgePx, sweepAngle, lightAngle } = useDemoControls(
    'Raymarch (SDF)',
    {
      marchSteps: { value: 64, min: 16, max: 96, step: 1, label: 'march steps' },
      depthPx: { value: 22, min: 2, max: 80, step: 1, label: 'extrusion (px)' },
      gooeyPx: { value: 18, min: 1, max: 90, step: 1, label: 'smooth-min k' },
      edgePx: { value: 56, min: 10, max: 240, step: 2, label: 'front softness' },
      sweepAngle: { value: 0, min: 0, max: 360, step: 5, label: 'sweep angle' },
      lightAngle: { value: 125, min: 0, max: 360, step: 5, label: 'light angle' },
    },
  )

  const { dropletPx, dropletCount, dropletStretch, dropletScatter, wobblePx } = useDemoControls(
    'Droplets',
    {
      dropletPx: { value: 12, min: 0, max: 60, step: 1, label: 'size (px)' },
      dropletCount: { value: 5, min: 0, max: 8, step: 1, label: 'count' },
      dropletStretch: { value: 1, min: 0.3, max: 4, step: 0.05, label: 'stretch' },
      dropletScatter: { value: 0.5, min: 0, max: 1, step: 0.05, label: 'scatter' },
      wobblePx: { value: 10, min: 0, max: 60, step: 1, label: 'wobble (px)' },
    },
  )

  const { bodyStart, bodyDuration, bodyBlur, bodyRise } = useDemoControls('Body', {
    bodyStart: { value: 2.4, min: 0, max: 6, step: 0.05, label: 'start (s)' },
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
    marchSteps,
    depthPx,
    gooeyPx,
    edgePx,
    sweepAngle,
    dropletPx,
    dropletCount,
    dropletStretch,
    dropletScatter,
    wobblePx,
    lightAngle,
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
      <TextLoadInRaymarched
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
        marchSteps={marchSteps}
        depthPx={depthPx}
        gooeyPx={gooeyPx}
        edgePx={edgePx}
        sweepAngle={sweepAngle}
        dropletPx={dropletPx}
        dropletCount={dropletCount}
        dropletStretch={dropletStretch}
        dropletScatter={dropletScatter}
        wobblePx={wobblePx}
        lightAngle={lightAngle}
        bodyStart={bodyStart}
        bodyDuration={bodyDuration}
        bodyBlur={bodyBlur}
        bodyRise={bodyRise}
      />
    </div>
  )
}

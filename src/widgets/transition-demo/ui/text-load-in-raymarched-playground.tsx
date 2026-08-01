'use client'

import { useState } from 'react'
import {
  TEXT_LOAD_IN_RAYMARCHED_DEFAULTS as DEFAULTS,
  TextLoadInRaymarched,
} from '@/features/immersive'
import { useDemoAction, useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'

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

  const { offset, stagger } = useDemoControls('Timing', {
    offset: { value: DEFAULTS.offset, min: 0, max: 3, step: 0.05, label: 'offset (s)' },
    stagger: { value: DEFAULTS.stagger, min: 0, max: 3, step: 0.05, label: 'stagger (s)' },
  })

  const { headingDuration, ease } = useDemoControls('Heading', {
    headingDuration: {
      value: DEFAULTS.headingDuration,
      min: 0.5,
      max: 8,
      step: 0.05,
      label: 'duration',
    },
    ease: { value: DEFAULTS.ease, options: EASES },
  })

  const { marchSteps, gooeyPx, edgePx, sweepAngle, lightAngle } = useDemoControls(
    'Raymarch (SDF)',
    {
      marchSteps: { value: DEFAULTS.marchSteps, min: 16, max: 96, step: 1, label: 'march steps' },
      gooeyPx: { value: DEFAULTS.gooeyPx, min: 1, max: 90, step: 1, label: 'smooth-min k' },
      edgePx: { value: DEFAULTS.edgePx, min: 10, max: 240, step: 2, label: 'front softness' },
      sweepAngle: { value: DEFAULTS.sweepAngle, min: 0, max: 360, step: 5, label: 'sweep angle' },
      lightAngle: { value: DEFAULTS.lightAngle, min: 0, max: 360, step: 5, label: 'light angle' },
    },
  )

  const { dropletPx, dropletCount, dropletStretch, dropletScatter, wobblePx } = useDemoControls(
    'Droplets',
    {
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
    },
  )

  const { bodyDuration, bodyBlur, bodyRise } = useDemoControls('Body', {
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

  useDemoAction('replay', () => setReplayKey((n) => n + 1))

  // Copy stays out: the consumer supplies its own eyebrow, heading and body.
  useDemoSnippet({
    retriggerOnEnter: retrigger,
    threshold,
    scrambleDuration,
    scrambleChars: charSet === 'custom' ? customChars : charSet,
    scrambleSpeed,
    scrambleOrder,
    offset,
    stagger,
    headingDuration,
    ease,
    marchSteps,
    gooeyPx,
    edgePx,
    sweepAngle,
    dropletPx,
    dropletCount,
    dropletStretch,
    dropletScatter,
    wobblePx,
    lightAngle,
    bodyDuration,
    bodyBlur,
    bodyRise,
  })

  return (
    <div className="relative flex min-h-96 items-center overflow-hidden rounded-md bg-background px-5 py-12 sm:min-h-105 sm:px-8 sm:py-16 md:px-14">
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
        offset={offset}
        stagger={stagger}
        headingDuration={headingDuration}
        ease={ease}
        marchSteps={marchSteps}
        gooeyPx={gooeyPx}
        edgePx={edgePx}
        sweepAngle={sweepAngle}
        dropletPx={dropletPx}
        dropletCount={dropletCount}
        dropletStretch={dropletStretch}
        dropletScatter={dropletScatter}
        wobblePx={wobblePx}
        lightAngle={lightAngle}
        bodyDuration={bodyDuration}
        bodyBlur={bodyBlur}
        bodyRise={bodyRise}
      />
    </div>
  )
}

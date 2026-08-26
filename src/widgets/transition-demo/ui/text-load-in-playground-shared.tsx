'use client'

import type { Schema } from 'leva/dist/declarations/src/types'
import type { ReactNode } from 'react'
import { useDemoControls } from '@/shared/ui/demo-kit'
import { cn } from '@/utilities/ui'

/**
 * Control groups and stage chrome shared by the two TextLoadIn playgrounds.
 * Both variants expose the same copy, eyebrow-scramble, body and trigger
 * knobs; only the heading section differs. Demo-only — not shipped UI.
 */

const ORDERS = ['leftToRight', 'random', 'simultaneous', 'center', 'edges', 'rightToLeft'] as const
const CHAR_SETS = ['upperCase', 'lowerCase', 'upperAndLowerCase', 'custom']
const DEFAULT_CUSTOM_CHARS = '!<>-_\\/[]{}—=+*^?#________'

/** Tunables both variants share, as read off a variant's `*_DEFAULTS`. */
type SharedDefaults = {
  bodyBlur: number
  bodyDuration: number
  bodyRise: number
  scrambleChars: string
  scrambleDuration: number
  scrambleOrder: string
  scrambleSpeed: number
  threshold: number
}

/** Headline copy the demo renders; kept out of the emitted snippet. */
export function useDemoCopyControls() {
  return useDemoControls('Content', {
    eyebrow: { value: 'OUR PERFORMANCE' },
    heading: { value: 'Performance Proven at Scale' },
    body: {
      value:
        'Built for environments where uptime is non-negotiable, our technology delivers measurable reliability.',
    },
  })
}

/** Eyebrow scramble knobs, with the custom glyph pool folded into `scrambleChars`. */
export function useEyebrowControls(defaults: SharedDefaults) {
  const { scrambleDuration, scrambleOrder, charSet, customChars, scrambleSpeed } = useDemoControls(
    'Eyebrow',
    {
      scrambleDuration: {
        value: defaults.scrambleDuration,
        min: 0.2,
        max: 4,
        step: 0.05,
        label: 'duration',
      },
      scrambleOrder: {
        value: defaults.scrambleOrder as (typeof ORDERS)[number],
        options: [...ORDERS],
        label: 'order',
      },
      charSet: { value: defaults.scrambleChars, options: CHAR_SETS },
      customChars: {
        value: DEFAULT_CUSTOM_CHARS,
        render: (get) => get('Eyebrow.charSet') === 'custom',
      },
      scrambleSpeed: {
        value: defaults.scrambleSpeed,
        min: 0.05,
        max: 2,
        step: 0.05,
        label: 'churn speed',
      },
    },
  )

  return {
    scrambleDuration,
    scrambleChars: charSet === 'custom' ? customChars : charSet,
    scrambleSpeed,
    scrambleOrder,
  }
}

/**
 * Supporting-copy reveal knobs. `extra` is prepended so a variant can add its
 * own knob (e.g. an explicit body start) at the top of the same Body folder.
 */
export function useBodyControls<E extends Schema>(defaults: SharedDefaults, extra?: E) {
  return useDemoControls('Body', {
    ...((extra ?? {}) as E),
    bodyDuration: {
      value: defaults.bodyDuration,
      min: 0.1,
      max: 3,
      step: 0.05,
      label: 'duration',
    },
    bodyBlur: { value: defaults.bodyBlur, min: 0, max: 40, step: 1, label: 'blur (px)' },
    bodyRise: { value: defaults.bodyRise, min: 0, max: 80, step: 1, label: 'rise (px)' },
  })
}

/** Viewport-trigger knobs, mapped onto the component's prop names. */
export function useTriggerControls(defaults: SharedDefaults) {
  const { retrigger, threshold } = useDemoControls('Trigger', {
    // Demo-curated: replays on every viewport entry (component default is once).
    retrigger: { value: true, label: 're-run on enter' },
    threshold: {
      value: defaults.threshold,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'visible fraction',
    },
  })

  return { retriggerOnEnter: retrigger, threshold }
}

/** Padded panel with the off-canvas warm glow both playgrounds sit on. */
export function TextLoadInDemoStage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-96 items-center overflow-hidden rounded-md px-5 py-12 sm:min-h-105 sm:px-8 sm:py-16 md:px-14',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/2 h-[150%] w-2/3 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(234,179,8,0.22),transparent)] blur-2xl"
      />
      {children}
    </div>
  )
}

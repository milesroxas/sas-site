'use client'

import { useState } from 'react'
import { useDemoAction, useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'
import {
  ScrollReveal,
  SCROLL_REVEAL_TEXT_DEFAULTS as TEXT,
  SCROLL_REVEAL_TRIGGER_DEFAULTS as TRIGGER,
} from '@/shared/ui/scroll-reveal'
import { useEaseControl } from './use-ease-control'

/**
 * Demo content: the production `data-reveal` text entrance with every value
 * wired to the surrounding DemoSection's GUI — copy included. Demo-only.
 */
export function ScrollRevealTextPlayground() {
  const [replayKey, setReplayKey] = useState(0)

  const { eyebrow, heading, body } = useDemoControls('Content', {
    eyebrow: { value: 'CASE STUDY' },
    heading: { value: 'A standard entrance for every block' },
    body: {
      value:
        'Each element marked data-reveal drops into place in document order — the same motion on every section keeps the whole site feeling like one system.',
    },
  })

  const { textY, textBlurPx, textDuration, stagger } = useDemoControls('Motion', {
    textY: { value: TEXT.textY, min: 0, max: 120, step: 1, label: 'drop (px)' },
    textBlurPx: { value: TEXT.textBlurPx, min: 0, max: 24, step: 1, label: 'blur (px)' },
    textDuration: { value: TEXT.textDuration, min: 0.2, max: 3, step: 0.05, label: 'duration' },
    stagger: { value: TEXT.stagger, min: 0, max: 0.5, step: 0.01, label: 'stagger (s)' },
  })
  const textEase = useEaseControl('Motion', TEXT.textEase)

  const { enterThreshold, exitTimeScale } = useDemoControls('Trigger', {
    enterThreshold: {
      value: TRIGGER.enterThreshold,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'visible fraction',
    },
    exitTimeScale: {
      value: TRIGGER.exitTimeScale,
      min: 1,
      max: 4,
      step: 0.1,
      label: 'exit speed ×',
    },
  })

  useDemoAction('replay', () => setReplayKey((n) => n + 1))

  // Copy writes the text const only; the trigger gate has its own const in the
  // same file (SCROLL_REVEAL_TRIGGER_DEFAULTS) — transcribe it if you tune it.
  useDemoSnippet({ textY, textBlurPx, textDuration, textEase, stagger })

  return (
    <ScrollReveal
      as="div"
      className="relative flex min-h-96 items-center overflow-hidden rounded-md bg-background px-5 py-12 sm:px-8 sm:py-16 md:px-14"
      replayKey={replayKey}
      textY={textY}
      textBlurPx={textBlurPx}
      textDuration={textDuration}
      textEase={textEase}
      stagger={stagger}
      enterThreshold={enterThreshold}
      exitTimeScale={exitTimeScale}
    >
      <div className="max-w-xl space-y-4">
        <p
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          data-reveal
        >
          {eyebrow}
        </p>
        <h3 className="text-balance text-2xl font-normal sm:text-4xl" data-reveal>
          {heading}
        </h3>
        <p
          className="text-pretty text-sm/relaxed text-muted-foreground sm:text-base/relaxed"
          data-reveal
        >
          {body}
        </p>
        <p className="font-mono text-xs text-muted-foreground" data-reveal>
          04 — each target joins the same timeline, offset by the stagger
        </p>
      </div>
    </ScrollReveal>
  )
}

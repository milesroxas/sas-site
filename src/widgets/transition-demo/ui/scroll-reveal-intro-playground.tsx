'use client'

import { useState } from 'react'
import { useDemoAction, useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'
import {
  SCROLL_REVEAL_INTRO as INTRO,
  ScrollReveal,
  SCROLL_REVEAL_TRIGGER_DEFAULTS as TRIGGER,
} from '@/shared/ui/scroll-reveal'
import { revealTrackBars, TrackDiagram } from './reveal-track-diagram'
import { useEaseControl } from './use-ease-control'

/** Diagram labels mirror the preview markup so it plots the real target list. */
const TEXT_LABELS = ['eyebrow', 'heading', 'body', 'footnote']

/**
 * Demo content: the complete intro reveal — the entrance for introduction and
 * text-only blocks — with every one of its values wired to the surrounding
 * DemoSection's GUI. Copy replaces the whole const. Demo-only.
 */
export function ScrollRevealIntroPlayground() {
  const [replayKey, setReplayKey] = useState(0)

  const { eyebrow, heading, body } = useDemoControls('Content', {
    eyebrow: { value: 'INTRODUCTION' },
    heading: { value: 'Text-only blocks carry the moment alone' },
    body: {
      value:
        'With no media to sync against, the stagger is the whole rhythm — widen it and each line becomes its own beat, tighten it and the block arrives as one thought.',
    },
  })

  const { textY, textBlurPx, textDuration, stagger } = useDemoControls('Motion', {
    textY: { value: INTRO.textY, min: 0, max: 120, step: 1, label: 'drop (px)' },
    textBlurPx: { value: INTRO.textBlurPx, min: 0, max: 24, step: 1, label: 'blur (px)' },
    textDuration: { value: INTRO.textDuration, min: 0.2, max: 3, step: 0.05, label: 'duration' },
    stagger: { value: INTRO.stagger, min: 0, max: 0.5, step: 0.01, label: 'stagger (s)' },
  })
  const textEase = useEaseControl('Motion', INTRO.textEase)

  const { enterThreshold } = useDemoControls('Trigger', {
    enterThreshold: {
      value: TRIGGER.enterThreshold,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'visible fraction',
    },
  })

  useDemoAction('replay', () => setReplayKey((n) => n + 1))

  // Copy replaces SCROLL_REVEAL_INTRO wholesale; the trigger gate has its own
  // const in the same file (SCROLL_REVEAL_TRIGGER_DEFAULTS) — transcribe it if
  // you tune it.
  useDemoSnippet({ textY, textBlurPx, textDuration, textEase, stagger })

  return (
    <>
      <ScrollReveal
        as="div"
        className="relative flex min-h-96 items-center overflow-hidden rounded-md bg-background px-5 py-12 sm:px-8 sm:py-16 md:px-14"
        enterThreshold={enterThreshold}
        replayKey={replayKey}
        stagger={stagger}
        textBlurPx={textBlurPx}
        textDuration={textDuration}
        textEase={textEase}
        textY={textY}
        variant="intro"
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
            variant=&quot;intro&quot; — each target joins the same timeline, offset by the stagger
          </p>
        </div>
      </ScrollReveal>
      <TrackDiagram bars={revealTrackBars({ textLabels: TEXT_LABELS, stagger, textDuration })} />
    </>
  )
}

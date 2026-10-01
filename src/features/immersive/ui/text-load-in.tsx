'use client'

import { useGSAP } from '@gsap/react'
import cn from 'clsx'
import { resolveTuning } from '../resolve-tuning'
import { RAY_MARCHED_HEADING_DEFAULTS, RayMarchedHeading } from './ray-marched-heading'
import {
  buildTextLoadInTimeline,
  TEXT_LOAD_IN_SHARED_DEFAULTS,
  TextLoadInEyebrow,
  type TextLoadInSharedProps,
  useTextLoadInStage,
} from './text-load-in-internals'

export type TextLoadInProps = TextLoadInSharedProps & {
  /** Timeline position (s) where the heading reveal begins. */
  headingStart?: number
  /** 0 = all characters together, → 1 = fully sequential reveal. */
  headingStagger?: number
  /** Max smear distance in CSS px while a character is unresolved. */
  smearPx?: number
  /** Ray-march sample count along the smear direction. */
  marchSteps?: number
  /** Smear direction in degrees (0 = horizontal). */
  smearAngle?: number
  /** 0–1: soft-threshold strength melting adjacent characters together. */
  gooey?: number
  /** 0–1: how much unresolved characters are faded down. */
  fade?: number
  /** Timeline position (s) where the body begins. */
  bodyStart?: number
}

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site or via a
 * named preset (see `../presets.ts`).
 */
export const TEXT_LOAD_IN_DEFAULTS = {
  ...TEXT_LOAD_IN_SHARED_DEFAULTS,
  headingStart: 0.25,
  headingDuration: 1.6,
  ease: 'power2.out',
  headingStagger: RAY_MARCHED_HEADING_DEFAULTS.stagger,
  smearPx: RAY_MARCHED_HEADING_DEFAULTS.smearPx,
  marchSteps: RAY_MARCHED_HEADING_DEFAULTS.steps,
  smearAngle: RAY_MARCHED_HEADING_DEFAULTS.angle,
  gooey: RAY_MARCHED_HEADING_DEFAULTS.gooey,
  fade: RAY_MARCHED_HEADING_DEFAULTS.fade,
  bodyStart: 0.9,
} as const satisfies Partial<TextLoadInProps>

/**
 * Every knob with its default filled in — what the timeline actually reads,
 * once `resolveTuning` has folded the caller's deltas into the table above.
 */
type TextLoadInTuning = Required<Pick<TextLoadInProps, keyof typeof TEXT_LOAD_IN_DEFAULTS>>

/**
 * Scroll-triggered copy reveal modeled on the reference capture: an eyebrow
 * label scrambles into place while the headline resolves through a
 * ray-marched smear shader that blends characters into each other as they
 * appear, then the supporting line follows, dimmer. Each beat is placed
 * explicitly (`headingStart`, `bodyStart`). Plays when the block enters the
 * viewport; `replayKey` re-runs it on demand. Renders the final state
 * statically under prefers-reduced-motion.
 *
 * Ink comes from the ground's palette tokens, but the smear overlay paints a
 * fixed near-white (ray-marched-heading.tsx), so give it a dark ground: a
 * `data-theme="dark"` scope, as the playground stage does.
 */
export function TextLoadIn({
  eyebrow,
  heading,
  body,
  replayKey = 0,
  className,
  ...deltas
}: TextLoadInProps) {
  const {
    retriggerOnEnter,
    threshold,
    scrambleDuration,
    scrambleChars,
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
  } = resolveTuning<TextLoadInTuning>(TEXT_LOAD_IN_DEFAULTS, deltas)
  const stage = useTextLoadInStage({ replayKey, retriggerOnEnter, threshold })

  useGSAP(
    () => {
      buildTextLoadInTimeline({
        beats: { eyebrowStart: 0, headingStart, bodyStart },
        bodyBlur,
        bodyDuration,
        bodyRise,
        ease,
        eyebrow,
        headingDuration,
        scrambleChars,
        scrambleDuration,
        scrambleOrder,
        scrambleSpeed,
        stage,
      })
    },
    {
      scope: stage.rootRef,
      dependencies: [
        stage.play,
        eyebrow,
        heading,
        body,
        scrambleDuration,
        scrambleChars,
        scrambleSpeed,
        scrambleOrder,
        headingStart,
        headingDuration,
        ease,
        bodyStart,
        bodyDuration,
        bodyBlur,
        bodyRise,
        stage.prefersReducedMotion,
      ],
      revertOnUpdate: true,
    },
  )

  return (
    <div ref={stage.rootRef} className={cn('space-y-5', className)}>
      <TextLoadInEyebrow
        className="flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        eyebrow={eyebrow}
        eyebrowRef={stage.eyebrowRef}
      />
      <div className="space-y-1 text-heading-2">
        <RayMarchedHeading
          text={heading}
          progressRef={stage.glProgress}
          stagger={headingStagger}
          smearPx={smearPx}
          steps={marchSteps}
          angle={smearAngle}
          gooey={gooey}
          fade={fade}
          className="max-w-[24ch] text-foreground"
        />
        <p
          data-body
          className="max-w-[34ch] text-muted-foreground will-change-[opacity,transform,filter]"
        >
          {body}
        </p>
      </div>
    </div>
  )
}

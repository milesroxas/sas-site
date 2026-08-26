'use client'

import { useGSAP } from '@gsap/react'
import cn from 'clsx'
import { resolveTuning } from '../resolve-tuning'
import { RAYMARCHED_SDF_HEADING_DEFAULTS, RaymarchedSdfHeading } from './raymarched-sdf-heading'
import {
  buildTextLoadInTimeline,
  TEXT_LOAD_IN_SHARED_DEFAULTS,
  TextLoadInEyebrow,
  type TextLoadInSharedProps,
  useTextLoadInStage,
} from './text-load-in-internals'

export type TextLoadInRaymarchedProps = TextLoadInSharedProps & {
  /** Seconds before the whole sequence starts. */
  offset?: number
  /** Seconds between element starts: eyebrow, then heading, then body. */
  stagger?: number
  /** Ray-march step budget (16–96). */
  marchSteps?: number
  /** smooth-min blend radius in px melting droplets into glyphs. */
  gooeyPx?: number
  /** Softness in px of the sweeping reveal front. */
  edgePx?: number
  /** Sweep direction in degrees (0 = left → right). */
  sweepAngle?: number
  /** Metaball droplet base radius in px (0 disables droplets). */
  dropletPx?: number
  /** Number of droplets riding the front (0–8; 0 disables). */
  dropletCount?: number
  /** Droplet elongation along the sweep (1 = sphere, >1 = teardrop streak). */
  dropletStretch?: number
  /** Side scatter of droplets, as a fraction of the heading height (0–1). */
  dropletScatter?: number
  /** Droplet wander amplitude in px. */
  wobblePx?: number
  /** Key light direction in degrees around the text plane. */
  lightAngle?: number
}

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site or via a
 * named preset (see `../presets.ts`).
 */
export const TEXT_LOAD_IN_RAYMARCHED_DEFAULTS = {
  ...TEXT_LOAD_IN_SHARED_DEFAULTS,
  offset: 0,
  stagger: 1.1,
  headingDuration: 3.4,
  ease: 'power2.inOut',
  marchSteps: RAYMARCHED_SDF_HEADING_DEFAULTS.steps,
  gooeyPx: RAYMARCHED_SDF_HEADING_DEFAULTS.gooeyPx,
  edgePx: RAYMARCHED_SDF_HEADING_DEFAULTS.edgePx,
  sweepAngle: RAYMARCHED_SDF_HEADING_DEFAULTS.angle,
  dropletPx: RAYMARCHED_SDF_HEADING_DEFAULTS.dropletPx,
  dropletCount: RAYMARCHED_SDF_HEADING_DEFAULTS.dropletCount,
  dropletStretch: RAYMARCHED_SDF_HEADING_DEFAULTS.dropletStretch,
  dropletScatter: RAYMARCHED_SDF_HEADING_DEFAULTS.dropletScatter,
  wobblePx: RAYMARCHED_SDF_HEADING_DEFAULTS.wobblePx,
  lightAngle: RAYMARCHED_SDF_HEADING_DEFAULTS.lightAngle,
} as const satisfies Partial<TextLoadInRaymarchedProps>

/**
 * Every knob with its default filled in — what the timeline actually reads,
 * once `resolveTuning` has folded the caller's deltas into the table above.
 */
type TextLoadInRaymarchedTuning = Required<
  Pick<TextLoadInRaymarchedProps, keyof typeof TEXT_LOAD_IN_RAYMARCHED_DEFAULTS>
>

/** The body always eases out, whatever ease shapes the heading sweep. */
const BODY_EASE = 'power2.out'

/**
 * Improved take on TextLoadIn built on genuine raymarching (see
 * RaymarchedSdfHeading): the eyebrow scrambles into place while the headline
 * — a real signed-distance field — is swept into existence by a smooth-min
 * goo front with metaball droplets and SDF-gradient lighting, then the
 * supporting line follows, dimmer. Sequencing is a single global stagger:
 * the eyebrow starts at `offset`, the heading at `offset + stagger`, the
 * body at `offset + stagger * 2`. Plays when the block enters the viewport;
 * `replayKey` re-runs it on demand. Renders the final state statically under
 * prefers-reduced-motion.
 */
export function TextLoadInRaymarched({
  eyebrow,
  heading,
  body,
  replayKey = 0,
  className,
  ...deltas
}: TextLoadInRaymarchedProps) {
  const {
    retriggerOnEnter,
    threshold,
    scrambleDuration,
    scrambleChars,
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
  } = resolveTuning<TextLoadInRaymarchedTuning>(TEXT_LOAD_IN_RAYMARCHED_DEFAULTS, deltas)
  const stage = useTextLoadInStage({ replayKey, retriggerOnEnter, threshold })

  useGSAP(
    () => {
      buildTextLoadInTimeline({
        // One global rhythm: each element starts one `stagger` after the last.
        beats: {
          eyebrowStart: offset,
          headingStart: offset + stagger,
          bodyStart: offset + stagger * 2,
        },
        bodyBlur,
        bodyDuration,
        bodyEase: BODY_EASE,
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
        offset,
        stagger,
        headingDuration,
        ease,
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
      <div className="space-y-1">
        <RaymarchedSdfHeading
          text={heading}
          progressRef={stage.glProgress}
          steps={marchSteps}
          gooeyPx={gooeyPx}
          edgePx={edgePx}
          angle={sweepAngle}
          dropletPx={dropletPx}
          dropletCount={dropletCount}
          dropletStretch={dropletStretch}
          dropletScatter={dropletScatter}
          wobblePx={wobblePx}
          lightAngle={lightAngle}
          className="max-w-[24ch] text-heading-2 text-foreground"
        />
        <p
          data-body
          className="max-w-[34ch] text-base font-normal text-muted-foreground will-change-[opacity,transform,filter]"
        >
          {body}
        </p>
      </div>
    </div>
  )
}

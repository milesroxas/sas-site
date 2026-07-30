'use client'

import { useGSAP } from '@gsap/react'
import cn from 'clsx'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  CHAR_PRESETS,
  createScrambleTween,
  type ScrambleOrder,
  type ScrambleTweenOptions,
} from '@/shared/ui/scramble-text'
import { RAYMARCHED_SDF_HEADING_DEFAULTS, RaymarchedSdfHeading } from './raymarched-sdf-heading'

gsap.registerPlugin(useGSAP)

export type TextLoadInRaymarchedProps = {
  /** Mono label that decodes into place after the static dot marker. */
  eyebrow: string
  /** Headline revealed through the raymarched SDF goo sweep. */
  heading: string
  /** Supporting copy that follows the headline. */
  body: string
  /** Bump to replay the sequence (e.g. from a GUI button). */
  replayKey?: number
  /** Replay every time the block re-enters the viewport, not just the first. */
  retriggerOnEnter?: boolean
  /** Fraction of the block that must be visible to trigger (0–1). */
  threshold?: number
  /** Seconds the eyebrow spends decoding. */
  scrambleDuration?: number
  /** CHAR_PRESETS key ("upperCase" etc.) or a custom glyph string. */
  scrambleChars?: string
  /** How frequently scrambled glyphs refresh (0.05–2, higher = faster). */
  scrambleSpeed?: number
  /** Order in which eyebrow characters lock in. */
  scrambleOrder?: ScrambleOrder
  /** Seconds before the whole sequence starts. */
  offset?: number
  /** Seconds between element starts: eyebrow, then heading, then body. */
  stagger?: number
  /** Seconds the heading takes to fully resolve. */
  headingDuration?: number
  /** GSAP ease shaping the heading reveal progress. */
  ease?: string
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
  /** Seconds the body takes to sharpen. */
  bodyDuration?: number
  /** Starting blur in px for the body. */
  bodyBlur?: number
  /** Starting downward offset in px for the body. */
  bodyRise?: number
  className?: string
}

/**
 * Single source of truth for this effect's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site or via a
 * named preset (see `../presets.ts`).
 */
export const TEXT_LOAD_IN_RAYMARCHED_DEFAULTS = {
  retriggerOnEnter: false,
  threshold: 0.4,
  scrambleDuration: 1.1,
  scrambleChars: 'upperCase',
  scrambleSpeed: 0.5,
  scrambleOrder: 'leftToRight',
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
  bodyDuration: 1.1,
  bodyBlur: 14,
  bodyRise: 14,
} as const satisfies Partial<TextLoadInRaymarchedProps>

/** Seconds over which the GL heading crossfades to the crisp DOM heading. */
const SWAP_DURATION = 0.18

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
  retriggerOnEnter = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.retriggerOnEnter,
  threshold = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.threshold,
  scrambleDuration = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.scrambleDuration,
  scrambleChars = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.scrambleChars,
  scrambleSpeed = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.scrambleSpeed,
  scrambleOrder = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.scrambleOrder,
  offset = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.offset,
  stagger = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.stagger,
  headingDuration = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.headingDuration,
  ease = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.ease,
  marchSteps = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.marchSteps,
  gooeyPx = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.gooeyPx,
  edgePx = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.edgePx,
  sweepAngle = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.sweepAngle,
  dropletPx = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.dropletPx,
  dropletCount = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.dropletCount,
  dropletStretch = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.dropletStretch,
  dropletScatter = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.dropletScatter,
  wobblePx = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.wobblePx,
  lightAngle = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.lightAngle,
  bodyDuration = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.bodyDuration,
  bodyBlur = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.bodyBlur,
  bodyRise = TEXT_LOAD_IN_RAYMARCHED_DEFAULTS.bodyRise,
  className,
}: TextLoadInRaymarchedProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const notifyRef = useRef<((scrambling: boolean) => void) | undefined>(undefined)
  const glProgress = useRef({ value: 0 })
  const prefersReducedMotion = usePrefersReducedMotion()

  const [entered, setEntered] = useState(0)
  const enteredOnce = useRef(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        if (!retriggerOnEnter && enteredOnce.current) return
        enteredOnce.current = true
        setEntered((n) => n + 1)
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [retriggerOnEnter, threshold])

  const play = entered + replayKey

  useGSAP(
    () => {
      const eyebrowEl = eyebrowRef.current
      if (!eyebrowEl) return

      if (prefersReducedMotion) {
        eyebrowEl.textContent = eyebrow
        glProgress.current.value = 0
        gsap.set('[data-heading-final]', { autoAlpha: 1 })
        gsap.set('[data-heading-gl]', { autoAlpha: 0 })
        gsap.set('[data-body]', { opacity: 1, y: 0, filter: 'blur(0px)' })
        return
      }

      if (play === 0) {
        eyebrowEl.textContent = ''
        glProgress.current.value = 0
        gsap.set('[data-heading-final]', { autoAlpha: 0 })
        gsap.set('[data-heading-gl]', { autoAlpha: 0 })
        gsap.set('[data-body]', { opacity: 0 })
        return
      }

      const scrambleOptions: ScrambleTweenOptions = {
        duration: scrambleDuration,
        ease: 'none',
        charPool: CHAR_PRESETS[scrambleChars] ?? scrambleChars,
        speed: scrambleSpeed,
        revealDelay: 0,
        tweenLength: false,
        order: scrambleOrder,
        notify: notifyRef,
      }

      // The raymarched overlay carries the whole reveal, then hands off to
      // the crisp DOM heading once fully resolved.
      glProgress.current.value = 0
      gsap.set('[data-heading-final]', { autoAlpha: 0 })
      gsap.set('[data-heading-gl]', { autoAlpha: 1 })

      // One global rhythm: each element starts one `stagger` after the last.
      const headingStart = offset + stagger
      const bodyStart = offset + stagger * 2

      const tl = gsap.timeline()
      tl.add(createScrambleTween(eyebrowEl, '', eyebrow, scrambleOptions), offset)
      tl.to(glProgress.current, { value: 1, duration: headingDuration, ease }, headingStart)
      tl.to(
        '[data-heading-final]',
        { autoAlpha: 1, duration: SWAP_DURATION, ease: 'none' },
        headingStart + headingDuration,
      )
      tl.to('[data-heading-gl]', { autoAlpha: 0, duration: SWAP_DURATION, ease: 'none' }, '<')
      tl.fromTo(
        '[data-body]',
        { opacity: 0, y: bodyRise, filter: `blur(${bodyBlur}px)` },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: bodyDuration, ease: 'power2.out' },
        bodyStart,
      )
    },
    {
      scope: rootRef,
      dependencies: [
        play,
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
        prefersReducedMotion,
      ],
      revertOnUpdate: true,
    },
  )

  return (
    <div ref={rootRef} className={cn('space-y-5', className)}>
      <p className="flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <span aria-hidden className="text-[7px] leading-none">
          ●
        </span>
        <span ref={eyebrowRef} aria-hidden className="inline-block min-h-[1em] whitespace-pre" />
        <span className="sr-only">{eyebrow}</span>
      </p>
      <div className="space-y-1">
        <RaymarchedSdfHeading
          text={heading}
          progressRef={glProgress}
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
          className="max-w-[24ch] text-4xl font-normal leading-tight tracking-tight text-foreground"
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

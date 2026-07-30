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
import { RAY_MARCHED_HEADING_DEFAULTS, RayMarchedHeading } from './ray-marched-heading'

gsap.registerPlugin(useGSAP)

export type TextLoadInProps = {
  /** Mono label that decodes into place after the static dot marker. */
  eyebrow: string
  /** Headline revealed through the ray-marched character smear. */
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
  /** Timeline position (s) where the heading reveal begins. */
  headingStart?: number
  /** Seconds the heading takes to fully resolve. */
  headingDuration?: number
  /** GSAP ease shaping the heading reveal progress. */
  ease?: string
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
export const TEXT_LOAD_IN_DEFAULTS = {
  retriggerOnEnter: false,
  threshold: 0.4,
  scrambleDuration: 1.1,
  scrambleChars: 'upperCase',
  scrambleSpeed: 0.5,
  scrambleOrder: 'leftToRight',
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
  bodyDuration: 1.1,
  bodyBlur: 14,
  bodyRise: 14,
} as const satisfies Partial<TextLoadInProps>

/** Seconds over which the GL heading crossfades to the crisp DOM heading. */
const SWAP_DURATION = 0.18

/**
 * Scroll-triggered copy reveal modeled on the reference capture: an eyebrow
 * label scrambles into place while the headline resolves through a
 * ray-marched smear shader that blends characters into each other as they
 * appear, then the supporting line follows, dimmer. Plays when the block
 * enters the viewport; `replayKey` re-runs it on demand. Renders the final
 * state statically under prefers-reduced-motion.
 */
export function TextLoadIn({
  eyebrow,
  heading,
  body,
  replayKey = 0,
  retriggerOnEnter = TEXT_LOAD_IN_DEFAULTS.retriggerOnEnter,
  threshold = TEXT_LOAD_IN_DEFAULTS.threshold,
  scrambleDuration = TEXT_LOAD_IN_DEFAULTS.scrambleDuration,
  scrambleChars = TEXT_LOAD_IN_DEFAULTS.scrambleChars,
  scrambleSpeed = TEXT_LOAD_IN_DEFAULTS.scrambleSpeed,
  scrambleOrder = TEXT_LOAD_IN_DEFAULTS.scrambleOrder,
  headingStart = TEXT_LOAD_IN_DEFAULTS.headingStart,
  headingDuration = TEXT_LOAD_IN_DEFAULTS.headingDuration,
  ease = TEXT_LOAD_IN_DEFAULTS.ease,
  headingStagger = TEXT_LOAD_IN_DEFAULTS.headingStagger,
  smearPx = TEXT_LOAD_IN_DEFAULTS.smearPx,
  marchSteps = TEXT_LOAD_IN_DEFAULTS.marchSteps,
  smearAngle = TEXT_LOAD_IN_DEFAULTS.smearAngle,
  gooey = TEXT_LOAD_IN_DEFAULTS.gooey,
  fade = TEXT_LOAD_IN_DEFAULTS.fade,
  bodyStart = TEXT_LOAD_IN_DEFAULTS.bodyStart,
  bodyDuration = TEXT_LOAD_IN_DEFAULTS.bodyDuration,
  bodyBlur = TEXT_LOAD_IN_DEFAULTS.bodyBlur,
  bodyRise = TEXT_LOAD_IN_DEFAULTS.bodyRise,
  className,
}: TextLoadInProps) {
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
        // Full-length churn from the first frame, like the reference capture.
        tweenLength: false,
        order: scrambleOrder,
        notify: notifyRef,
      }

      // The GL overlay carries the whole reveal, then hands off to the crisp
      // DOM heading once fully resolved.
      glProgress.current.value = 0
      gsap.set('[data-heading-final]', { autoAlpha: 0 })
      gsap.set('[data-heading-gl]', { autoAlpha: 1 })

      const tl = gsap.timeline()
      tl.add(createScrambleTween(eyebrowEl, '', eyebrow, scrambleOptions), 0)
      tl.to(glProgress.current, { value: 1, duration: headingDuration, ease }, headingStart)
      // Hand off to the crisp, selectable DOM heading once fully resolved.
      tl.to(
        '[data-heading-final]',
        { autoAlpha: 1, duration: SWAP_DURATION, ease: 'none' },
        headingStart + headingDuration,
      )
      tl.to('[data-heading-gl]', { autoAlpha: 0, duration: SWAP_DURATION, ease: 'none' }, '<')
      tl.fromTo(
        '[data-body]',
        { opacity: 0, y: bodyRise, filter: `blur(${bodyBlur}px)` },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: bodyDuration, ease },
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
        headingStart,
        headingDuration,
        ease,
        bodyStart,
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
      <p className="flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">
        <span aria-hidden className="text-[7px] leading-none">
          ●
        </span>
        <span ref={eyebrowRef} aria-hidden className="inline-block min-h-[1em] whitespace-pre" />
        <span className="sr-only">{eyebrow}</span>
      </p>
      <div className="space-y-1 text-3xl font-medium leading-tight tracking-tight md:text-4xl">
        <RayMarchedHeading
          text={heading}
          progressRef={glProgress}
          stagger={headingStagger}
          smearPx={smearPx}
          steps={marchSteps}
          angle={smearAngle}
          gooey={gooey}
          fade={fade}
          className="max-w-[24ch] text-zinc-100"
        />
        <p data-body className="max-w-[34ch] text-zinc-500 will-change-[opacity,transform,filter]">
          {body}
        </p>
      </div>
    </div>
  )
}

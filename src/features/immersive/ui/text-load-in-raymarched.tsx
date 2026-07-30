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
import { RaymarchedSdfHeading } from './raymarched-sdf-heading'

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
  /** Timeline position (s) where the heading reveal begins. */
  headingStart?: number
  /** Seconds the heading takes to fully resolve. */
  headingDuration?: number
  /** GSAP ease shaping the heading reveal progress. */
  ease?: string
  /** Ray-march step budget (16–96). */
  marchSteps?: number
  /** Extrusion half-depth in px — how "thick" the 3D glyphs are. */
  depthPx?: number
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

/** Seconds over which the GL heading crossfades to the crisp DOM heading. */
const SWAP_DURATION = 0.18

/**
 * Improved take on TextLoadIn built on genuine raymarching (see
 * RaymarchedSdfHeading): the eyebrow scrambles into place while the headline
 * — a real extruded signed-distance field — is swept into existence by a
 * smooth-min goo front with metaball droplets and SDF-gradient lighting,
 * then the supporting line follows, dimmer. Plays when the block enters the
 * viewport; `replayKey` re-runs it on demand. Renders the final state
 * statically under prefers-reduced-motion.
 */
export function TextLoadInRaymarched({
  eyebrow,
  heading,
  body,
  replayKey = 0,
  retriggerOnEnter = false,
  threshold = 0.4,
  scrambleDuration = 1.1,
  scrambleChars = 'upperCase',
  scrambleSpeed = 0.5,
  scrambleOrder = 'leftToRight',
  headingStart = 0.2,
  headingDuration = 3.4,
  ease = 'power2.inOut',
  marchSteps = 64,
  depthPx = 22,
  gooeyPx = 18,
  edgePx = 56,
  sweepAngle = 0,
  dropletPx = 12,
  dropletCount = 5,
  dropletStretch = 1,
  dropletScatter = 0.5,
  wobblePx = 10,
  lightAngle = 125,
  bodyStart = 2.4,
  bodyDuration = 1.1,
  bodyBlur = 14,
  bodyRise = 14,
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

      const tl = gsap.timeline()
      tl.add(createScrambleTween(eyebrowEl, '', eyebrow, scrambleOptions), 0)
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
        <RaymarchedSdfHeading
          text={heading}
          progressRef={glProgress}
          steps={marchSteps}
          depthPx={depthPx}
          gooeyPx={gooeyPx}
          edgePx={edgePx}
          angle={sweepAngle}
          dropletPx={dropletPx}
          dropletCount={dropletCount}
          dropletStretch={dropletStretch}
          dropletScatter={dropletScatter}
          wobblePx={wobblePx}
          lightAngle={lightAngle}
          className="max-w-[24ch] text-zinc-100"
        />
        <p data-body className="max-w-[34ch] text-zinc-500 will-change-[opacity,transform,filter]">
          {body}
        </p>
      </div>
    </div>
  )
}

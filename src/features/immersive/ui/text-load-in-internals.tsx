'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { MutableRefObject, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  CHAR_PRESETS,
  createScrambleTween,
  type ScrambleOrder,
  type ScrambleTweenOptions,
} from '@/shared/ui/scramble-text'

gsap.registerPlugin(useGSAP)

/**
 * Shared machinery behind the TextLoadIn variants. Both play the same
 * sequence — eyebrow scrambles in, a GL heading overlay resolves and hands off
 * to the crisp DOM heading, the body sharpens after it — and differ only in
 * which heading renderer draws the overlay and how the beats are spaced. The
 * variants own their heading props and defaults; everything the sequence
 * itself needs lives here.
 */

/** Seconds over which the GL heading crossfades to the crisp DOM heading. */
export const SWAP_DURATION = 0.18

/** Tunables both variants expose, at the values both variants ship with. */
export const TEXT_LOAD_IN_SHARED_DEFAULTS = {
  retriggerOnEnter: false,
  threshold: 0.4,
  scrambleDuration: 1.1,
  scrambleChars: 'upperCase',
  scrambleSpeed: 0.5,
  scrambleOrder: 'leftToRight',
  bodyDuration: 1.1,
  bodyBlur: 14,
  bodyRise: 14,
} as const satisfies Partial<TextLoadInSharedProps>

/** Props every TextLoadIn variant accepts, whatever its heading renderer. */
export type TextLoadInSharedProps = {
  /** Mono label that decodes into place after the static dot marker. */
  eyebrow: string
  /** Headline revealed through the variant's GL heading overlay. */
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
  /** Seconds the heading takes to fully resolve. */
  headingDuration?: number
  /** GSAP ease shaping the heading reveal progress. */
  ease?: string
  /** Seconds the body takes to sharpen. */
  bodyDuration?: number
  /** Starting blur in px for the body. */
  bodyBlur?: number
  /** Starting downward offset in px for the body. */
  bodyRise?: number
  className?: string
}

/** Refs and reveal state a variant threads through the shared timeline. */
export type TextLoadInStage = {
  /** GSAP scope; also the element watched for viewport entry. */
  rootRef: RefObject<HTMLDivElement | null>
  /** Element the eyebrow scramble writes into. */
  eyebrowRef: RefObject<HTMLSpanElement | null>
  /** 0–1 reveal progress the heading renderer samples each frame. */
  glProgress: MutableRefObject<{ value: number }>
  /** Scramble-activity callback slot handed to `createScrambleTween`. */
  notifyRef: MutableRefObject<((scrambling: boolean) => void) | undefined>
  /** Bumped on every replay; 0 means the sequence has not played yet. */
  play: number
  prefersReducedMotion: boolean
}

/**
 * Wires the refs, the reduced-motion query, and the viewport trigger that
 * drives a replay. `play` counts entries plus `replayKey`, so it stays 0 until
 * the block has actually been seen.
 */
export function useTextLoadInStage({
  replayKey = 0,
  retriggerOnEnter,
  threshold,
}: {
  replayKey?: number
  retriggerOnEnter: boolean
  threshold: number
}): TextLoadInStage {
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

  return {
    rootRef,
    eyebrowRef,
    glProgress,
    notifyRef,
    play: entered + replayKey,
    prefersReducedMotion,
  }
}

/** Where each beat of the sequence sits on the timeline, in seconds. */
export type TextLoadInBeats = {
  eyebrowStart: number
  headingStart: number
  bodyStart: number
}

/**
 * Builds the reveal timeline shared by every variant, or paints the static
 * start/end state when there is nothing to play. Call it from the variant's
 * `useGSAP` body; `beats` is the only thing the variants disagree on.
 */
export function buildTextLoadInTimeline({
  beats,
  bodyEase,
  stage,
  ...props
}: {
  beats: TextLoadInBeats
  /** Ease for the body sharpen; defaults to the heading `ease`. */
  bodyEase?: string
  stage: TextLoadInStage
} & Required<
  Pick<
    TextLoadInSharedProps,
    | 'bodyBlur'
    | 'bodyDuration'
    | 'bodyRise'
    | 'ease'
    | 'eyebrow'
    | 'headingDuration'
    | 'scrambleChars'
    | 'scrambleDuration'
    | 'scrambleOrder'
    | 'scrambleSpeed'
  >
>): void {
  const { eyebrowRef, glProgress, notifyRef, play, prefersReducedMotion } = stage
  const eyebrowEl = eyebrowRef.current
  if (!eyebrowEl) return

  if (prefersReducedMotion) {
    eyebrowEl.textContent = props.eyebrow
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
    duration: props.scrambleDuration,
    ease: 'none',
    charPool: CHAR_PRESETS[props.scrambleChars] ?? props.scrambleChars,
    speed: props.scrambleSpeed,
    revealDelay: 0,
    // Full-length churn from the first frame, like the reference capture.
    tweenLength: false,
    order: props.scrambleOrder,
    notify: notifyRef,
  }

  // The GL overlay carries the whole reveal, then hands off to the crisp DOM
  // heading once fully resolved.
  glProgress.current.value = 0
  gsap.set('[data-heading-final]', { autoAlpha: 0 })
  gsap.set('[data-heading-gl]', { autoAlpha: 1 })

  const tl = gsap.timeline()
  tl.add(createScrambleTween(eyebrowEl, '', props.eyebrow, scrambleOptions), beats.eyebrowStart)
  tl.to(
    glProgress.current,
    { value: 1, duration: props.headingDuration, ease: props.ease },
    beats.headingStart,
  )
  tl.to(
    '[data-heading-final]',
    { autoAlpha: 1, duration: SWAP_DURATION, ease: 'none' },
    beats.headingStart + props.headingDuration,
  )
  tl.to('[data-heading-gl]', { autoAlpha: 0, duration: SWAP_DURATION, ease: 'none' }, '<')
  tl.fromTo(
    '[data-body]',
    { opacity: 0, y: props.bodyRise, filter: `blur(${props.bodyBlur}px)` },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: props.bodyDuration,
      ease: bodyEase ?? props.ease,
    },
    beats.bodyStart,
  )
}

/** Dot marker plus the scrambling mono label, with the real text for screen readers. */
export function TextLoadInEyebrow({
  className,
  eyebrow,
  eyebrowRef,
}: {
  className: string
  eyebrow: string
  eyebrowRef: RefObject<HTMLSpanElement | null>
}) {
  return (
    <p className={className}>
      <span aria-hidden className="text-[7px] leading-none">
        ●
      </span>
      <span ref={eyebrowRef} aria-hidden className="inline-block min-h-[1em] whitespace-pre" />
      <span className="sr-only">{eyebrow}</span>
    </p>
  )
}

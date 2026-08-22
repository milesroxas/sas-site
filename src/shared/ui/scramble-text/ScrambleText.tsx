'use client'

import { useGSAP } from '@gsap/react'
import cn from 'clsx'
import gsap from 'gsap'
import type { HTMLAttributes, RefObject } from 'react'
import { useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

gsap.registerPlugin(useGSAP)

/** Order in which characters lock into the target sentence. */
export type ScrambleOrder =
  | 'random'
  | 'simultaneous'
  | 'center'
  | 'edges'
  | 'leftToRight'
  | 'rightToLeft'

export type ScrambleTextProps = {
  /** Phrases to cycle through; scrambles from each to the next. Needs at least 2. */
  phrases: readonly string[]
  /** Seconds per scramble transition. */
  duration?: number
  /** Seconds to hold each phrase before scrambling on. */
  hold?: number
  /** Cycle forever; when false, stop on the last phrase. */
  loop?: boolean
  /** GSAP ease driving the reveal progress. */
  ease?: string
  /** "upperCase" | "lowerCase" | "upperAndLowerCase" or a custom glyph string. */
  chars?: string
  /** How frequently scrambled characters refresh (0.05–2, higher = faster). */
  speed?: number
  /** Seconds to keep everything scrambling before characters start resolving. */
  revealDelay?: number
  /** Tween the string length between phrases instead of jumping. */
  tweenLength?: boolean
  /** How characters resolve: scattered, all-at-once, from center/edges, or a linear sweep. */
  order?: ScrambleOrder
  /** Fires true when a scramble transition starts, false when it settles. */
  onScrambleChange?: (scrambling: boolean) => void
} & HTMLAttributes<HTMLSpanElement>

export const CHAR_PRESETS: Record<string, string> = {
  upperCase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowerCase: 'abcdefghijklmnopqrstuvwxyz',
  upperAndLowerCase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
}

/**
 * Single source of truth for the scramble's tunable defaults. The playground
 * GUI initializes from these; site usages override per call site.
 */
export const SCRAMBLE_TEXT_DEFAULTS = {
  duration: 1.4,
  hold: 1,
  loop: true,
  ease: 'none',
  chars: 'upperCase',
  speed: 0.4,
  revealDelay: 0,
  tweenLength: true,
  order: 'random',
} as const satisfies Partial<ScrambleTextProps>

/**
 * Per-character reveal threshold in (0, 1]; a character locks in once eased
 * progress passes its threshold, so `order` shapes the resolve pattern.
 */
function buildThresholds(length: number, order: ScrambleOrder): number[] {
  if (length === 0) return []
  if (order === 'simultaneous') return new Array(length).fill(1)

  const indices = Array.from({ length }, (_, i) => i)
  const ranks = new Array<number>(length)
  const mid = (length - 1) / 2

  switch (order) {
    case 'leftToRight':
      indices.forEach((i) => {
        ranks[i] = i
      })
      break
    case 'rightToLeft':
      indices.forEach((i) => {
        ranks[i] = length - 1 - i
      })
      break
    case 'center':
      ;[...indices]
        .sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))
        .forEach((charIndex, rank) => {
          ranks[charIndex] = rank
        })
      break
    case 'edges':
      ;[...indices]
        .sort((a, b) => Math.abs(b - mid) - Math.abs(a - mid))
        .forEach((charIndex, rank) => {
          ranks[charIndex] = rank
        })
      break
    default: {
      // random: Fisher–Yates shuffle of ranks
      indices.forEach((i) => {
        ranks[i] = i
      })
      for (let i = length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[ranks[i], ranks[j]] = [ranks[j] as number, ranks[i] as number]
      }
    }
  }

  return ranks.map((rank) => (rank + 1) / length)
}

/**
 * ScrambleTweenOptions assembled from SCRAMBLE_TEXT_DEFAULTS, so one-shot
 * `createScrambleTween` consumers inherit the tuned defaults without
 * restating them. Spread overrides after calling if a usage needs a delta.
 */
export function scrambleTweenDefaults(
  notify: ScrambleTweenOptions['notify'],
): ScrambleTweenOptions {
  const { duration, ease, chars, speed, revealDelay, tweenLength, order } = SCRAMBLE_TEXT_DEFAULTS
  return {
    duration,
    ease,
    charPool: CHAR_PRESETS[chars] ?? chars,
    speed,
    revealDelay,
    tweenLength,
    order,
    notify,
  }
}

export type ScrambleTweenOptions = {
  duration: number
  ease: string
  charPool: string
  speed: number
  revealDelay: number
  tweenLength: boolean
  order: ScrambleOrder
  /** Ref so tweens always call the latest listener without rebuilding. */
  notify: RefObject<((scrambling: boolean) => void) | undefined>
}

/** One from→to scramble tween. Every unresolved character churns every tick. */
export function createScrambleTween(
  el: HTMLElement,
  fromText: string,
  toText: string,
  o: ScrambleTweenOptions,
) {
  const state = { p: 0 }
  const maxLength = Math.max(fromText.length, toText.length)
  const delayFraction = o.duration > 0 ? Math.min(o.revealDelay / o.duration, 0.99) : 0
  const refreshMs = 75 / Math.max(o.speed, 0.05)

  let thresholds: number[] = []
  let glyphs: string[] = []
  let lastRefresh = 0

  const randomGlyph = () =>
    o.charPool ? (o.charPool.charAt(Math.floor(Math.random() * o.charPool.length)) as string) : ' '

  return gsap.to(state, {
    p: 1,
    duration: o.duration,
    ease: o.ease,
    onStart() {
      thresholds = buildThresholds(toText.length, o.order)
      glyphs = Array.from({ length: maxLength }, randomGlyph)
      lastRefresh = 0
      o.notify.current?.(true)
    },
    onUpdate() {
      const p = state.p
      const revealP = Math.max(0, (p - delayFraction) / (1 - delayFraction))
      const length = o.tweenLength
        ? Math.round(fromText.length + (toText.length - fromText.length) * p)
        : toText.length

      const now = performance.now()
      if (now - lastRefresh >= refreshMs) {
        for (let i = 0; i < glyphs.length; i++) glyphs[i] = randomGlyph()
        lastRefresh = now
      }

      let out = ''
      for (let i = 0; i < length; i++) {
        const target = i < toText.length ? toText.charAt(i) : null
        if (target !== null && revealP >= (thresholds[i] ?? 1)) out += target
        else if (target === ' ') out += ' '
        // Past the target's length (longer from-text mid-shrink), keep the
        // outgoing text's spaces: the churn stays word-shaped instead of
        // fusing into one long unbreakable glyph run that wraps badly.
        else if (target === null && fromText.charAt(i) === ' ') out += ' '
        else out += glyphs[i] ?? ''
      }
      el.textContent = out
    },
    onComplete() {
      el.textContent = toText
      o.notify.current?.(false)
    },
  })
}

/**
 * Cycles through phrases with a scramble transition: all characters churn at
 * once and resolve in the configured order (random by default — no linear
 * typed-out sweep). GSAP drives timing/easing; glyph churn and resolve order
 * are handled per tick since ScrambleTextPlugin only reveals linearly.
 * Falls back to the first phrase, static, under prefers-reduced-motion.
 */
export function ScrambleText({
  phrases,
  duration = SCRAMBLE_TEXT_DEFAULTS.duration,
  hold = SCRAMBLE_TEXT_DEFAULTS.hold,
  loop = SCRAMBLE_TEXT_DEFAULTS.loop,
  ease = SCRAMBLE_TEXT_DEFAULTS.ease,
  chars = SCRAMBLE_TEXT_DEFAULTS.chars,
  speed = SCRAMBLE_TEXT_DEFAULTS.speed,
  revealDelay = SCRAMBLE_TEXT_DEFAULTS.revealDelay,
  tweenLength = SCRAMBLE_TEXT_DEFAULTS.tweenLength,
  order = SCRAMBLE_TEXT_DEFAULTS.order,
  onScrambleChange,
  className,
  ...rest
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const notifyRef = useRef(onScrambleChange)
  notifyRef.current = onScrambleChange

  useGSAP(
    () => {
      const el = ref.current
      if (!el || phrases.length < 2 || prefersReducedMotion) return

      // Deterministic start regardless of what a reverted run left behind.
      el.textContent = phrases[0] ?? ''
      // A rebuild can kill a mid-flight tween before its onComplete fires.
      notifyRef.current?.(false)

      const options: ScrambleTweenOptions = {
        duration,
        ease,
        charPool: CHAR_PRESETS[chars] ?? chars,
        speed,
        revealDelay,
        tweenLength,
        order,
        notify: notifyRef,
      }

      const tl = gsap.timeline({ repeat: loop ? -1 : 0 })
      const steps = loop ? phrases.length : phrases.length - 1
      for (let i = 0; i < steps; i++) {
        const fromText = phrases[i % phrases.length] ?? ''
        const toText = phrases[(i + 1) % phrases.length] ?? ''
        tl.add(createScrambleTween(el, fromText, toText, options), `+=${hold}`)
      }
    },
    {
      dependencies: [
        phrases.join('\u001f'),
        duration,
        hold,
        loop,
        ease,
        chars,
        speed,
        revealDelay,
        tweenLength,
        order,
        prefersReducedMotion,
      ],
      revertOnUpdate: true,
    },
  )

  return (
    <span ref={ref} className={cn('inline-block', className)} {...rest}>
      {phrases[0] ?? ''}
    </span>
  )
}

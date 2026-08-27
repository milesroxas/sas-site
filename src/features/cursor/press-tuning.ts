'use client'

import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

/**
 * The ring's press cadence is the site's press cadence. `--press-duration`,
 * `--press-ease`, `--press-release-duration` and `--press-release-ease`
 * (globals.css) already drive the `pressable` utility on every button and card,
 * so the ring reads the same tokens rather than restating them: press a link
 * and its surface and the ring compress and spring back on one clock.
 *
 * Amplitude is not shared — that is per object. The surface uses
 * `--press-scale`; the ring uses `CURSOR_DEFAULTS.pressScale` (see variants.ts),
 * which compresses a touch deeper because a thin ~60px outline moving 3% would
 * shift its edge by under a pixel.
 */

gsap.registerPlugin(CustomEase)

export type PressTuning = {
  duration: number
  ease: string | gsap.EaseFunction
  releaseDuration: number
  releaseEase: string | gsap.EaseFunction
}

/** Mirrors the tokens; used only where they can't be read (jsdom, no stylesheet). */
const FALLBACK: PressTuning = {
  duration: 0.15,
  ease: 'power2.out',
  releaseDuration: 0.35,
  releaseEase: 'back.out(1.5)',
}

const CUBIC_BEZIER = /cubic-bezier\(([^)]+)\)/

function parseSeconds(raw: string, fallback: number): number {
  const value = Number.parseFloat(raw)
  if (!Number.isFinite(value)) return fallback
  return raw.trim().endsWith('ms') ? value / 1000 : value
}

/** A CSS `cubic-bezier(x1,y1,x2,y2)` is the unit cubic path CustomEase draws. */
function parseEase(
  raw: string,
  id: string,
  fallback: string | gsap.EaseFunction,
): string | gsap.EaseFunction {
  const points = CUBIC_BEZIER.exec(raw)?.[1]
    .split(',')
    .map((value) => Number.parseFloat(value))
  if (points?.length !== 4 || points.some((value) => !Number.isFinite(value))) return fallback
  const [x1, y1, x2, y2] = points
  return CustomEase.create(id, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`)
}

/** Reads the press tokens once per overlay mount. */
export function readPressTuning(): PressTuning {
  if (typeof getComputedStyle !== 'function') return FALLBACK
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string) => styles.getPropertyValue(name).trim()
  return {
    duration: parseSeconds(token('--press-duration'), FALLBACK.duration),
    ease: parseEase(token('--press-ease'), 'cursor-press', FALLBACK.ease),
    releaseDuration: parseSeconds(token('--press-release-duration'), FALLBACK.releaseDuration),
    releaseEase: parseEase(
      token('--press-release-ease'),
      'cursor-press-release',
      FALLBACK.releaseEase,
    ),
  }
}

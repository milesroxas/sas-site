import type { SimDirection, SimRun } from './use-sim-navigation'

export type TimelineSegment = {
  label: string
  /** ms from the tap. */
  start: number
  /** ms; `0` plots as a marker (a hard cut). */
  duration: number
  className: string
}

export const DIRECTION_LABEL: Record<SimDirection, string> = {
  forward: 'nav-forward',
  back: 'nav-back',
  lateral: 'nav-lateral',
  'work-open': 'work-open',
}

const DEAD_TIME = 'bg-muted-foreground/40'
const PAGE_FADE = 'bg-muted-foreground/70'
const REVEAL = 'bg-chart-1'
const APPROACH = 'bg-chart-2'
const MASK = 'bg-chart-3'
const BLEND = 'bg-chart-4'

/**
 * The windows a run's recipes actually play, on one clock: dead time first,
 * then every animation track. Concurrent tracks (the reveal and a post-image
 * morph; a takeover's landing and the page's fade in) overlap; the takeover's
 * approach beats chain, each starting where the previous ends, exactly as
 * `work-image-morph.ts` sequences them.
 */
export function simRunSegments(run: SimRun): TimelineSegment[] {
  const wait = run.networkMs + run.serverMs
  const segments: TimelineSegment[] = []
  const push = (label: string, start: number, duration: number, className: string) =>
    segments.push({ label, start, duration, className })

  if (run.networkMs > 0) push('network', 0, run.networkMs, DEAD_TIME)
  if (run.serverMs > 0) push('server render', run.networkMs, run.serverMs, PAGE_FADE)

  if (!run.direction) {
    push('hard cut (untagged)', wait, 0, 'bg-destructive')
    return segments
  }

  if (run.direction === 'work-open') {
    const centerStart = wait + run.exitMs
    const expandStart = centerStart + run.centerMs
    const landingStart = expandStart + run.expandMs
    push('page fade out', wait, run.exitMs, PAGE_FADE)
    push('center', centerStart, run.centerMs, APPROACH)
    push('expand', expandStart, run.expandMs, APPROACH)
    push('page fade in', landingStart, run.enterMs, PAGE_FADE)
    if (run.landing) {
      const { steps, settle } = run.landing
      const holdSeconds = steps[0]?.at ?? settle.at
      push('hold', landingStart, holdSeconds * 1000, MASK)
      for (const step of steps) {
        push(step.axis, landingStart + step.at * 1000, step.duration * 1000, MASK)
      }
      push('dissolve', landingStart + settle.at * 1000, settle.duration * 1000, BLEND)
    }
    return segments
  }

  push('mask reveal', wait, run.revealMs, REVEAL)
  if (run.morph) push('image morph', wait, run.moveMs, BLEND)
  return segments
}

/** When the last track ends; at least 1 so an all-zero run still has an axis. */
export const settledMs = (segments: TimelineSegment[]) =>
  Math.max(1, ...segments.map((segment) => segment.start + segment.duration))

'use client'

import { cn } from '@/utilities/ui'
import type { SimRun } from './use-sim-navigation'

type Segment = {
  label: string
  start: number
  duration: number
  className: string
}

const DIRECTION_LABEL: Record<string, string> = {
  forward: 'nav-forward',
  back: 'nav-back',
  lateral: 'nav-lateral',
}

/**
 * Plots the last simulated navigation as concurrent tracks on one clock:
 * dead time first (network, server), then the animation windows the recipes
 * actually run. The point it makes: the wait happens *before* anything moves.
 */
export function PhaseTimeline({ run }: { run: SimRun | null }) {
  if (!run) {
    return (
      <p className="text-pretty text-xs text-muted-foreground">
        Navigate in the frame above to plot what a tap costs — dead time first, then the animation
        tracks that run on top of each other.
      </p>
    )
  }

  const wait = run.networkMs + run.serverMs
  const segments: Segment[] = []

  if (run.networkMs > 0) {
    segments.push({
      label: 'network',
      start: 0,
      duration: run.networkMs,
      className: 'bg-muted-foreground/40',
    })
  }
  if (run.serverMs > 0) {
    segments.push({
      label: 'server render',
      start: run.networkMs,
      duration: run.serverMs,
      className: 'bg-muted-foreground/70',
    })
  }

  if (run.direction) {
    segments.push({
      label: 'old page fades',
      start: wait,
      duration: run.exitMs,
      className: 'bg-chart-2',
    })
    segments.push({
      label: 'new page fades',
      start: wait + run.exitMs,
      duration: run.enterMs,
      className: 'bg-chart-1',
    })
    if (run.direction !== 'lateral') {
      segments.push({ label: 'slide', start: wait, duration: run.moveMs, className: 'bg-chart-3' })
    }
    if (run.morph) {
      segments.push({
        label: 'image morph',
        start: wait,
        duration: run.moveMs,
        className: 'bg-chart-4',
      })
    }
    if (run.hero) {
      segments.push({
        label: 'hero recede',
        start: wait,
        duration: run.heroMs,
        className: 'bg-chart-5',
      })
    }
  } else {
    segments.push({
      label: 'hard cut — untagged',
      start: wait,
      duration: 0,
      className: 'bg-destructive',
    })
  }

  const settled = Math.max(1, ...segments.map((segment) => segment.start + segment.duration))
  const pct = (ms: number) => `${(ms / settled) * 100}%`

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs text-muted-foreground">
          {run.from} → {run.to} · {run.direction ? DIRECTION_LABEL[run.direction] : 'untagged'}
        </p>
        <p className="flex flex-wrap gap-x-4 font-mono text-xs text-muted-foreground">
          <span>
            tap → first movement:{' '}
            <span className={cn('text-foreground', wait > 300 && 'text-warning')}>{wait}ms</span>
          </span>
          <span>
            settled: <span className="text-foreground">{settled}ms</span>
          </span>
        </p>
      </div>

      <div className="space-y-1">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-right font-mono text-xs text-muted-foreground">
              {segment.label}
            </span>
            <div className="relative h-3.5 flex-1 overflow-hidden rounded-sm bg-muted/40">
              <div
                className={cn('absolute inset-y-0 rounded-sm', segment.className)}
                style={{
                  left: pct(segment.start),
                  width: segment.duration === 0 ? '2px' : pct(segment.duration),
                }}
              />
            </div>
            <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
              {segment.duration}ms
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0" />
          <div className="flex flex-1 justify-between font-mono text-xs text-muted-foreground/60">
            <span>0</span>
            <span>{settled}ms</span>
          </div>
          <span className="w-14 shrink-0" />
        </div>
      </div>
    </div>
  )
}

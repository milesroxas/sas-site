'use client'

import { cn } from '@/utilities/ui'
import { DIRECTION_LABEL, settledMs, simRunSegments } from './sim-timeline'
import type { SimRun } from './use-sim-navigation'

/**
 * Plots the last simulated navigation as tracks on one clock: dead time first
 * (network, server), then the animation windows the recipes actually run. The
 * point it makes: the wait happens *before* anything moves.
 */
export function PhaseTimeline({ run }: { run: SimRun | null }) {
  if (!run) {
    return (
      <p className="text-pretty text-xs text-muted-foreground">
        Navigate in the frame above to plot what a tap costs: dead time first, then the animation
        tracks that run on top of each other.
      </p>
    )
  }

  const wait = run.networkMs + run.serverMs
  const segments = simRunSegments(run)
  const settled = settledMs(segments)
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
            settled: <span className="text-foreground">{Math.round(settled)}ms</span>
          </span>
        </p>
      </div>

      <div className="space-y-1">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <span className="w-36 shrink-0 truncate text-right font-mono text-xs text-muted-foreground">
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
              {Math.round(segment.duration)}ms
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-36 shrink-0" />
          <div className="flex flex-1 justify-between font-mono text-xs text-muted-foreground/60">
            <span>0</span>
            <span>{Math.round(settled)}ms</span>
          </div>
          <span className="w-14 shrink-0" />
        </div>
      </div>
    </div>
  )
}

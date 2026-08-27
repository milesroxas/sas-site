'use client'

import { scrollRevealTrackStarts } from '@/shared/ui/scroll-reveal'

export type TrackBar = { label: string; kind: 'text' | 'media'; start: number; duration: number }

/**
 * The exact placements the reveal timeline builds for a shell: text targets
 * staggered from the text-track start, an optional media target on its own
 * track shifted by the offset. Uses the same math as the timeline itself.
 */
export function revealTrackBars({
  textLabels,
  stagger,
  textDuration,
  media,
}: {
  textLabels: string[]
  stagger: number
  textDuration: number
  media?: { label: string; duration: number; offset: number }
}): TrackBar[] {
  const { textStart, mediaStart } = scrollRevealTrackStarts(media?.offset ?? 0, Boolean(media))
  const bars: TrackBar[] = media
    ? [{ label: media.label, kind: 'media', start: mediaStart, duration: media.duration }]
    : []
  textLabels.forEach((label, index) => {
    bars.push({ label, kind: 'text', start: textStart + index * stagger, duration: textDuration })
  })
  return bars
}

/** One sentence naming the timing relationship the current values produce. */
function timingSummary(bars: TrackBar[]) {
  const media = bars.find((bar) => bar.kind === 'media')
  const text = bars.filter((bar) => bar.kind === 'text')
  const first = text[0]
  const last = text[text.length - 1]
  if (!first || !last) return ''
  if (media) {
    const mediaEnd = media.start + media.duration
    const textEnd = last.start + last.duration
    return first.start < mediaEnd && media.start < textEnd
      ? 'tracks overlap — text settles while the wipe finishes'
      : 'sequential — one track waits for the other'
  }
  const overlapping = text.some(
    (bar, index) => index > 0 && bar.start < text[index - 1].start + text[index - 1].duration,
  )
  return overlapping
    ? 'lines overlap — each starts before the previous settles'
    : 'lines discrete — each waits for the previous to finish'
}

/**
 * Where every target sits on the shared timeline, to scale — the stagger and
 * offset sliders move these bars exactly as they move the entrance above.
 * `summary` overrides the reveal-shaped sentence for timelines that are not
 * two reveal tracks (the hero landing's axis steps). Demo-only.
 */
export function TrackDiagram({
  bars,
  summary = timingSummary(bars),
}: {
  bars: TrackBar[]
  summary?: string
}) {
  const total = Math.max(...bars.map((bar) => bar.start + bar.duration))
  const axisEnd = Math.max(0.5, Math.ceil(total * 2) / 2)
  const ticks = Array.from({ length: Math.round(axisEnd * 2) + 1 }, (_, i) => i / 2)
  return (
    <div className="space-y-3 rounded-md bg-background px-5 py-4 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          timeline
        </p>
        <p className="font-mono text-xs text-muted-foreground">{summary}</p>
      </div>
      <div className="space-y-1.5">
        {bars.map((bar) => (
          <div className="flex items-center gap-3" key={bar.label}>
            <span className="w-20 shrink-0 text-right font-mono text-xs text-muted-foreground">
              {bar.label}
            </span>
            <div className="relative h-2 flex-1 rounded-full bg-muted">
              <div
                className={
                  bar.kind === 'media'
                    ? 'absolute inset-y-0 rounded-full bg-chart-2'
                    : 'absolute inset-y-0 rounded-full bg-chart-4'
                }
                style={{
                  left: `${(bar.start / axisEnd) * 100}%`,
                  width: `${(bar.duration / axisEnd) * 100}%`,
                }}
              />
            </div>
            <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
              {bar.start.toFixed(2)}s
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 shrink-0" />
        <div className="relative h-4 flex-1">
          {ticks.map((tick) => (
            <span
              className="absolute top-0 -translate-x-1/2 font-mono text-xs text-muted-foreground/70"
              key={tick}
              style={{ left: `${(tick / axisEnd) * 100}%` }}
            >
              {tick % 1 === 0 ? `${tick}s` : '·'}
            </span>
          ))}
        </div>
        <span className="w-12 shrink-0" />
      </div>
    </div>
  )
}

import type React from 'react'
import { cn } from '@/utilities/ui'

/**
 * The drawn control panel on the banner's trailing side: a still of the
 * Playground's own GUI, not a control. Nothing here is focusable or wired to
 * the field behind it, and the whole panel is `aria-hidden`.
 *
 * `rest` is where a slider sits; `tuned` is where it glides to while the
 * pointer is over the banner, as if someone had just dialed the look in.
 */
export const SAMPLE_CONTROLS = [
  { label: 'Speed', min: 0, max: 2, rest: 1.2, tuned: 1.62 },
  { label: 'Intensity', min: 0, max: 1, rest: 0.68, tuned: 0.86 },
  { label: 'Bleed', min: 0, max: 1, rest: 0.35, tuned: 0.22 },
] as const

type SampleControl = (typeof SAMPLE_CONTROLS)[number]

const fraction = ({ min, max }: SampleControl, value: number) => (value - min) / (max - min)

/** A row's live handle: the control it draws and the one write that moves it. */
export type SampleControlRow = {
  control: SampleControl
  /** Draw the row at `value`: transforms and one text node, never layout. */
  apply: (value: number) => void
}

/**
 * The rows under `root`, in document order. Fill and knob move by transform
 * (the knob rides a lane as wide as the track, so its percentage is the
 * track's) and the readout is tabular mono in a fixed slot, so a tween over
 * `apply` never touches layout.
 */
export const sampleControlRows = (root: HTMLElement): SampleControlRow[] =>
  Array.from(root.querySelectorAll<HTMLElement>('[data-sample-control]')).flatMap((row, index) => {
    const control = SAMPLE_CONTROLS[index]
    const fill = row.querySelector<HTMLElement>('[data-sample-fill]')
    const lane = row.querySelector<HTMLElement>('[data-sample-lane]')
    const readout = row.querySelector<HTMLElement>('[data-sample-readout]')
    if (!control || !fill || !lane || !readout) return []
    return [
      {
        control,
        apply: (value) => {
          const at = fraction(control, value)
          fill.style.transform = `scaleX(${at})`
          lane.style.transform = `translateX(${at * 100}%)`
          readout.textContent = value.toFixed(2)
        },
      },
    ]
  })

export const SampleControls: React.FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden
    className={cn(
      'flex flex-col gap-4 rounded-lg border border-border bg-foreground/6 p-5',
      className,
    )}
    data-banner-panel
  >
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3.5">
      <span className="text-sm/5 font-medium text-foreground">Streak field</span>
      <span className="font-mono text-xs/4 tracking-widest text-muted-foreground uppercase">
        6 of 8
      </span>
    </div>
    {SAMPLE_CONTROLS.map((control) => {
      const at = fraction(control, control.rest)
      return (
        <div className="flex items-center gap-4" data-sample-control key={control.label}>
          <span className="w-18 shrink-0 text-sm/5 text-muted-foreground">{control.label}</span>
          <span className="relative h-0.5 grow rounded-full bg-foreground/20">
            <span
              className="absolute inset-0 origin-left rounded-full bg-foreground/80"
              data-sample-fill
              style={{ transform: `scaleX(${at})` }}
            />
            <span
              className="absolute inset-0"
              data-sample-lane
              style={{ transform: `translateX(${at * 100}%)` }}
            >
              <span className="absolute top-1/2 left-0 size-2.5 -translate-1/2 rounded-full bg-foreground" />
            </span>
          </span>
          <span
            className="w-10 shrink-0 text-right font-mono text-xs/5 text-foreground tabular-nums"
            data-sample-readout
          >
            {control.rest.toFixed(2)}
          </span>
        </div>
      )
    })}
  </div>
)

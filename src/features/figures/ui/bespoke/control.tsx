'use client'

import { Slider } from '@/components/ui/slider'

/**
 * One labelled slider under a bespoke figure. The drawing tracks the thumb
 * 1:1 with no easing in between: a figure that trails the hand reads as lag,
 * and the slider already owns the only motion here (its thumb).
 *
 * On a phone the label and value share a line and the track takes the full
 * width under them: the track is the touch target, and a third of a phone's
 * column is too short a run to set a value on by thumb. From `sm` the three
 * sit on one row.
 */
export const FigureControl = ({
  format,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  format: (value: number) => string
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  value: number
}) => (
  <div className="flex flex-wrap items-center gap-x-4 text-sm">
    <span className="flex-1 text-muted-foreground sm:w-24 sm:flex-none">{label}</span>
    <Slider
      className="order-last basis-full sm:order-none sm:flex-1 sm:basis-0"
      formatValue={format}
      max={max}
      min={min}
      onValueChange={([next]) => next !== undefined && onChange(next)}
      step={step}
      thumbLabels={[label]}
      value={[value]}
    />
    <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums">{format(value)}</span>
  </div>
)

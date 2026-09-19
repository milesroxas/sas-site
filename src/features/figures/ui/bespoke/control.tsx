'use client'

import { Slider } from '@/components/ui/slider'

/**
 * One labelled slider under a bespoke figure. The drawing tracks the thumb
 * 1:1 with no easing in between: a figure that trails the hand reads as lag,
 * and the slider already owns the only motion here (its thumb).
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
  <div className="flex items-center gap-4 text-sm">
    <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
    <Slider
      className="flex-1"
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

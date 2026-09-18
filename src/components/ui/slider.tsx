'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/utilities/ui'

export type SliderMark = {
  value: number
  /** `default` sits under the track; `zero` crosses it, the origin of a signed range. */
  kind?: 'default' | 'zero'
}

/**
 * The fill ink. `changed` is the one visual a value uses to say it departs
 * from its default; everything else about the row stays the same.
 */
const sliderRangeVariants = cva('absolute h-full rounded-full', {
  variants: {
    variant: {
      default: 'bg-foreground',
      changed: 'bg-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

/**
 * How far past a limit the thumb follows the pointer: the further out, the
 * less it moves, so the edge reads as "there is nothing more here" instead of
 * as a frozen control. Apple's rubber-band with the 0.55 constant.
 */
const rubberband = (overshoot: number, dimension: number, constant = 0.55) =>
  (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))

const percent = (value: number, min: number, max: number) =>
  `${((value - min) / (max - min || 1)) * 100}%`

/**
 * Slider: a 4px track, a fill and an always-visible thumb on Radix, which
 * brings pointer capture, closest-thumb grabs, arrow, Home and End keys and
 * a range pair that cannot cross. What is added on top is the feel:
 *
 * - The thumb grows under the pointer and again while dragging, when a value
 *   bubble rides above it (`formatValue` turns the bubble on).
 * - `marks` draw ticks on the track (a parameter's default, the zero of a
 *   signed range); while dragging the thumb snaps to one within `snapRadius`
 *   px, a magnet that lets a default be hit by hand.
 * - `origin` fills from a point inside the range instead of from the left,
 *   so a signed value reads as a departure from zero.
 * - Past a limit the thumb rubber-bands and springs home on release. A click
 *   on the track eases the thumb to the point instead of teleporting it; a
 *   drag tracks 1:1 with no easing in the way.
 *
 * Motion is the CSS `scale` and `translate` properties, so it composes with
 * the transform Radix owns, and reduced motion drops the travel and keeps
 * the state changes.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  variant,
  marks,
  snapRadius = 4,
  origin,
  formatValue,
  invalid,
  onValueChange,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  style,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> &
  VariantProps<typeof sliderRangeVariants> & {
    marks?: SliderMark[]
    /** Pointer distance, in px, within which the thumb snaps to a mark. */
    snapRadius?: number
    /** Fill from this value instead of from `min`. */
    origin?: number
    /** Text for the bubble above a thumb while it is dragged. Omit for no bubble. */
    formatValue?: (value: number) => string
    /** The value the thumbs hold fails validation elsewhere (a typed range pair that crosses). */
    invalid?: boolean
  }) {
  const [internal, setInternal] = React.useState<number[]>(() =>
    Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min],
  )
  const values = Array.isArray(value) ? value : internal
  const [dragging, setDragging] = React.useState(false)
  const [overshoot, setOvershoot] = React.useState(0)
  // The track bounds double as the "a drag is live" flag for the pointer
  // handlers, which can fire before the state above has re-rendered.
  const bounds = React.useRef<DOMRect | null>(null)
  const root = React.useRef<HTMLSpanElement>(null)

  const change = (next: number[]) => {
    let snapped = next
    if (bounds.current && marks?.length) {
      const radius = (snapRadius / bounds.current.width) * (max - min)
      snapped = next.map((v) => {
        const mark = marks.find((m) => Math.abs(m.value - v) <= radius)
        return mark ? mark.value : v
      })
    }
    if (!Array.isArray(value)) setInternal(snapped)
    onValueChange?.(snapped)
  }

  const settle = () => {
    setDragging(false)
    setOvershoot(0)
    bounds.current = null
  }

  return (
    <SliderPrimitive.Root
      ref={root}
      data-slot="slider"
      data-dragging={dragging || undefined}
      data-variant={variant ?? 'default'}
      data-invalid={invalid || undefined}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      onValueChange={change}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        bounds.current = root.current?.getBoundingClientRect() ?? null
        setDragging(true)
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        const rect = bounds.current
        if (!rect) return
        const over =
          event.clientX < rect.left
            ? event.clientX - rect.left
            : event.clientX > rect.right
              ? event.clientX - rect.right
              : 0
        setOvershoot(over ? rubberband(over, rect.width) : 0)
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        settle()
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        settle()
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event)
        settle()
      }}
      style={{ ...style, '--slider-overshoot': `${overshoot}px` } as React.CSSProperties}
      className={cn(
        'group/slider relative flex w-full touch-none items-center select-none data-[disabled]:opacity-60 data-[orientation=horizontal]:h-9 data-[orientation=horizontal]:min-w-20',
        // The track click and the keyboard step ease the thumb to its point;
        // a drag switches the easing off so the thumb stays on the pointer.
        '[&>span:has(>[data-slot=slider-thumb])]:[transition:left_300ms_var(--ease-out-quint)] data-[dragging]:[&>span:has(>[data-slot=slider-thumb])]:transition-none motion-reduce:[&>span:has(>[data-slot=slider-thumb])]:transition-none',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1 w-full grow overflow-visible rounded-full bg-muted"
      >
        {origin === undefined || values.length !== 1 ? (
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(sliderRangeVariants({ variant }))}
          />
        ) : (
          <span
            data-slot="slider-range"
            className={cn(sliderRangeVariants({ variant }))}
            style={{
              left: percent(Math.min(origin, values[0]), min, max),
              right: `calc(100% - ${percent(Math.max(origin, values[0]), min, max)})`,
            }}
          />
        )}
        {marks?.map((mark) => (
          <span
            key={`${mark.kind ?? 'default'}:${mark.value}`}
            data-slot="slider-mark"
            data-kind={mark.kind ?? 'default'}
            aria-hidden
            className="pointer-events-none absolute w-px bg-muted-foreground data-[kind=default]:top-full data-[kind=default]:mt-[3px] data-[kind=default]:h-1 data-[kind=zero]:-top-[3px] data-[kind=zero]:h-2.5"
            style={{ left: percent(mark.value, min, max) }}
          />
        ))}
      </SliderPrimitive.Track>
      {values.map((thumbValue, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          className={cn(
            'relative block size-3.5 shrink-0 rounded-full bg-foreground shadow-[0_1px_2px_rgb(0_0_0/0.4),0_0_0_1px_rgb(0_0_0/0.15)] outline-none',
            // Grow under the pointer, more in the hand; slide with the
            // rubber-band offset past a limit and spring back on release.
            'translate-x-(--slider-overshoot) [transition:scale_150ms_var(--ease-out-quint),translate_250ms_var(--ease-out-quint)] group-hover/slider:scale-[1.29] group-data-[dragging]/slider:scale-[1.43] group-data-[dragging]/slider:[transition:scale_150ms_var(--ease-out-quint)] group-data-[disabled]/slider:scale-75 group-data-[disabled]/slider:shadow-none group-data-[invalid]/slider:bg-destructive motion-reduce:transition-none',
            'focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
        >
          {formatValue && (
            <span
              data-slot="slider-bubble"
              aria-hidden
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 origin-bottom -translate-x-1/2 scale-95 rounded-sm bg-foreground px-1.5 py-0.5 font-mono text-[11px] leading-4 whitespace-nowrap text-background opacity-0 transition-[opacity,scale] duration-150 ease-out-quint group-data-[dragging]/slider:scale-100 group-data-[dragging]/slider:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none"
            >
              {formatValue(thumbValue)}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider, sliderRangeVariants }

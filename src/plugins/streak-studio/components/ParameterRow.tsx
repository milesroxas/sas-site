'use client'

import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { STREAK_FIELD_DEFAULTS } from '@/features/immersive'
import { STREAK_PARAMETERS } from '@/features/immersive/studio/recipe'
import {
  type Dependency,
  decimals,
  formatValue,
  fromHex,
  optionLabel,
  PARAMETER_COPY,
  type ParameterKey,
  toHex,
} from './parameters'

/**
 * A number typed into the value field. It commits on Enter or blur, clamped
 * to the parameter's range and rounded to its step; Escape reverts; Shift
 * with an arrow steps by ten. The slider is the coarse control, so the field
 * shows no spinner of its own.
 */
function ValueField({
  value,
  min,
  max,
  step = 0.01,
  places,
  disabled,
  invalid,
  label,
  className,
  onCommit,
}: {
  value: number
  min: number
  max: number
  step?: number
  places: number
  disabled?: boolean
  invalid?: boolean
  label: string
  className?: string
  onCommit: (next: number) => void
}) {
  const shown = String(Number(value.toFixed(places)))
  const [draft, setDraft] = useState(shown)
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!editing) setDraft(shown)
  }, [shown, editing])

  const commit = () => {
    setEditing(false)
    const parsed = Number.parseFloat(draft)
    if (!Number.isFinite(parsed)) return setDraft(shown)
    const clamped = Math.min(max, Math.max(min, parsed))
    onCommit(Number(clamped.toFixed(places)))
  }

  const keys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setDraft(shown)
      setEditing(false)
      event.currentTarget.blur()
    } else if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && event.shiftKey) {
      event.preventDefault()
      const direction = event.key === 'ArrowUp' ? 1 : -1
      onCommit(Number(Math.min(max, Math.max(min, value + direction * step * 10)).toFixed(places)))
    }
  }

  return (
    <Input
      variant="value"
      type="number"
      inputMode="decimal"
      className={className}
      aria-label={label}
      aria-invalid={invalid || undefined}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      value={draft}
      onFocus={() => setEditing(true)}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={keys}
    />
  )
}

function ParameterTooltip({
  name,
  changed,
  children,
}: {
  name: ParameterKey
  changed: boolean
  children: ReactNode
}) {
  const spec = STREAK_PARAMETERS[name]
  const copy = PARAMETER_COPY[name]
  const fallback = STREAK_FIELD_DEFAULTS[name]
  const defaultText =
    'color' in spec
      ? toHex(fallback as readonly number[])
      : 'options' in spec
        ? optionLabel(name, String(fallback))
        : formatValue(spec, Number(fallback))
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent variant="panel" side="left" sideOffset={12} collisionPadding={12}>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="flex-1 text-[13px]/4 font-semibold text-foreground">{copy.label}</span>
            <span className="font-mono text-[11px]/3.5 text-muted-foreground">{name}</span>
          </div>
          <p className="text-pretty text-foreground/80">{copy.description}</p>
          <p className="flex gap-3 font-mono text-[11px]/3.5 whitespace-nowrap text-muted-foreground">
            {'min' in spec && (
              <>
                <span>
                  {spec.min}–{spec.max}
                  {copy.unit ? ` ${copy.unit}` : ''}
                </span>
                <span>step {spec.step ?? 0.01}</span>
              </>
            )}
            <span>default {defaultText}</span>
          </p>
          {changed && (
            <p className="flex items-center gap-1.5 text-[11px]/3.5 text-primary">
              <span aria-hidden className="size-1.25 shrink-0 rounded-full bg-primary" />
              Changed from {defaultText}. Option-click the label to reset.
            </p>
          )}
          {'min' in spec && (
            <p className="border-t border-muted pt-2 font-mono text-[10px]/3.5 tracking-[0.02em] text-muted-foreground uppercase">
              ↑↓ step · ⇧ ×10 · ⏎ type
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * The frame every parameter shares: a label column, a control column, and a
 * value column fixed at `--row-value` so that one number, a range pair and a
 * select's readout all end on the same rule and every slider track stops at
 * the same place. A value that departs from its default is marked by a dot
 * before its label, in a slot the label reserves whether or not the dot
 * shows, so the column reads down one rule as values are edited. A row whose
 * control does nothing until another setting changes shows muted, with the
 * reason under it and a button that makes the change.
 */
function RowShell({
  name,
  label,
  changed,
  inactive,
  onReset,
  onFix,
  note,
  children,
}: {
  name: ParameterKey
  label?: string
  changed: boolean
  inactive?: Dependency
  onReset: () => void
  onFix: (fix: Dependency['fix']) => void
  note?: ReactNode
  children: ReactNode
}) {
  const disabled = Boolean(inactive)
  return (
    <div
      data-changed={changed || undefined}
      data-inactive={disabled || undefined}
      className="group/row relative grid grid-cols-[var(--row-label)_minmax(0,1fr)_var(--row-value)] items-center gap-x-2.5"
    >
      <ParameterTooltip name={name} changed={changed}>
        <Label
          htmlFor={`streak-${name}`}
          className="min-h-9 cursor-default gap-1.5 text-xs/4 text-foreground/80 transition-colors group-hover/row:text-foreground group-data-[changed]/row:text-foreground group-data-[inactive]/row:text-muted-foreground/60"
          onClick={(event) => {
            if (event.altKey) {
              event.preventDefault()
              onReset()
            }
          }}
        >
          {/* The marker holds its place whether or not it shows, so a label's
              text starts on the same rule in every row and the column stays
              scannable while values are edited. */}
          <span
            aria-hidden
            className="size-1.5 shrink-0 scale-50 rounded-full bg-primary opacity-0 transition-[opacity,scale] duration-200 ease-out-quint group-data-[changed]/row:scale-100 group-data-[changed]/row:opacity-100 motion-reduce:transition-none"
          />
          {label ?? PARAMETER_COPY[name].label}
        </Label>
      </ParameterTooltip>
      {children}
      {/* The reason wraps on a narrow panel, so the line sizes to its content:
          a fixed height here spills into the row below. */}
      {inactive && (
        <p className="col-span-2 col-start-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pb-1.5 text-[11px]/4 text-muted-foreground">
          {inactive.reason}
          {inactive.fix && (
            <button
              type="button"
              className="pressable cursor-pointer whitespace-nowrap text-muted-foreground underline underline-offset-2 hover:text-foreground"
              onClick={() => onFix(inactive.fix)}
            >
              {inactive.fixLabel}
            </button>
          )}
        </p>
      )}
      {note}
    </div>
  )
}

type RowProps = {
  name: ParameterKey
  value: unknown
  changed: boolean
  inactive?: Dependency
  invalid?: boolean
  /** Small text after a select's value, such as the octave count the code owns. */
  hint?: string
  onChange: (next: unknown) => void
  onReset: () => void
  onFix: (fix: Dependency['fix']) => void
}

export function ParameterRow({
  name,
  value,
  changed,
  inactive,
  invalid,
  hint,
  onChange,
  onReset,
  onFix,
}: RowProps) {
  const spec = STREAK_PARAMETERS[name]
  const copy = PARAMETER_COPY[name]
  const disabled = Boolean(inactive)
  const shell = { name, changed, inactive, onReset, onFix }

  if ('options' in spec) {
    const current = String(value)
    // A discrete control fills the control column, the way the slider and the
    // select beside it do: three controls that stop on the same rule read as
    // one column, and a two-option toggle at that width is still a control
    // rather than a target.
    if (spec.options.length <= 2) {
      return (
        <RowShell {...shell}>
          <ToggleGroup
            type="single"
            variant="segmented"
            size="sm"
            value={current}
            disabled={disabled}
            onValueChange={(next) => next && onChange(next)}
          >
            {spec.options.map((option) => (
              <Tooltip key={option}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value={option}
                    id={option === current ? `streak-${name}` : undefined}
                  >
                    {optionLabel(name, option)}
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {copy.options?.[option]}
                </TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
        </RowShell>
      )
    }
    return (
      <RowShell {...shell}>
        <Select
          value={current}
          disabled={disabled}
          onValueChange={(next) => next && onChange(next)}
        >
          <SelectTrigger size="field" id={`streak-${name}`} className="w-full max-w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {spec.options.map((option) => (
              <SelectItem key={option} value={option} description={copy.options?.[option]}>
                {optionLabel(name, option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* A count the code owns, not a value the editor sets: it belongs in
            the value column with the numbers, not inside the trigger. */}
        {hint && (
          <span className="text-right font-mono text-[11px]/3.5 text-muted-foreground tabular-nums">
            {hint}
          </span>
        )}
      </RowShell>
    )
  }

  if ('color' in spec) {
    const rgb = value as readonly number[]
    const hex = toHex(rgb)
    return (
      <RowShell {...shell}>
        <div className="flex items-center gap-2 justify-self-start">
          <label
            className="relative size-6.5 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input"
            style={{ backgroundColor: hex }}
            aria-label={`${copy.label} swatch`}
          >
            <input
              type="color"
              id={`streak-${name}`}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              value={hex}
              disabled={disabled}
              onChange={(event) => {
                const next = fromHex(event.target.value)
                if (next) onChange(next)
              }}
            />
          </label>
          <HexField value={hex} disabled={disabled} label={copy.label} onCommit={onChange} />
        </div>
      </RowShell>
    )
  }

  const number = Number(value)
  const fallback = Number(STREAK_FIELD_DEFAULTS[name])
  const signed = spec.min < 0
  const places = decimals(spec)
  return (
    <RowShell {...shell}>
      <Slider
        id={`streak-${name}`}
        aria-label={copy.label}
        value={[number]}
        min={spec.min}
        max={spec.max}
        step={spec.step}
        disabled={disabled}
        invalid={invalid}
        variant={changed ? 'changed' : 'default'}
        origin={signed ? 0 : undefined}
        marks={[
          ...(signed ? [{ value: 0, kind: 'zero' as const }] : []),
          ...(changed ? [{ value: fallback }] : []),
        ]}
        formatValue={(v) => formatValue(spec, v)}
        onValueChange={([next]) => onChange(next)}
      />
      <ValueField
        className="w-full"
        value={number}
        min={spec.min}
        max={spec.max}
        step={spec.step}
        places={places}
        disabled={disabled}
        invalid={invalid}
        label={copy.label}
        onCommit={onChange}
      />
    </RowShell>
  )
}

function HexField({
  value,
  disabled,
  label,
  onCommit,
}: {
  value: string
  disabled?: boolean
  label: string
  onCommit: (next: [number, number, number]) => void
}) {
  const [draft, setDraft] = useState(value)
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])
  const commit = () => {
    setEditing(false)
    const next = fromHex(draft)
    if (next) onCommit(next)
    else setDraft(value)
  }
  return (
    <Input
      variant="value"
      className="w-20 text-left"
      aria-label={`${label} hex`}
      spellCheck={false}
      disabled={disabled}
      value={draft.toUpperCase()}
      onFocus={() => setEditing(true)}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          commit()
          event.currentTarget.blur()
        } else if (event.key === 'Escape') {
          setDraft(value)
          setEditing(false)
          event.currentTarget.blur()
        }
      }}
    />
  )
}

/**
 * Min and max length on one track with two thumbs. Dragging cannot cross
 * them; only the fields can, and then the server's own message shows under
 * the row and the offending thumb turns red until it is fixed.
 */
export function LengthRow({
  min,
  max,
  changed,
  error,
  onChange,
  onReset,
  onFix,
}: {
  min: number
  max: number
  changed: boolean
  error?: string
  onChange: (next: { minLength: number; maxLength: number }) => void
  onReset: () => void
  onFix: (fix: Dependency['fix']) => void
}) {
  const spec = STREAK_PARAMETERS.minLength
  if (!('min' in spec)) return null
  const places = decimals(spec)
  const invalid = min > max
  return (
    <RowShell
      name="minLength"
      label="Length"
      changed={changed}
      onReset={onReset}
      onFix={onFix}
      note={
        error ? (
          <p role="alert" className="col-span-2 col-start-2 text-[11px]/3.5 text-destructive">
            {error}
          </p>
        ) : undefined
      }
    >
      <Slider
        id="streak-minLength"
        aria-label="Length range"
        value={invalid ? [max, min] : [min, max]}
        min={spec.min}
        max={spec.max}
        step={spec.step}
        minStepsBetweenThumbs={0}
        invalid={invalid}
        variant={changed ? 'changed' : 'default'}
        formatValue={(v) => formatValue(spec, v)}
        onValueChange={([a, b]) => onChange({ minLength: a, maxLength: b })}
      />
      {/* The pair shares the one value column, so the track above still ends
          where every other track ends. */}
      <div className="flex items-center gap-1">
        <ValueField
          className="min-w-0 flex-1 px-1"
          value={min}
          min={spec.min}
          max={spec.max}
          step={spec.step}
          places={places}
          invalid={invalid}
          label="Min length"
          onCommit={(next) => onChange({ minLength: next, maxLength: max })}
        />
        <ValueField
          className="min-w-0 flex-1 px-1"
          value={max}
          min={spec.min}
          max={spec.max}
          step={spec.step}
          places={places}
          invalid={invalid}
          label="Max length"
          onCommit={(next) => onChange({ minLength: min, maxLength: next })}
        />
      </div>
    </RowShell>
  )
}

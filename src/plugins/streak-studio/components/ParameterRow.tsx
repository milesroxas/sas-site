'use client'

import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
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
  const shown = value.toFixed(places)
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
        ? String(fallback)
        : formatValue(spec, Number(fallback))
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent variant="panel" side="left" sideOffset={12} collisionPadding={12}>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-foreground">{copy.label}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{name}</span>
          </div>
          <p className="text-pretty">{copy.description}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {'min' in spec && (
              <>
                {formatValue(spec, spec.min)} to {formatValue(spec, spec.max)}
                {copy.unit ? ` ${copy.unit}` : ''} · step {spec.step ?? 0.01} ·{' '}
              </>
            )}
            default {defaultText}
          </p>
          {changed && (
            <p className="text-primary">
              Changed from {defaultText}. Option-click the label to reset.
            </p>
          )}
          {'min' in spec && (
            <KbdGroup className="text-[10px] text-muted-foreground">
              <Kbd>↑↓</Kbd> step <Kbd>⇧</Kbd> ×10 <Kbd>↩</Kbd> type in the field
            </KbdGroup>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * The frame every parameter shares: a fixed label column with the tooltip
 * on the label and a dot when the value departs from its default, the
 * control, and the value field. A row whose control does nothing until
 * another setting changes shows muted with the reason under it, and a click
 * anywhere on it applies that change.
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
      className="group/row grid grid-cols-[6.25rem_minmax(0,1fr)_auto] items-center gap-x-2.5"
    >
      <ParameterTooltip name={name} changed={changed}>
        <Label
          htmlFor={`streak-${name}`}
          className="relative min-h-9 cursor-default pl-2.5 text-xs text-foreground/80 transition-colors group-hover/row:text-foreground group-data-[inactive]/row:text-muted-foreground"
          onClick={(event) => {
            if (event.altKey) {
              event.preventDefault()
              onReset()
            }
          }}
        >
          {changed && (
            <span
              aria-hidden
              className="absolute top-1/2 left-0 size-1 -translate-y-1/2 rounded-full bg-primary"
            />
          )}
          {label ?? PARAMETER_COPY[name].label}
        </Label>
      </ParameterTooltip>
      {children}
      {inactive && (
        <p className="col-span-3 -mt-2 mb-1 flex items-baseline gap-1.5 pl-2.5 text-[11px]/4 text-muted-foreground">
          {inactive.reason}
          {inactive.fix && (
            <button
              type="button"
              className="pressable cursor-pointer text-foreground underline underline-offset-2 hover:text-primary"
              onClick={() => onFix(inactive.fix)}
            >
              Turn it on
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
    if (spec.options.length <= 2) {
      return (
        <RowShell {...shell}>
          <ToggleGroup
            type="single"
            variant="segmented"
            className="col-span-2"
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
                    {option.replace(/^./, (c) => c.toUpperCase())}
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
          <SelectTrigger size="sm" id={`streak-${name}`} className="col-span-2 w-full">
            <SelectValue />
            {hint && (
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">{hint}</span>
            )}
          </SelectTrigger>
          <SelectContent align="end">
            {spec.options.map((option) => (
              <SelectItem key={option} value={option} description={copy.options?.[option]}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </RowShell>
    )
  }

  if ('color' in spec) {
    const rgb = value as readonly number[]
    const hex = toHex(rgb)
    return (
      <RowShell {...shell}>
        <div className="col-span-2 flex items-center gap-2">
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
          <span className="ml-auto text-[11px] text-muted-foreground">
            {name === 'ink' ? 'dark ground' : 'light ground'}
          </span>
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
        className="w-14"
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
          <p role="alert" className="col-span-3 -mt-2 mb-1 pl-2.5 text-[11px]/4 text-destructive">
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
      <div className="flex items-center gap-1">
        <ValueField
          className="w-12"
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
          className="w-12"
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

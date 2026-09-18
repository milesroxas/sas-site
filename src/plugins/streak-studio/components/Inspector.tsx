'use client'

import './studio.css'

import { Button, toast, useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { TooltipProvider } from '@/components/ui/tooltip'
import { STREAK_FIELD_DEFAULTS } from '@/features/immersive'
import {
  type CaptureOptions,
  emptyRecipe,
  POSTER_CAPTURE,
  type RecipeDeltas,
  resolveRecipeTuning,
  type StreakRecipe,
  validateRecipe,
} from '@/features/immersive/studio/recipe'
import { LengthRow, ParameterRow } from './ParameterRow'
import {
  DEPENDENCIES,
  GROUPS,
  groupSummary,
  type ParameterKey,
  POINTER_GROUP,
  parameterKeys,
  toHex,
} from './parameters'
import { saveAndQueue } from './publish'
import { sessionKey, studioStore } from './store'

const sameAsDefault = (key: ParameterKey, value: unknown) =>
  JSON.stringify(value) === JSON.stringify(STREAK_FIELD_DEFAULTS[key])

const LENGTH_PAIR: ParameterKey[] = ['minLength', 'maxLength']

/**
 * The Inspector: every authorable parameter as a row in a collapsible group,
 * in the document sidebar so it stays beside the stage on every tab. It is
 * the recipe field's own component: the value it edits is the field's value,
 * so Payload's autosave, versions and validation see every change as they
 * would any other field's.
 */
export const Inspector: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue, errorMessage } = useField<StreakRecipe>({ path })
  const { id } = useDocumentInfo()
  const key = sessionKey(id)
  const recipe = value ?? emptyRecipe()
  const tuning = resolveRecipeTuning(recipe)
  let validation = ''
  try {
    validateRecipe(recipe)
  } catch (error) {
    validation = (error as Error).message
  }

  const update = (next: StreakRecipe) => {
    studioStore.record(key, recipe)
    setValue(next)
  }
  const change = (patch: Partial<RecipeDeltas>) => {
    const deltas = { ...recipe.deltas }
    for (const [name, next] of Object.entries(patch) as [ParameterKey, unknown][]) {
      if (next === undefined || sameAsDefault(name, next)) delete deltas[name]
      else Object.assign(deltas, { [name]: next })
    }
    update({ ...recipe, deltas })
  }
  const reset = (keys: ParameterKey[]) => {
    const deltas = { ...recipe.deltas }
    for (const name of keys) delete deltas[name]
    update({ ...recipe, deltas })
  }
  const changedKeys = Object.keys(recipe.deltas) as ParameterKey[]
  const lengthError = validation.startsWith('Minimum length') ? validation : undefined

  const group = (name: string, initCollapsed: boolean) => {
    const keys = parameterKeys(name)
    const changedCount = keys.filter((k) => changedKeys.includes(k)).length
    return (
      <Group
        key={name}
        name={name}
        summary={
          name === 'Color' ? (
            <span className="flex gap-1">
              {[tuning.ink, tuning.paperInk].map((rgb, index) => (
                <span
                  key={index}
                  aria-hidden
                  className="size-3 rounded-full"
                  style={{ backgroundColor: toHex(rgb) }}
                />
              ))}
            </span>
          ) : (
            groupSummary(name, tuning)
          )
        }
        changed={changedCount}
        initCollapsed={initCollapsed}
        onReset={() => reset(keys)}
      >
        {keys.map((param) => {
          if (param === 'maxLength') return null
          if (param === 'minLength')
            return (
              <LengthRow
                key="length"
                min={tuning.minLength}
                max={tuning.maxLength}
                changed={LENGTH_PAIR.some((k) => changedKeys.includes(k))}
                error={lengthError}
                onChange={change}
                onReset={() => reset(LENGTH_PAIR)}
                onFix={(fix) => fix && change(fix)}
              />
            )
          const dependency = DEPENDENCIES[param]
          return (
            <ParameterRow
              key={param}
              name={param}
              value={tuning[param]}
              changed={changedKeys.includes(param)}
              inactive={dependency && !dependency.active(tuning) ? dependency : undefined}
              hint={
                param === 'noise' && tuning.noise !== 'none'
                  ? `${tuning.noiseOctaves} octaves`
                  : undefined
              }
              onChange={(next) => change({ [param]: next })}
              onReset={() => reset([param])}
              onFix={(fix) => fix && change(fix)}
            />
          )
        })}
      </Group>
    )
  }

  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={600}>
      <div data-streak-studio className="flex flex-col gap-3">
        <Tabs defaultValue="look" className="gap-0">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="look">Look</TabsTrigger>
            <TabsTrigger value="pointer">Pointer</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <span
              className="ml-auto font-mono text-[11px]/3.5 tracking-[0.02em] text-primary tabular-nums"
              aria-live="polite"
            >
              {changedKeys.length ? `${changedKeys.length} changed` : ''}
            </span>
          </TabsList>
          <TabsContent value="look" className="flex flex-col">
            {GROUPS.map((name, index) => group(name, index > 2))}
          </TabsContent>
          <TabsContent value="pointer" className="flex flex-col">
            <p className="py-3 text-xs/4 text-muted-foreground">
              Pointer terms run only where a placement allows them and the editor enabled them.
              Radius 0 turns every term off.
            </p>
            {group(POINTER_GROUP, false)}
          </TabsContent>
          <TabsContent value="export" className="pt-3">
            <ExportPanel recipe={recipe} validation={validation} />
          </TabsContent>
        </Tabs>
        {(validation || errorMessage) && !lengthError && (
          <p role="alert" className="text-xs/relaxed text-destructive">
            {validation || errorMessage}
          </p>
        )}
      </div>
    </TooltipProvider>
  )
}

function Group({
  name,
  summary,
  changed,
  initCollapsed,
  onReset,
  children,
}: {
  name: string
  summary: React.ReactNode
  changed: number
  initCollapsed: boolean
  onReset: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(!initCollapsed)
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-border">
      <CollapsibleTrigger>
        {name}
        <span className="ml-auto flex items-center gap-2.5 text-[11px]/3.5 font-normal whitespace-nowrap text-muted-foreground/70">
          {open ? (
            <>
              {changed > 0 && (
                <span className="font-mono tracking-[0.02em] text-primary tabular-nums">
                  {changed} changed
                </span>
              )}
              {/* biome-ignore lint/a11y/useSemanticElements: a nested button cannot sit inside the trigger button; the span carries the role and keys */}
              <span
                role="button"
                tabIndex={changed ? 0 : -1}
                aria-disabled={!changed || undefined}
                className="pressable cursor-pointer hover:text-foreground aria-disabled:cursor-default aria-disabled:opacity-40"
                onClick={(event) => {
                  event.stopPropagation()
                  if (changed) onReset()
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    if (changed) onReset()
                  }
                }}
              >
                Reset
              </span>
            </>
          ) : (
            <span className="font-mono tabular-nums">{summary}</span>
          )}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-0.5 pb-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * A still of this recipe at its capture frame, filed in Media. The seed and
 * the frame come from the recipe; scale raises resolution without changing
 * the composition. Shares the publish path, so a render is a durable job.
 */
function ExportPanel({ recipe, validation }: { recipe: StreakRecipe; validation: string }) {
  const { id } = useDocumentInfo()
  const { submit } = useForm()
  const [capture, setCapture] = useState<CaptureOptions>({ ...POSTER_CAPTURE, format: 'png' })
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<CaptureOptions>) => setCapture((v) => ({ ...v, ...patch }))
  const megapixels = (capture.width * capture.height * capture.scale ** 2) / 1_000_000

  const render = async () => {
    setBusy(true)
    try {
      if (!id) throw new Error('Save this look first.')
      await saveAndQueue(submit, id, recipe, 'export', capture)
      toast.success('Render queued. The still lands in Media, and in Renders, when it finishes.')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs/relaxed text-muted-foreground">
        The seed and capture frame come from the recipe. Scale raises resolution without changing
        the composition.
      </p>
      <div className="grid grid-cols-[6.25rem_minmax(0,1fr)] items-center gap-x-2.5 gap-y-3">
        <Label htmlFor="streak-capture-width" className="text-xs text-foreground/80">
          Size
        </Label>
        <div className="flex items-center gap-1.5">
          <Input
            id="streak-capture-width"
            variant="value"
            type="number"
            aria-label="Width"
            min={320}
            max={1920}
            value={capture.width}
            onChange={(event) => set({ width: Number(event.target.value) })}
          />
          <span className="text-[11px] text-muted-foreground">×</span>
          <Input
            variant="value"
            type="number"
            aria-label="Height"
            min={320}
            max={1920}
            value={capture.height}
            onChange={(event) => set({ height: Number(event.target.value) })}
          />
          <span className="ml-auto font-mono text-[11px] text-muted-foreground tabular-nums">
            {megapixels.toFixed(1)} MP
          </span>
        </div>
        <Label className="text-xs text-foreground/80">Scale</Label>
        <ToggleGroup
          type="single"
          variant="segmented"
          value={String(capture.scale)}
          onValueChange={(next) => next && set({ scale: Number(next) })}
        >
          <ToggleGroupItem value="1">1×</ToggleGroupItem>
          <ToggleGroupItem value="2">2×</ToggleGroupItem>
        </ToggleGroup>
        <Label className="text-xs text-foreground/80">Ground</Label>
        <ToggleGroup
          type="single"
          variant="segmented"
          value={capture.surface}
          onValueChange={(next) => next && set({ surface: next as CaptureOptions['surface'] })}
        >
          <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          <ToggleGroupItem value="light">Light</ToggleGroupItem>
        </ToggleGroup>
        <Label htmlFor="streak-capture-format" className="text-xs text-foreground/80">
          Format
        </Label>
        <Select
          value={capture.format}
          onValueChange={(next) =>
            set({
              format: next as CaptureOptions['format'],
              transparent: next === 'jpeg' ? false : capture.transparent,
            })
          }
        >
          <SelectTrigger size="sm" id="streak-capture-format" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
          </SelectContent>
        </Select>
        <Label htmlFor="streak-capture-transparent" className="text-xs text-foreground/80">
          Alpha
        </Label>
        <div className="flex items-center gap-2">
          <Checkbox
            id="streak-capture-transparent"
            checked={capture.transparent}
            disabled={capture.format === 'jpeg'}
            onCheckedChange={(checked) => set({ transparent: checked === true })}
          />
          <span className="text-[11px] text-muted-foreground">
            {capture.format === 'jpeg' ? 'JPEG is always filled.' : 'Transparent ground.'}
          </span>
        </div>
      </div>
      <div>
        <Button
          buttonStyle="secondary"
          size="small"
          margin={false}
          disabled={!id || busy || Boolean(validation)}
          onClick={render}
        >
          {busy ? 'Queueing…' : 'Render and save to Media'}
        </Button>
        {!id && (
          <p className="mt-2 text-[11px]/4 text-muted-foreground">Save this look once to render.</p>
        )}
      </div>
    </div>
  )
}

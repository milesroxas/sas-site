'use client'

import './studio.css'

import { Button, toast, useDocumentInfo, useForm } from '@payloadcms/ui'
import { IconChevronsDown, IconChevronsUp } from '@tabler/icons-react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { STREAK_FIELD_DEFAULTS } from '@/features/immersive'
import {
  type CaptureOptions,
  POSTER_CAPTURE,
  type RecipeDeltas,
  resolveRecipeTuning,
  type StreakRecipe,
  validateRecipe,
} from '@/features/immersive/studio/recipe'
import { cn } from '@/utilities/ui'
import { useDraft } from './draft'
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
import { refreshStudio } from './polling'
import { saveAndQueue } from './publish'

const sameAsDefault = (key: ParameterKey, value: unknown) =>
  JSON.stringify(value) === JSON.stringify(STREAK_FIELD_DEFAULTS[key])

const LENGTH_PAIR: ParameterKey[] = ['minLength', 'maxLength']

/**
 * The Inspector: every authorable parameter as a row, grouped into sections
 * on the Look tab and flat on the Pointer tab, in the document sidebar so it
 * stays beside the stage on every tab. It is the recipe field's own
 * component: the value it edits is the field's value, so Payload's autosave,
 * versions and validation see every change as they would any other field's.
 */
export const Inspector: JSONFieldClientComponent = ({ path }) => {
  const { recipe, update, errorMessage } = useDraft(path)
  const tuning = resolveRecipeTuning(recipe)
  let validation = ''
  try {
    validateRecipe(recipe)
  } catch (error) {
    validation = (error as Error).message
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

  // Which sections are open lives here rather than in each group: a document
  // opens with every section shut, so the panel reads as a contents page of
  // what this look is set to before it asks anyone to read a slider; one
  // control can drive them all; and a tab switch, which unmounts the content
  // it leaves, no longer forgets what was open.
  const [tab, setTab] = useState('look')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  // Sections are the Look tab's structure, so the control that works them is
  // the Look tab's too. The label names what the press does from here.
  const allOpen = GROUPS.every((name) => openGroups[name])
  const toggleAll = () =>
    setOpenGroups(allOpen ? {} : Object.fromEntries(GROUPS.map((name) => [name, true])))

  // The rows of a group, without the section around them: the Look tab puts
  // them in a disclosure, the Pointer tab, which is one group, does not.
  const rows = (keys: ParameterKey[]) =>
    keys.map((param) => {
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
    })

  const pointerKeys = parameterKeys(POINTER_GROUP)
  const pointerChanged = pointerKeys.filter((k) => changedKeys.includes(k)).length

  const group = (name: string) => {
    const keys = parameterKeys(name)
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
                  className="size-3 rounded-[3px] ring-1 ring-border ring-inset"
                  style={{ backgroundColor: toHex(rgb) }}
                />
              ))}
            </span>
          ) : (
            groupSummary(name, tuning)
          )
        }
        changed={keys.filter((k) => changedKeys.includes(k)).length}
        open={openGroups[name] ?? false}
        onOpenChange={(next) => setOpenGroups((groups) => ({ ...groups, [name]: next }))}
        onReset={() => reset(keys)}
      >
        {rows(keys)}
      </Group>
    )
  }

  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={600}>
      {/* Payload's sidebar gutter is zeroed for the Studio (studio.css), so
          the panel owns its margins: content never touches the column edge,
          and the change dots live in the left one. The trailing space is the
          scroll region's own: the last row of the last group has to clear the
          bottom of the column rather than end on it. */}
      <div data-streak-studio className="flex flex-col gap-3 px-(--row-gutter) pb-16">
        <Tabs value={tab} onValueChange={setTab} className="gap-0">
          {/* The tab strip is the scroll region's header: it names where you
              are and carries the changed count, so it stays put while the
              groups run under it. The strip is the sticky band and owns the
              hairline; the tab list inside it holds tabs and nothing else,
              so the controls at its right end stay out of the `tablist`. */}
          <div className="sticky top-0 z-20 -mx-(--row-gutter) flex h-(--inspector-tabs) items-center gap-5 border-b border-border bg-background px-(--row-gutter)">
            <TabsList variant="line" className="h-full gap-5 border-b-0">
              <TabsTrigger value="look">Look</TabsTrigger>
              <TabsTrigger value="pointer">Pointer</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            {/* The count and the section control are the strip's right end:
                what has changed, and how much of the panel is open. The
                control is left out of the tabs that have no sections to
                work, rather than shown there dimmed; its slot stays, so the
                count, the one thing on the strip that outlives a tab switch,
                does not move when the tab changes. */}
            <div className="ml-auto flex items-center gap-2.5">
              <span
                className="font-mono text-[11px]/3.5 tracking-[0.02em] text-primary tabular-nums"
                aria-live="polite"
              >
                {changedKeys.length ? `${changedKeys.length} changed` : ''}
              </span>
              <div className="-mr-1 size-6 shrink-0">
                {tab === 'look' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={allOpen ? 'Collapse all sections' : 'Expand all sections'}
                        className="pressable flex size-full cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                        onClick={toggleAll}
                      >
                        {allOpen ? (
                          <IconChevronsUp aria-hidden className="size-3.5" />
                        ) : (
                          <IconChevronsDown aria-hidden className="size-3.5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6}>
                      {allOpen ? 'Collapse all' : 'Expand all'}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
          <TabsContent value="look" className="flex flex-col pt-5">
            {GROUPS.map((name) => group(name))}
          </TabsContent>
          {/* One group's worth of rows, so they are not put behind a
              disclosure: a section that opens onto the whole tab is a click
              between the editor and the only thing there. The tab names the
              section, the paragraph says when the terms run, and Reset keeps
              the place it holds in a section header. */}
          <TabsContent value="pointer" className="flex flex-col pt-5">
            <div className="flex items-start gap-4">
              <p className="min-w-0 flex-1 text-xs/5 text-muted-foreground">
                Pointer terms run only where a placement allows them and the editor enabled them.
                Radius 0 turns every term off.
              </p>
              {/* Hidden rather than absent: the note beside it keeps one wrap
                  whether or not anything has been changed, so a slider does
                  not push every row down the moment it leaves its default. */}
              <button
                type="button"
                aria-label="Reset pointer terms"
                className={cn(
                  'pressable shrink-0 cursor-pointer text-[11px]/5 text-muted-foreground hover:text-foreground',
                  pointerChanged === 0 && 'invisible',
                )}
                onClick={() => reset(pointerKeys)}
              >
                Reset
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-0.5 border-t border-border pt-3">
              {rows(pointerKeys)}
            </div>
          </TabsContent>
          <TabsContent value="export" className="pt-5">
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

/**
 * One section of the Inspector. The header is a row, not a single button:
 * the trigger takes the name and, while the group is closed, the one line
 * that says what it is set to. Reset is a real button beside it, and it is
 * there only when the group has something to reset: an always-present,
 * always-dimmed control is chrome, not an affordance. Nothing counts the
 * changed values: the dots in the gutter already mark them row by row, and
 * the total lives once, in the tab strip. Open is the panel's state, not the
 * section's, so one control in that strip can work them all.
 */
function Group({
  name,
  summary,
  changed,
  open,
  onOpenChange,
  onReset,
  children,
}: {
  name: string
  summary: React.ReactNode
  changed: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onReset: () => void
  children: React.ReactNode
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border-b border-border">
      {/* The section header parks under the tab strip while its own rows
          scroll, and hands over when the next group reaches it — so the name
          of the thing being edited is never off screen. */}
      <div className="sticky top-(--inspector-tabs) z-10 -mx-(--row-gutter) flex items-center gap-2.5 bg-background px-(--row-gutter)">
        <CollapsibleTrigger className="w-auto min-w-0 flex-1 text-[11px]/4 tracking-[0.06em] text-muted-foreground uppercase hover:text-foreground data-[state=open]:text-foreground">
          {name}
          {!open && (
            <span className="ml-auto flex items-center gap-2 font-mono text-[11px]/3.5 font-normal tracking-normal whitespace-nowrap text-muted-foreground normal-case tabular-nums">
              {changed > 0 && (
                <>
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="sr-only">{changed} changed</span>
                </>
              )}
              {summary}
            </span>
          )}
        </CollapsibleTrigger>
        {open && changed > 0 && (
          <button
            type="button"
            aria-label={`Reset ${name}`}
            className="pressable shrink-0 cursor-pointer text-[11px]/3.5 text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            Reset
          </button>
        )}
      </div>
      <CollapsibleContent>
        <div className="flex flex-col gap-0.5 pb-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * A row of the Export panel on the Inspector's own grid: the same label,
 * control and value columns the parameter rows use, so a capture setting and
 * a parameter read as one panel rather than two forms that happen to share a
 * sidebar. The caller places what follows the label: a control in the middle
 * column, optionally a readout in the value column, or one element spanning
 * both.
 */
function ExportRow({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[var(--row-label)_minmax(0,1fr)_var(--row-value)] items-center gap-x-2.5">
      <Label htmlFor={htmlFor} className="min-h-9 cursor-default text-xs/4 text-foreground/80">
        {label}
      </Label>
      {children}
    </div>
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
      refreshStudio()
      toast.success('Render queued. The still lands in Media, and in Renders, when it finishes.')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col">
      <p className="max-w-[58ch] pb-3 text-xs/5 text-muted-foreground">
        The seed and capture frame come from the recipe. Scale raises resolution without changing
        the composition.
      </p>
      <ExportRow label="Size" htmlFor="streak-capture-width">
        <div className="flex items-center gap-1.5">
          <Input
            id="streak-capture-width"
            variant="value"
            className="min-w-0 flex-1"
            type="number"
            aria-label="Width"
            min={320}
            max={1920}
            value={capture.width}
            onChange={(event) => set({ width: Number(event.target.value) })}
          />
          <span className="shrink-0 text-[11px] text-muted-foreground">×</span>
          <Input
            variant="value"
            className="min-w-0 flex-1"
            type="number"
            aria-label="Height"
            min={320}
            max={1920}
            value={capture.height}
            onChange={(event) => set({ height: Number(event.target.value) })}
          />
        </div>
        <span className="text-right font-mono text-[11px]/3.5 text-muted-foreground tabular-nums">
          {megapixels.toFixed(1)} MP
        </span>
      </ExportRow>
      <ExportRow label="Scale">
        <ToggleGroup
          type="single"
          variant="segmented"
          size="sm"
          value={String(capture.scale)}
          onValueChange={(next) => next && set({ scale: Number(next) })}
        >
          <ToggleGroupItem value="1">1×</ToggleGroupItem>
          <ToggleGroupItem value="2">2×</ToggleGroupItem>
        </ToggleGroup>
      </ExportRow>
      <ExportRow label="Ground">
        <ToggleGroup
          type="single"
          variant="segmented"
          size="sm"
          value={capture.surface}
          onValueChange={(next) => next && set({ surface: next as CaptureOptions['surface'] })}
        >
          <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          <ToggleGroupItem value="light">Light</ToggleGroupItem>
        </ToggleGroup>
      </ExportRow>
      <ExportRow label="Format" htmlFor="streak-capture-format">
        <Select
          value={capture.format}
          onValueChange={(next) =>
            set({
              format: next as CaptureOptions['format'],
              transparent: next === 'jpeg' ? false : capture.transparent,
            })
          }
        >
          <SelectTrigger size="field" id="streak-capture-format" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
          </SelectContent>
        </Select>
      </ExportRow>
      {/* The checkbox carries its own sentence, so it takes the control and
          value columns together rather than leaving a number's worth of space
          beside a 16px box. */}
      <ExportRow label="Alpha" htmlFor="streak-capture-transparent">
        <div className="col-span-2 flex items-center gap-2">
          <Checkbox
            id="streak-capture-transparent"
            checked={capture.transparent}
            disabled={capture.format === 'jpeg'}
            onCheckedChange={(checked) => set({ transparent: checked === true })}
          />
          <span className="text-[11px]/4 text-muted-foreground">
            {capture.format === 'jpeg' ? 'JPEG is always filled.' : 'Transparent ground.'}
          </span>
        </div>
      </ExportRow>
      <div className="mt-4 border-t border-border pt-4">
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

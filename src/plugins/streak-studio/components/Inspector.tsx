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
import type { Effect } from '@/features/immersive/studio/effect'
import type { EffectId } from '@/features/immersive/studio/effects'
import {
  type CaptureOptions,
  POSTER_CAPTURE,
  type Recipe,
  resolveRecipeTuning,
  validateRecipe,
} from '@/features/immersive/studio/recipe'
import { cn } from '@/utilities/ui'
import { useDraft } from './draft'
import { ParameterRow, RangePairRow, type RowParameter } from './ParameterRow'
import { EFFECT_COPY, type GroupSummary, lookGroups, parameterKeys, toHex } from './parameters'
import { exportStill } from './publish'

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** A collapsed group's one line: text, or the colours it is set to. */
const summaryNode = (summary: GroupSummary) =>
  typeof summary === 'string' ? (
    summary
  ) : (
    <span className="flex gap-1">
      {summary.swatches.map((rgb, index) => (
        <span
          key={index}
          aria-hidden
          className="size-3 rounded-[3px] ring-1 ring-border ring-inset"
          style={{ backgroundColor: toHex(rgb) }}
        />
      ))}
    </span>
  )

/**
 * The Inspector: every authorable parameter of the look's effect as a row,
 * grouped into sections on the Look tab and flat on the Pointer tab, in the
 * document sidebar so it stays beside the stage on every tab. It reads the
 * rows off the effect's contract and their wording off its copy, so it holds
 * no parameter by name. It is the recipe field's own component: the value it
 * edits is the field's value, so Payload's autosave, versions and validation
 * see every change as they would any other field's.
 */
export const Inspector: JSONFieldClientComponent = ({ path }) => {
  const { effect, effectId, recipe, update, errorMessage } = useDraft(path)
  const copy = EFFECT_COPY[effectId]
  const tuning = resolveRecipeTuning(effect, recipe)
  let validation = ''
  try {
    validateRecipe(effect, recipe)
  } catch (error) {
    validation = (error as Error).message
  }

  const change = (patch: Record<string, unknown>) => {
    const deltas = { ...recipe.deltas }
    for (const [name, next] of Object.entries(patch)) {
      if (next === undefined || sameValue(next, effect.defaults[name])) delete deltas[name]
      else deltas[name] = next
    }
    update({ ...recipe, deltas })
  }
  const reset = (keys: readonly string[]) => {
    const deltas = { ...recipe.deltas }
    for (const name of keys) delete deltas[name]
    update({ ...recipe, deltas })
  }
  const changedKeys = Object.keys(recipe.deltas)
  const parameter = (name: string): RowParameter => ({
    name,
    spec: effect.parameters[name],
    copy: copy.parameters[name],
    fallback: effect.defaults[name],
  })
  // A pair out of order is the one rule the effect checks across parameters,
  // so its message belongs under the pair rather than under the panel.
  const crossed = copy.ranges?.find(({ keys }) => Number(tuning[keys[0]]) > Number(tuning[keys[1]]))

  // Which sections are open lives here rather than in each group: a document
  // opens with every section shut, so the panel reads as a contents page of
  // what this look is set to before it asks anyone to read a slider; one
  // control can drive them all; and a tab switch, which unmounts the content
  // it leaves, no longer forgets what was open.
  const [tab, setTab] = useState('look')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const groups = lookGroups(effect, copy)
  // Sections are the Look tab's structure, so the control that works them is
  // the Look tab's too. The label names what the press does from here.
  const allOpen = groups.every((name) => openGroups[name])
  const toggleAll = () =>
    setOpenGroups(allOpen ? {} : Object.fromEntries(groups.map((name) => [name, true])))

  // The rows of a group, without the section around them: the Look tab puts
  // them in a disclosure, the Pointer tab, which is one group, does not.
  const rows = (keys: string[]) =>
    keys.map((name) => {
      const pair = copy.ranges?.find(({ keys: bounds }) => bounds.includes(name))
      if (pair) {
        const [low, high] = pair.keys
        if (name === high) return null
        return (
          <RangePairRow
            key={pair.label}
            label={pair.label}
            low={{ ...parameter(low), value: Number(tuning[low]) }}
            high={{ ...parameter(high), value: Number(tuning[high]) }}
            changed={pair.keys.some((key) => changedKeys.includes(key))}
            error={pair === crossed ? validation : undefined}
            onChange={change}
            onReset={() => reset(pair.keys)}
          />
        )
      }
      const dependency = copy.dependencies[name]
      return (
        <ParameterRow
          key={name}
          parameter={parameter(name)}
          value={tuning[name]}
          changed={changedKeys.includes(name)}
          inactive={dependency && !dependency.active(tuning) ? dependency : undefined}
          hint={copy.hint?.(name, tuning)}
          onChange={(next) => change({ [name]: next })}
          onReset={() => reset([name])}
          onFix={(fix) => fix && change(fix)}
        />
      )
    })

  const pointerKeys = parameterKeys(effect, copy.pointerGroup)
  const pointerChanged = pointerKeys.filter((k) => changedKeys.includes(k)).length

  const group = (name: string) => {
    const keys = parameterKeys(effect, name)
    return (
      <Group
        key={name}
        name={name}
        summary={summaryNode(copy.summary(name, tuning))}
        changed={keys.filter((k) => changedKeys.includes(k)).length}
        open={openGroups[name] ?? false}
        onOpenChange={(next) => setOpenGroups((state) => ({ ...state, [name]: next }))}
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
      <div data-streak-studio="inspector" className="flex flex-col gap-3 px-(--row-gutter) pb-16">
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
            {groups.map((name) => group(name))}
          </TabsContent>
          {/* One group's worth of rows, so they are not put behind a
              disclosure: a section that opens onto the whole tab is a click
              between the editor and the only thing there. The tab names the
              section, the paragraph says when the terms run, and Reset keeps
              the place it holds in a section header. */}
          <TabsContent value="pointer" className="flex flex-col pt-5">
            <div className="flex items-start gap-4">
              <p className="min-w-0 flex-1 text-xs/5 text-muted-foreground">{copy.pointerNote}</p>
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
            <ExportPanel
              effect={effect}
              effectId={effectId}
              recipe={recipe}
              validation={validation}
            />
          </TabsContent>
        </Tabs>
        {(validation || errorMessage) && !crossed && (
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
 * A still of this recipe at its capture frame, rendered in this browser and
 * filed in Media. The seed and the frame come from the recipe; scale raises
 * resolution without changing the composition.
 */
function ExportPanel({
  effect,
  effectId,
  recipe,
  validation,
}: {
  effect: Effect
  effectId: EffectId
  recipe: Recipe
  validation: string
}) {
  const { id } = useDocumentInfo()
  const { submit } = useForm()
  const [capture, setCapture] = useState<CaptureOptions>(POSTER_CAPTURE)
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<CaptureOptions>) => setCapture((v) => ({ ...v, ...patch }))
  const megapixels = (capture.width * capture.height * capture.scale ** 2) / 1_000_000

  const render = async () => {
    setBusy(true)
    try {
      if (!id) throw new Error('Save this look first.')
      const media = await exportStill(submit, { id, effect: effectId, recipe }, capture)
      // Filed in Media, and handed over now: the editor asked for a file.
      if (media.url) {
        const link = document.createElement('a')
        link.href = media.url
        link.download = media.filename ?? ''
        link.click()
      }
      toast.success('Saved to Media, in the Streak Field Studio folder.')
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
            <SelectItem value="webp">WebP</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
          </SelectContent>
        </Select>
      </ExportRow>
      {/* The checkbox carries its own sentence, so it takes the control and
          value columns together rather than leaving a number's worth of space
          beside a 16px box. */}
      {/* An effect that draws an opaque frame has no alpha to keep: its ground
          drops out in the blend, not in the file. */}
      {!effect.blend && (
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
      )}
      <div className="mt-4 border-t border-border pt-4">
        <Button
          buttonStyle="secondary"
          size="small"
          margin={false}
          disabled={!id || busy || Boolean(validation)}
          onClick={render}
        >
          {busy ? 'Rendering…' : 'Render and save to Media'}
        </Button>
        {!id && (
          <p className="mt-2 text-[11px]/4 text-muted-foreground">Save this look once to render.</p>
        )}
      </div>
    </div>
  )
}

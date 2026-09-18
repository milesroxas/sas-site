'use client'

import './studio.css'

import { useDocumentInfo, useField } from '@payloadcms/ui'
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDice5,
  IconMinus,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react'
import type { UIFieldClientComponent } from 'payload'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { STUDIO_GROUND } from '@/features/immersive'
import {
  emptyRecipe,
  limitStudioTuning,
  recipeFromSnapshot,
  resolveRecipeTuning,
  STREAK_PARAMETERS,
  type StreakRecipe,
  type StreakSnapshot,
  snapshotRecipe,
  starterRecipe,
} from '@/features/immersive/studio/recipe'
import {
  STREAK_LOOK_OPTIONS,
  STREAK_LOOKS,
  type StreakLookId,
  streakPosterSrc,
  VISUAL_PLACEMENTS,
  type VisualPlacement,
} from '@/features/immersive/visual'
import type { StreakRelease } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { PublishButton } from './PublishButton'
import { RECIPE_FIELD } from './paths'
import { useReleases } from './polling'
import { sessionKey, studioStore, useStudioSession } from './store'

const Preview = lazy(() =>
  import('@/features/immersive').then((module) => ({ default: module.StreakStudioPreview })),
)

const SEED_MAX = 2147483647
const FRAME_MAX = 600

const isEditing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

const timeOf = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const clock = (at: number) =>
  new Date(at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

/** Parameters whose effective value differs between two snapshots, seed included. */
const changesBetween = (a: StreakSnapshot, b: StreakSnapshot) =>
  (['seed', ...Object.keys(STREAK_PARAMETERS)] as (keyof StreakSnapshot['dark'])[]).filter(
    (key) => JSON.stringify(a.dark[key]) !== JSON.stringify(b.dark[key]),
  ).length

function IconAction({
  label,
  shortcut,
  disabled,
  onClick,
  children,
}: {
  label: string
  shortcut?: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
        {shortcut && <Kbd>{shortcut}</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * The stage: the Studio tab of a look. A library of starters and versions on
 * the left, the live field in the middle at the chosen placement and ground,
 * and the session controls. Edits happen in the Inspector (the recipe field,
 * in the sidebar); the stage reads the same field and shows the result, or
 * the kept comparison when asked.
 */
export const Stage: UIFieldClientComponent = () => {
  const { value, setValue } = useField<StreakRecipe>({ path: RECIPE_FIELD })
  const { id } = useDocumentInfo()
  const key = sessionKey(id)
  const session = useStudioSession(key)
  const recipe = value ?? emptyRecipe()
  const releases = useReleases(id)
  const [live, setLive] = useState(true)

  let validation = ''
  let snapshot: StreakSnapshot | null = null
  try {
    snapshot = snapshotRecipe(recipe)
  } catch (error) {
    validation = (error as Error).message
  }
  const shown = session.showComparison && session.comparison ? session.comparison : recipe
  const latest = releases[0]
  const sinceRelease =
    snapshot && latest ? changesBetween(snapshot, latest.snapshot as StreakSnapshot) : null
  const requested = resolveRecipeTuning(recipe)
  const budget = snapshot ? limitStudioTuning(snapshot[session.surface], session.placement) : null
  const capped = budget !== null && budget.count < requested.count

  const update = (next: StreakRecipe, restart = false) => {
    studioStore.record(key, recipe)
    setValue(next)
    if (restart) studioStore.restart(key)
  }
  const undo = () => {
    const previous = studioStore.undo(key, recipe)
    if (previous) setValue(previous)
  }
  const redo = () => {
    const next = studioStore.redo(key, recipe)
    if (next) setValue(next)
  }
  const keep = () => {
    studioStore.patch(key, {
      comparison: recipe,
      comparisonLabel: 'Kept comparison',
      comparisonAt: Date.now(),
      showComparison: false,
    })
  }
  const compareRelease = (release: StreakRelease) => {
    try {
      studioStore.patch(key, {
        comparison: recipeFromSnapshot(release.snapshot as StreakSnapshot),
        comparisonLabel: release.title,
        comparisonAt: new Date(release.createdAt).getTime(),
        showComparison: true,
      })
    } catch {
      // A release from an older renderer may hold values outside today's ranges.
    }
  }
  const randomize = () =>
    update({ ...recipe, seed: crypto.getRandomValues(new Uint32Array(1))[0] & SEED_MAX }, true)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
      if (isEditing(event.target)) return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const onStageKey = (event: React.KeyboardEvent) => {
    if (isEditing(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
    switch (event.key) {
      case ' ':
        event.preventDefault()
        studioStore.patch(key, { paused: !session.paused })
        break
      case 'r':
        randomize()
        break
      case 'c':
        if (session.comparison) studioStore.patch(key, { showComparison: !session.showComparison })
        break
    }
  }

  return (
    <TooltipProvider delayDuration={400}>
      <section
        data-streak-studio
        aria-label="Streak Field Studio"
        className="@container flex flex-col rounded-lg border border-border bg-card"
        onKeyDown={onStageKey}
      >
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3">
          <h2 className="m-0 text-sm font-semibold">Streak Field Studio</h2>
          <p className="m-0 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              aria-hidden
              className={cn('size-1.5 rounded-full', latest ? 'bg-warning' : 'bg-muted-foreground')}
            />
            {!id
              ? 'Unsaved. Save once to publish and export.'
              : latest && sinceRelease !== null
                ? sinceRelease
                  ? `Draft, ${sinceRelease} ${sinceRelease === 1 ? 'change' : 'changes'} since ${latest.title}`
                  : `Draft matches ${latest.title}`
                : 'Draft, not yet published'}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center rounded-md border border-border">
              <IconAction
                label="Undo"
                shortcut="⌘Z"
                disabled={!session.history.length}
                onClick={undo}
              >
                <IconArrowBackUp />
              </IconAction>
              <IconAction
                label="Redo"
                shortcut="⇧⌘Z"
                disabled={!session.future.length}
                onClick={redo}
              >
                <IconArrowForwardUp />
              </IconAction>
            </div>
            <ToggleGroup
              type="single"
              variant="segmented"
              className="w-auto"
              value={session.showComparison ? 'kept' : 'draft'}
              onValueChange={(next) =>
                next && studioStore.patch(key, { showComparison: next === 'kept' })
              }
            >
              <ToggleGroupItem value="draft" className="px-3">
                Draft
              </ToggleGroupItem>
              <ToggleGroupItem value="kept" className="px-3" disabled={!session.comparison}>
                Kept
              </ToggleGroupItem>
            </ToggleGroup>
            <PublishButton />
          </div>
        </header>

        <div className="grid grid-cols-1 @3xl:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="flex flex-col border-b border-border @3xl:border-r @3xl:border-b-0">
            <div className="flex items-baseline justify-between px-4 pt-3 pb-2">
              <h3 className="m-0 text-xs font-semibold">Starters</h3>
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {STREAK_LOOK_OPTIONS.length}
              </span>
            </div>
            <ul className="m-0 flex list-none flex-col gap-0.5 px-2 pb-2">
              {STREAK_LOOK_OPTIONS.map((look) => (
                <li key={look.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="pressable flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                        onClick={() => update(starterRecipe(look.value as StreakLookId), true)}
                      >
                        {/* biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin */}
                        <img
                          src={streakPosterSrc(look.value as StreakLookId, session.surface)}
                          alt=""
                          width={44}
                          height={25}
                          loading="lazy"
                          className="h-[25px] w-11 shrink-0 rounded-sm object-cover"
                          style={{ backgroundColor: STUDIO_GROUND[session.surface] }}
                        />
                        <span className="min-w-0 flex-1 truncate">{look.label}</span>
                        <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                          {STREAK_LOOKS[look.value as StreakLookId].motion}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8} className="max-w-56">
                      {look.description}
                    </TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-border px-4 pt-3 pb-2">
              <h3 className="m-0 text-xs font-semibold">Versions</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="xs" onClick={keep}>
                    Keep
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  Keep this draft to compare against while you keep adjusting
                  <Kbd>C</Kbd>
                </TooltipContent>
              </Tooltip>
            </div>
            <ul className="m-0 flex list-none flex-col gap-0.5 px-2 pb-3">
              <li>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                  aria-current={!session.showComparison || undefined}
                  onClick={() => studioStore.patch(key, { showComparison: false })}
                >
                  <span aria-hidden className="size-1.5 rounded-full bg-warning" />
                  <span className="flex-1">Draft</span>
                  <span className="font-mono text-[11px] text-muted-foreground">now</span>
                </button>
              </li>
              {session.comparison && (
                <li>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                    aria-current={session.showComparison || undefined}
                    onClick={() => studioStore.patch(key, { showComparison: true })}
                  >
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full border border-muted-foreground"
                    />
                    <span className="flex-1 truncate">{session.comparisonLabel}</span>
                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      {session.comparisonAt ? clock(session.comparisonAt) : ''}
                    </span>
                  </button>
                </li>
              )}
              {releases.map((release) => (
                <li key={release.id}>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                    onClick={() => compareRelease(release)}
                  >
                    <span aria-hidden className="size-1.5 rounded-full bg-success" />
                    <span className="flex-1 truncate">{release.title}</span>
                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      {timeOf(release.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex min-w-0 flex-col">
            <div
              className="relative"
              style={{
                height: session.placement === 'menu' ? 300 : 450,
                backgroundColor: STUDIO_GROUND[session.surface],
              }}
            >
              <span className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-sm bg-black/50 px-2 py-1 font-mono text-[10px] tracking-wider text-white uppercase">
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 rounded-full',
                    live && !session.paused ? 'bg-success' : 'bg-muted-foreground',
                  )}
                />
                {live ? (session.paused ? 'Paused' : 'Live') : 'Off'} · {session.placement} ·{' '}
                {session.surface}
                {session.showComparison && ' · comparison'}
              </span>
              {live && !validation ? (
                <Suspense
                  fallback={
                    <p className="absolute inset-0 m-0 flex items-center justify-center text-xs text-muted-foreground">
                      Loading preview…
                    </p>
                  }
                >
                  <Preview
                    key={`${session.generation}:${session.placement}`}
                    recipe={shown}
                    placement={session.placement}
                    surface={session.surface}
                    paused={session.paused}
                    generation={session.generation}
                  />
                </Suspense>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground">
                  <p className="m-0 max-w-xs text-center text-pretty">
                    {validation
                      ? validation
                      : 'The live field is off. Turn it on to see the recipe move.'}
                  </p>
                  {!validation && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setLive(true)}>
                      Turn on the live field
                    </Button>
                  )}
                </div>
              )}
            </div>
            {budget && (
              <p
                className={cn(
                  'm-0 flex items-center gap-2 border-t border-border px-4 py-2 font-mono text-[11px] tabular-nums',
                  capped ? 'text-warning' : 'text-muted-foreground',
                )}
              >
                {capped && <span aria-hidden className="size-1.5 rounded-full bg-warning" />}
                {capped
                  ? `${budget.count.toLocaleString()} of ${requested.count.toLocaleString()} particles, capped to the ${session.placement} budget`
                  : `${budget.count.toLocaleString()} particles`}
                {' · '}DPR ≤ {budget.dpr} · {budget.noiseOctaves} octaves · {budget.segments}{' '}
                segment
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
              <ToggleGroup
                type="single"
                variant="segmented"
                className="w-auto"
                value={session.surface}
                onValueChange={(next) =>
                  next && studioStore.patch(key, { surface: next as 'dark' | 'light' })
                }
              >
                <ToggleGroupItem value="dark" className="px-3">
                  Dark
                </ToggleGroupItem>
                <ToggleGroupItem value="light" className="px-3">
                  Light
                </ToggleGroupItem>
              </ToggleGroup>
              <ToggleGroup
                type="single"
                variant="segmented"
                className="w-auto"
                value={session.placement}
                onValueChange={(next) => {
                  if (!next) return
                  studioStore.patch(key, { placement: next as VisualPlacement })
                  studioStore.restart(key)
                }}
              >
                {VISUAL_PLACEMENTS.map((placement) => (
                  <ToggleGroupItem key={placement} value={placement} className="px-3 capitalize">
                    {placement}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <div className="flex items-center rounded-md border border-border">
                <IconAction
                  label={session.paused ? 'Play' : 'Pause'}
                  shortcut="Space"
                  onClick={() => studioStore.patch(key, { paused: !session.paused })}
                >
                  {session.paused ? <IconPlayerPlay /> : <IconPlayerPause />}
                </IconAction>
                <IconAction label="Restart" onClick={() => studioStore.restart(key)}>
                  <IconRefresh />
                </IconAction>
                <IconAction
                  label={live ? 'Turn the live field off' : 'Turn the live field on'}
                  onClick={() => setLive((v) => !v)}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-2 rounded-full',
                      live ? 'bg-success' : 'bg-muted-foreground',
                    )}
                  />
                </IconAction>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <label
                  htmlFor="streak-seed"
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  Seed
                  <Input
                    id="streak-seed"
                    variant="value"
                    type="number"
                    className="w-24 text-left"
                    min={0}
                    max={SEED_MAX}
                    value={recipe.seed}
                    onChange={(event) => {
                      const seed = Math.min(SEED_MAX, Math.max(0, Number(event.target.value) || 0))
                      update({ ...recipe, seed }, true)
                    }}
                  />
                </label>
                <IconAction label="Randomize seed" shortcut="R" onClick={randomize}>
                  <IconDice5 />
                </IconAction>
                <label
                  htmlFor="streak-frame"
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  Frame
                  <span className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Earlier frame"
                      className="rounded-r-none"
                      disabled={recipe.frame <= 1}
                      onClick={() => update({ ...recipe, frame: Math.max(1, recipe.frame - 10) })}
                    >
                      <IconMinus />
                    </Button>
                    <Input
                      id="streak-frame"
                      variant="value"
                      type="number"
                      className="w-14 rounded-none border-x-0 text-center"
                      min={1}
                      max={FRAME_MAX}
                      value={recipe.frame}
                      onChange={(event) =>
                        update({
                          ...recipe,
                          frame: Math.min(FRAME_MAX, Math.max(1, Number(event.target.value) || 1)),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Later frame"
                      className="rounded-l-none"
                      disabled={recipe.frame >= FRAME_MAX}
                      onClick={() =>
                        update({ ...recipe, frame: Math.min(FRAME_MAX, recipe.frame + 10) })
                      }
                    >
                      <IconPlus />
                    </Button>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  )
}

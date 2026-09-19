'use client'

import './studio.css'

import { Link, toast } from '@payloadcms/ui'
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
  canonicalJSON,
  limitStudioTuning,
  resolveRecipeTuning,
  type StreakSnapshot,
  snapshotChanges,
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
import { cn } from '@/utilities/ui'
import { useDraft } from './draft'
import { when } from './History'
import { type PublishedState, useLook } from './look-store'
import { studioStore, useStudioSession } from './store'

const Preview = lazy(() =>
  import('@/features/immersive').then((module) => ({ default: module.StreakStudioPreview })),
)

const SEED_MAX = 2147483647
const FRAME_MAX = 600

const isEditing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

const clock = (at: number) =>
  new Date(at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

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
          className="h-full w-8 rounded-none"
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
 * The stage: the Studio tab of a look. Starters and published history on the
 * left, the live field in the middle at the chosen placement and ground, and
 * the session controls. Edits happen in the Inspector (the recipe field, in
 * the sidebar); the stage reads the same field and shows the result, or a
 * comparison when asked.
 *
 * A field has a draft and what is published. Publish puts the draft on the
 * site, everywhere the field is used; Reset to published and Restore copy a
 * published state back into the draft.
 */
export const Stage: UIFieldClientComponent = () => {
  const { id, key, recipe, setValue, update, restore } = useDraft()
  const session = useStudioSession(key)
  const { live: published, history, uses } = useLook(id)
  const [live, setLive] = useState(true)

  let validation = ''
  let snapshot: StreakSnapshot | null = null
  try {
    snapshot = snapshotRecipe(recipe)
  } catch (error) {
    validation = (error as Error).message
  }
  const shown = session.showComparison && session.comparison ? session.comparison : recipe
  const draftKey = snapshot ? canonicalJSON(snapshot) : ''
  const unchanged = Boolean(published && published.key === draftKey)
  // The published state the draft is identical to, whichever one it is: a
  // restored state matches itself, not "12 changes since published".
  const matched = history.find((state) => state.key === draftKey)
  const sincePublished =
    snapshot && published ? snapshotChanges(snapshot, JSON.parse(published.key)) : null
  const places = uses.filter((use) => !use.historical)
  const requested = resolveRecipeTuning(recipe)
  const budget = snapshot ? limitStudioTuning(snapshot[session.surface], session.placement) : null
  const capped = budget !== null && budget.count < requested.count

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
  const restoreState = (state: PublishedState, label: string) => {
    try {
      restore(state.recipe)
      toast.success(`The draft is back at ${label}. Undo brings your changes back.`)
    } catch {
      toast.error('This state holds values the current ranges no longer accept.')
    }
  }
  const compareState = (state: PublishedState) =>
    studioStore.patch(key, {
      comparison: state.recipe,
      comparisonLabel: when(state.at),
      comparisonAt: new Date(state.at).getTime(),
      showComparison: true,
    })
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
        className="@container flex flex-col overflow-hidden rounded-lg border border-input bg-background"
        onKeyDown={onStageKey}
      >
        <header className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border py-2 pr-4 pl-5">
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-2.5">
            <h2 className="text-[15px]/5 font-semibold">Streak Field Studio</h2>
            {/* The status sets on the title's baseline, so the dot rides in
                the text rather than leading a flex row: a flex container takes
                its baseline from its first item, and an empty 6px span has
                none to give — the line would sit a pixel or two off the
                heading beside it. */}
            <p className="text-xs/4 text-muted-foreground">
              <span
                aria-hidden
                className={cn(
                  'mr-1.5 inline-block size-1.5 shrink-0 rounded-full align-[0.15em]',
                  unchanged ? 'bg-success' : published ? 'bg-warning' : 'bg-muted-foreground',
                )}
              />
              {!id
                ? 'Unsaved. Save once to publish and export.'
                : unchanged
                  ? 'Published, no changes'
                  : matched
                    ? `Draft matches what was published ${when(matched.at)}`
                    : published && sincePublished !== null
                      ? `Draft, ${sincePublished} ${sincePublished === 1 ? 'change' : 'changes'} since published`
                      : 'Draft, not yet published'}
              {/* Where Publish lands. A field is used like a media file: every
                  place that uses it shows what is published. */}
              {id && places.length === 1 && (
                <>
                  {' · used on '}
                  <Link href={places[0].url} prefetch={false} className="underline">
                    {places[0].title}
                  </Link>
                </>
              )}
              {places.length > 1 && ` · used in ${places.length} places`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {published && !unchanged && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => restoreState(published, 'what is published')}
                  >
                    Reset to published
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6} className="max-w-56">
                  Put what is on the site back in the draft. Undo brings your changes back.
                </TooltipContent>
              </Tooltip>
            )}
            <div className="flex h-[34px] items-center divide-x divide-input overflow-hidden rounded-md border border-input">
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
              size="lg"
              className="w-auto"
              value={session.showComparison ? 'compare' : 'draft'}
              onValueChange={(next) =>
                next && studioStore.patch(key, { showComparison: next === 'compare' })
              }
            >
              <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
              <ToggleGroupItem value="compare" disabled={!session.comparison}>
                Compare
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </header>

        <div className="grid grid-cols-1 @[768px]:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="flex flex-col border-b border-border bg-card @[768px]:border-r @[768px]:border-b-0">
            <div className="flex h-10 items-center border-b border-border px-3.5">
              <h3 className="flex-1 text-xs/4 font-semibold tracking-[0.02em]">Starters</h3>
              <span className="text-[11px]/3.5 text-muted-foreground tabular-nums">
                {STREAK_LOOK_OPTIONS.length}
              </span>
            </div>
            <ul className="flex flex-col">
              {STREAK_LOOK_OPTIONS.map((look) => (
                <li key={look.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="flex h-11 w-full cursor-pointer items-center gap-2.5 px-3.5 text-left text-[13px]/4 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => update(starterRecipe(look.value as StreakLookId), true)}
                      >
                        {/* biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin */}
                        <img
                          src={streakPosterSrc(look.value as StreakLookId, session.surface)}
                          alt=""
                          width={44}
                          height={26}
                          loading="lazy"
                          className="h-6.5 w-11 shrink-0 rounded-[3px] border border-input object-cover"
                          style={{ backgroundColor: STUDIO_GROUND[session.surface] }}
                        />
                        <span className="min-w-0 flex-1 truncate">{look.label}</span>
                        <span className="font-mono text-[10px]/3 tracking-[0.04em] text-muted-foreground uppercase">
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
            <div className="flex h-10 items-center border-y border-border px-3.5">
              <h3 className="flex-1 text-xs/4 font-semibold tracking-[0.02em]">Published</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="pressable cursor-pointer text-[11px]/3.5 text-muted-foreground hover:text-foreground"
                    onClick={keep}
                  >
                    Keep
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  Keep this draft to compare against while you keep adjusting
                  <Kbd>C</Kbd>
                </TooltipContent>
              </Tooltip>
            </div>
            <ul className="flex flex-col">
              <li>
                <button
                  type="button"
                  className="flex h-10 w-full cursor-pointer items-center gap-2.5 px-3.5 text-left text-[13px]/4 text-foreground/80 transition-colors hover:bg-muted aria-[current]:text-foreground"
                  aria-current={!session.showComparison || undefined}
                  onClick={() => studioStore.patch(key, { showComparison: false })}
                >
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />
                  <span className="flex-1">Draft</span>
                  <span className="text-[11px]/3.5 text-muted-foreground">now</span>
                </button>
              </li>
              {session.comparison && (
                <li>
                  <button
                    type="button"
                    className="flex h-10 w-full cursor-pointer items-center gap-2.5 px-3.5 text-left text-[13px]/4 text-foreground/80 transition-colors hover:bg-muted aria-[current]:text-foreground"
                    aria-current={session.showComparison || undefined}
                    onClick={() => studioStore.patch(key, { showComparison: true })}
                  >
                    <span
                      aria-hidden
                      className="size-1.5 shrink-0 rounded-full border border-muted-foreground"
                    />
                    <span className="flex-1 truncate">{session.comparisonLabel}</span>
                    <span className="text-[11px]/3.5 text-muted-foreground tabular-nums">
                      {session.comparisonAt ? clock(session.comparisonAt) : ''}
                    </span>
                  </button>
                </li>
              )}
              {/* A published state does two things, so it is two buttons: the
                  row puts it on the stage beside the draft, Restore makes it
                  the draft. Looking never changes anything. */}
              {history.map((state, index) => (
                <li
                  key={state.id}
                  className="flex items-center gap-2 pr-3.5 transition-colors hover:bg-muted"
                >
                  <button
                    type="button"
                    className="flex h-10 min-w-0 flex-1 cursor-pointer items-center gap-2.5 pl-3.5 text-left text-[13px]/4 text-foreground/80"
                    onClick={() => compareState(state)}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'size-1.5 shrink-0 rounded-full',
                        index === 0 ? 'bg-success' : 'border border-muted-foreground',
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate tabular-nums">{when(state.at)}</span>
                    {/* The filled dot is what is on the site; the column is too
                        narrow to say so in words beside a date and Restore. */}
                    {state.key === draftKey && (
                      <span className="shrink-0 text-[11px]/3.5 text-muted-foreground">
                        matches draft
                      </span>
                    )}
                  </button>
                  {state.key !== draftKey && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="pressable shrink-0 cursor-pointer text-[11px]/3.5 text-muted-foreground hover:text-foreground"
                          onClick={() => restoreState(state, when(state.at))}
                        >
                          Restore
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8} className="max-w-56">
                        Make these settings the draft. The site changes when you publish.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex min-w-0 flex-col">
            <div
              className="relative"
              style={{
                height: session.placement === 'menu' ? 300 : 495,
                backgroundColor: STUDIO_GROUND[session.surface],
              }}
            >
              <span className="pointer-events-none absolute top-3 left-3 z-10 flex h-6 items-center gap-1.5 rounded-full bg-background/70 pr-2.5 pl-2 font-mono text-[11px]/3.5 tracking-[0.04em] text-foreground uppercase backdrop-blur-xs">
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 rounded-full',
                    live && !session.paused ? 'bg-primary' : 'bg-muted-foreground',
                  )}
                />
                {live ? (session.paused ? 'Paused' : 'Live') : 'Off'} · {session.placement} ·{' '}
                {session.surface}
                {session.showComparison && ' · comparison'}
              </span>
              {live && !validation ? (
                <Suspense
                  fallback={
                    <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
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
                    showStats={false}
                  />
                </Suspense>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground">
                  <p className="max-w-xs text-center text-pretty">
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
              {/* The readout sits over the field it describes, so it takes the
                  same plate as the placement badge: over a live streak field,
                  bare text is not readable at any ink. */}
              {budget && (
                <p
                  className={cn(
                    'pointer-events-none absolute bottom-3 left-3 z-10 flex max-w-[calc(100%-24px)] items-start gap-1.5 rounded-full bg-background/70 py-1 pr-2.5 pl-2 font-mono text-[11px]/3.5 tracking-[0.02em] backdrop-blur-xs tabular-nums',
                    capped ? 'text-warning' : 'text-muted-foreground',
                  )}
                >
                  {capped && (
                    <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-warning" />
                  )}
                  <span>
                    {capped
                      ? `${budget.count.toLocaleString()} of ${requested.count.toLocaleString()} particles, capped to the ${session.placement} budget`
                      : `${budget.count.toLocaleString()} particles`}
                    {' · '}DPR ≤ {budget.dpr} · {budget.noiseOctaves} octaves · {budget.segments}{' '}
                    segment
                  </span>
                </p>
              )}
            </div>
            <div className="flex min-h-14 flex-wrap items-center gap-4 border-t border-border px-4 py-3">
              <ToggleGroup
                type="single"
                variant="segmented"
                className="w-auto"
                value={session.surface}
                onValueChange={(next) =>
                  next && studioStore.patch(key, { surface: next as 'dark' | 'light' })
                }
              >
                <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
                <ToggleGroupItem value="light">Light</ToggleGroupItem>
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
                  <ToggleGroupItem key={placement} value={placement} className="capitalize">
                    {placement}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <div className="flex h-[30px] items-center divide-x divide-input overflow-hidden rounded-md border border-input">
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
              <div className="ml-auto flex flex-wrap items-center gap-4">
                <label
                  htmlFor="streak-seed"
                  className="flex items-center gap-2 text-xs/4 text-muted-foreground"
                >
                  Seed
                  <span className="flex h-[30px] items-center divide-x divide-input overflow-hidden rounded-md border border-input">
                    <Input
                      id="streak-seed"
                      variant="value"
                      type="number"
                      className="h-full w-23 rounded-none border-0 px-2.5 text-left"
                      min={0}
                      max={SEED_MAX}
                      value={recipe.seed}
                      onChange={(event) => {
                        const seed = Math.min(
                          SEED_MAX,
                          Math.max(0, Number(event.target.value) || 0),
                        )
                        update({ ...recipe, seed }, true)
                      }}
                    />
                    <IconAction label="Randomize seed" shortcut="R" onClick={randomize}>
                      <IconDice5 />
                    </IconAction>
                  </span>
                </label>
                <label
                  htmlFor="streak-frame"
                  className="flex items-center gap-2 text-xs/4 text-muted-foreground"
                >
                  Frame
                  <span className="flex h-[30px] items-center divide-x divide-input overflow-hidden rounded-md border border-input">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Earlier frame"
                      className="h-full w-6.5 rounded-none"
                      disabled={recipe.frame <= 1}
                      onClick={() => update({ ...recipe, frame: Math.max(1, recipe.frame - 10) })}
                    >
                      <IconMinus />
                    </Button>
                    <Input
                      id="streak-frame"
                      variant="value"
                      type="number"
                      className="h-full w-12 rounded-none border-0 text-center"
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
                      variant="ghost"
                      size="icon"
                      aria-label="Later frame"
                      className="h-full w-6.5 rounded-none"
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

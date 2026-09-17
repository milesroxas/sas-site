'use client'

import './studio.scss'

import { useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { STREAK_FIELD_DEFAULTS } from '@/features/immersive'
import {
  type CaptureOptions,
  emptyRecipe,
  POSTER_CAPTURE,
  type RecipeDeltas,
  STREAK_PARAMETERS,
  type StreakRecipe,
  snapshotRecipe,
  starterRecipe,
  validateRecipe,
} from '@/features/immersive/studio/recipe'
import { STREAK_LOOK_OPTIONS, type StreakLookId } from '@/features/immersive/visual/looks'
import type { VisualPlacement } from '@/features/immersive/visual/placement'
import type { StreakRender } from '@/payload-types'
import { saveAndQueue } from './publish'

const Preview = lazy(() =>
  import('@/features/immersive').then((module) => ({ default: module.StreakStudioPreview })),
)
const groups = [...new Set(Object.values(STREAK_PARAMETERS).map((spec) => spec.group))]
const label = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase())
const toHex = (rgb: readonly number[]) =>
  `#${rgb
    .map((n) =>
      Math.round(n * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`

export const Studio: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue, errorMessage } = useField<StreakRecipe>({ path })
  const { id } = useDocumentInfo()
  const { submit } = useForm()
  const recipe = value ?? emptyRecipe()
  const history = useRef<StreakRecipe[]>([])
  const future = useRef<StreakRecipe[]>([])
  const [generation, setGeneration] = useState(0)
  const [surface, setSurface] = useState<'dark' | 'light'>('dark')
  const [placement, setPlacement] = useState<VisualPlacement>('hero')
  const [paused, setPaused] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [jobs, setJobs] = useState<StreakRender[]>([])
  const [capture, setCapture] = useState<CaptureOptions>({ ...POSTER_CAPTURE, format: 'png' })
  const [comparison, setComparison] = useState<StreakRecipe | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  let validation = ''
  try {
    validateRecipe(recipe)
  } catch (error) {
    validation = (error as Error).message
  }

  const update = (next: StreakRecipe) => {
    history.current = [...history.current.slice(-49), recipe]
    future.current = []
    setValue(next)
  }
  const change = (key: keyof RecipeDeltas, next: unknown) => {
    const deltas = { ...recipe.deltas }
    if (JSON.stringify(next) === JSON.stringify(STREAK_FIELD_DEFAULTS[key])) delete deltas[key]
    else Object.assign(deltas, { [key]: next })
    update({ ...recipe, deltas })
  }
  const refresh = useCallback(async () => {
    if (!id) return
    const response = await fetch(
      `/api/streak-renders?where[look][equals]=${id}&sort=-createdAt&limit=10&depth=1`,
    )
    if (response.ok) setJobs((await response.json()).docs)
  }, [id])
  useEffect(() => {
    void refresh().catch(() => {})
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh().catch(() => {})
    }, 5000)
    return () => clearInterval(timer)
  }, [refresh])

  async function publish(kind: 'publish-release' | 'export') {
    setBusy(true)
    setMessage('Saving this revision…')
    try {
      if (!id) throw new Error('Save this look first.')
      const result = await saveAndQueue(submit, id, recipe, kind, capture)
      setMessage(
        result.state === 'complete'
          ? 'This revision is already published and available in visual slots.'
          : 'Queued. You can close this page; the worker will finish the render.',
      )
      await refresh()
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function jobAction(job: StreakRender, action: 'retry' | 'cancel') {
    try {
      const response = await fetch(`/api/streak-renders/${job.id}/${action}`, { method: 'POST' })
      if (!response.ok) throw new Error(`Could not ${action} this job.`)
      await refresh()
    } catch (error) {
      setMessage(String(error))
    }
  }

  return (
    <section
      className="streak-studio"
      aria-label="Streak Field Studio"
      style={{
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: 8,
        padding: 20,
        marginBlock: 24,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Streak Field Studio</h2>
        <button
          type="button"
          disabled={!id || busy || Boolean(validation)}
          onClick={() => publish('publish-release')}
        >
          {busy ? 'Saving…' : 'Publish release'}
        </button>
        <button type="button" onClick={() => setEnabled((v) => !v)}>
          {enabled ? 'Close live preview' : 'Open live preview'}
        </button>
      </div>
      {!id && <p>Save this new look once to enable publishing and exports.</p>}
      <p>
        Drafts autosave. Publish generates light and dark posters, then makes an immutable release
        available across your team. Page selections stay pinned.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <label>
          Starter{' '}
          <select
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                update(starterRecipe(event.target.value as StreakLookId))
                setGeneration((n) => n + 1)
              }
            }}
          >
            <option value="">Choose a starting look</option>
            {STREAK_LOOK_OPTIONS.map((look) => (
              <option key={look.value} value={look.value}>
                {look.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!history.current.length}
          onClick={() => {
            const previous = history.current.pop()
            if (previous) {
              future.current.push(recipe)
              setValue(previous)
            }
          }}
        >
          Undo
        </button>
        <button
          type="button"
          disabled={!future.current.length}
          onClick={() => {
            const next = future.current.pop()
            if (next) {
              history.current.push(recipe)
              setValue(next)
            }
          }}
        >
          Redo
        </button>
        <button
          type="button"
          onClick={() => {
            setComparison(recipe)
            setMessage('Comparison captured. Toggle it while adjusting your draft.')
          }}
        >
          Keep comparison
        </button>
        <button type="button" disabled={!comparison} onClick={() => setShowComparison((v) => !v)}>
          {showComparison ? 'Show draft' : 'Show comparison'}
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <label>
          Surface{' '}
          <select
            value={surface}
            onChange={(event) => setSurface(event.target.value as 'dark' | 'light')}
          >
            <option>dark</option>
            <option>light</option>
          </select>
        </label>
        <label>
          Placement{' '}
          <select
            value={placement}
            onChange={(event) => {
              setPlacement(event.target.value as VisualPlacement)
              setGeneration((n) => n + 1)
            }}
          >
            {['hero', 'block', 'menu', 'card'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => setPaused((v) => !v)}>
          {paused ? 'Play' : 'Pause'}
        </button>
        <button type="button" onClick={() => setGeneration((n) => n + 1)}>
          Restart
        </button>
        <label>
          Seed{' '}
          <input
            type="number"
            min={0}
            max={2147483647}
            value={recipe.seed}
            onChange={(event) => {
              update({ ...recipe, seed: Number(event.target.value) })
              setGeneration((n) => n + 1)
            }}
            style={{ width: 125 }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            update({ ...recipe, seed: crypto.getRandomValues(new Uint32Array(1))[0] & 2147483647 })
            setGeneration((n) => n + 1)
          }}
        >
          Randomize seed
        </button>
        <label>
          Capture frame{' '}
          <input
            type="number"
            min={1}
            max={600}
            value={recipe.frame}
            onChange={(event) => update({ ...recipe, frame: Number(event.target.value) })}
            style={{ width: 75 }}
          />
        </label>
      </div>
      {enabled && !validation && (
        <div style={{ height: placement === 'menu' ? 300 : 450, marginBottom: 20 }}>
          <Suspense fallback={<p>Loading preview…</p>}>
            <Preview
              key={`${generation}:${placement}`}
              recipe={showComparison && comparison ? comparison : recipe}
              placement={placement}
              surface={surface}
              paused={paused}
              generation={generation}
            />
          </Suspense>
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {groups.map((group) => (
          <details
            key={group}
            open={group === 'Composition'}
            style={{ border: '1px solid var(--theme-elevation-150)', padding: 12 }}
          >
            <summary>{group}</summary>
            <button
              type="button"
              style={{ marginBlock: 10 }}
              onClick={() => {
                const deltas = { ...recipe.deltas }
                for (const [key, spec] of Object.entries(STREAK_PARAMETERS))
                  if (spec.group === group) delete deltas[key as keyof RecipeDeltas]
                update({ ...recipe, deltas })
              }}
            >
              Reset {group.toLowerCase()}
            </button>
            {Object.entries(STREAK_PARAMETERS)
              .filter(([, spec]) => spec.group === group)
              .map(([key, spec]) => {
                const name = key as keyof RecipeDeltas
                const current = recipe.deltas[name] ?? STREAK_FIELD_DEFAULTS[name]
                return (
                  <label
                    key={key}
                    htmlFor={`${path}-${key}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                      marginBlock: 10,
                    }}
                  >
                    {label(key)}
                    {'options' in spec ? (
                      <select
                        id={`${path}-${key}`}
                        value={String(current)}
                        onChange={(event) => change(name, event.target.value)}
                      >
                        {spec.options.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    ) : 'color' in spec ? (
                      <input
                        type="color"
                        id={`${path}-${key}`}
                        value={toHex(current as readonly number[])}
                        onChange={(event) =>
                          change(
                            name,
                            [1, 3, 5].map(
                              (offset) =>
                                Number.parseInt(event.target.value.slice(offset, offset + 2), 16) /
                                255,
                            ),
                          )
                        }
                      />
                    ) : (
                      <input
                        type="number"
                        id={`${path}-${key}`}
                        min={spec.min}
                        max={spec.max}
                        step={spec.step}
                        value={Number(current)}
                        onChange={(event) => change(name, Number(event.target.value))}
                        style={{ width: 90 }}
                      />
                    )}
                  </label>
                )
              })}
          </details>
        ))}
      </div>
      {(validation || errorMessage) && <p role="alert">{validation || errorMessage}</p>}
      {!validation && (
        <small>
          Light preview includes the shared paper treatment. Production budget:{' '}
          {snapshotRecipe(recipe).dark.count} particles maximum, one segment per stroke. Placement
          limits apply again on the website.
        </small>
      )}
      <details style={{ marginTop: 24 }}>
        <summary>Export artwork</summary>
        <p>
          The seed and capture frame come from this saved recipe. Scale increases resolution without
          changing the logical composition.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {(['width', 'height'] as const).map((key) => (
            <label key={key}>
              {label(key)}{' '}
              <input
                type="number"
                min={320}
                max={1920}
                value={capture[key]}
                onChange={(event) =>
                  setCapture((v) => ({ ...v, [key]: Number(event.target.value) }))
                }
                style={{ width: 90 }}
              />
            </label>
          ))}
          <label>
            Scale{' '}
            <select
              value={capture.scale}
              onChange={(event) => setCapture((v) => ({ ...v, scale: Number(event.target.value) }))}
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
            </select>
          </label>
          <label>
            Surface{' '}
            <select
              value={capture.surface}
              onChange={(event) =>
                setCapture((v) => ({
                  ...v,
                  surface: event.target.value as CaptureOptions['surface'],
                }))
              }
            >
              <option>dark</option>
              <option>light</option>
            </select>
          </label>
          <label>
            Format{' '}
            <select
              value={capture.format}
              onChange={(event) =>
                setCapture((v) => ({
                  ...v,
                  format: event.target.value as CaptureOptions['format'],
                }))
              }
            >
              <option>png</option>
              <option>webp</option>
              <option>jpeg</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={capture.transparent}
              onChange={(event) => setCapture((v) => ({ ...v, transparent: event.target.checked }))}
            />
            Transparent
          </label>
          <button
            type="button"
            disabled={!id || busy || Boolean(validation)}
            onClick={() => publish('export')}
          >
            Render and save to Media
          </button>
        </div>
      </details>
      <p role="status">{message}</p>
      <h3>Recent renders</h3>
      {!jobs.length && <p>No renders yet. Published work appears here automatically.</p>}
      {jobs.map((job) => (
        <div
          key={job.id}
          style={{ borderTop: '1px solid var(--theme-elevation-150)', paddingBlock: 12 }}
        >
          <strong>
            {job.kind === 'publish' ? 'Release' : 'Artwork'} · {job.state}
          </strong>{' '}
          <small>{job.sourceHash.slice(0, 8)}</small>
          {job.error && <p>{job.error}</p>}
          {job.release && (
            <a
              style={{ marginLeft: 12 }}
              href={`/admin/collections/streak-releases/${typeof job.release === 'number' ? job.release : job.release.id}`}
            >
              View release
            </a>
          )}
          {job.output && typeof job.output === 'object' && (
            <a
              style={{ marginLeft: 12 }}
              href={job.output.url ?? undefined}
              download
              target="_blank"
              rel="noreferrer"
            >
              Download artwork
            </a>
          )}
          {job.state === 'failed' && (
            <button type="button" onClick={() => jobAction(job, 'retry')}>
              Retry
            </button>
          )}
          {['queued', 'rendering', 'failed'].includes(job.state) && (
            <button type="button" onClick={() => jobAction(job, 'cancel')}>
              Cancel
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
